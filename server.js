// server.js
import express from "express";
import OpenAI from "openai";
import 'dotenv/config';

import { buildSQL_APPS } from "./sqlBuilder.js";
import { runBigQuery } from "./bigquery.js";

const app = express();
app.use(express.json());

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds
  maxRetries: 3,
  dangerouslyAllowBrowser: false
});
const ASSISTANT_ID = process.env.ASSISTANT_ID;
const PORT = process.env.PORT || 3000;

// ======================
// API: /chat
// ======================
app.post("/chat", async (req, res) => {
  let threadId = null;
  let runId = null;
  
  try {
    const userMsg = req.body.message;
    if (!userMsg) return res.status(400).json({ error: "message is required" });

    console.log("Creating thread...");
    
    // Retry logic for thread creation
    let thread;
    let retries = 3;
    while (retries > 0) {
      try {
        thread = await openai.beta.threads.create();
        threadId = thread.id;
        break;
      } catch (err) {
        retries--;
        console.log(`Thread creation failed, retries left: ${retries}`);
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds before retry
      }
    }
    
    console.log("Thread created:", threadId);

    // 2) append message
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMsg
    });
    console.log("Message added to thread");

    // 3) เริ่ม run with streaming
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: ASSISTANT_ID
    });
    
    runId = run.id;
    console.log("Run completed with status:", run.status, "| Run ID:", runId);

    // 4) Handle tool calls if needed
    if (run.status === "requires_action" && run.required_action?.submit_tool_outputs?.tool_calls) {
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
      console.log("Processing tool calls...");

      const toolOutputs = [];

      for (const toolCall of toolCalls) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const toolName = toolCall.function.name;
          console.log("Tool call:", toolName, args);

          if (toolName === "get_flight_statistics_from_APPS") {
            // แปลง args → SQL
            const sql = buildSQL_APPS(args);
            console.log("Generated SQL:", sql);

            // รัน BigQuery
            const rows = await runBigQuery(sql);
            console.log("Query results:", rows.length, "rows");

            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: JSON.stringify({ sql, rows })
            });
          }
        } catch (toolError) {
          console.error("Tool execution error:", toolError);
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify({ error: toolError.message })
          });
        }
      }

      // Submit tool outputs and poll again
      if (toolOutputs.length > 0) {
        console.log("Submitting tool outputs...");
        console.log("Thread ID:", threadId, "| Run ID:", run.id);
        
        if (!threadId || !run.id) {
          throw new Error(`Missing IDs - threadId: ${threadId}, runId: ${run.id}`);
        }
        
        await openai.beta.threads.runs.submitToolOutputsAndPoll(
          run.id,
          {
            thread_id: threadId,
            tool_outputs: toolOutputs
          }
        );
        console.log("Tool outputs submitted");
      }
    }

    // 5) ดึงคำตอบสุดท้าย
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantMessages = messages.data
      .filter(m => m.role === "assistant")
      .map(m => m.content
        .filter(c => c.type === "text")
        .map(c => c.text.value)
        .join("\n")
      );

    return res.json({
      answer: assistantMessages[0] || "No response",
      threadId: threadId
    });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ 
      error: err.message,
      type: err.constructor.name 
    });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Server is running",
    endpoints: {
      chat: "POST /chat",
      test: "GET /test-openai"
    }
  });
});

// Test OpenAI connection
app.get("/test-openai", async (req, res) => {
  try {
    console.log("Testing OpenAI connection...");
    const models = await openai.models.list();
    res.json({ 
      status: "success", 
      message: "OpenAI connection working",
      modelCount: models.data.length 
    });
  } catch (err) {
    console.error("OpenAI test failed:", err);
    res.status(500).json({ 
      status: "error",
      error: err.message,
      type: err.constructor.name,
      hint: "Check your network connection, firewall, or proxy settings"
    });
  }
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
