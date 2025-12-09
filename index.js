// index.js
import express from "express";
import OpenAI from "openai";
import "dotenv/config";

// ถ้าคุณมีไฟล์เหล่านี้อยู่แล้ว ให้ uncomment
// ถ้ายังไม่มี ให้คอมเมนต์สองบรรทัดนี้ไว้ก่อนทดสอบ
// import { buildSQL_APPS } from "./sqlBuilder.js";
// import { runBigQuery } from "./bigquery.js";

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.ASSISTANT_ID;
const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn("[WARN] OPENAI_API_KEY is not set in .env");
}
if (!ASSISTANT_ID) {
  console.warn("[WARN] ASSISTANT_ID is not set in .env");
}

// endpoint ง่าย ๆ ไว้เช็คว่า server ยังอยู่
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * POST /chat
 * body: { "message": "..." }
 */
app.post("/chat", async (req, res) => {
  console.log("\n================= NEW REQUEST =================");
  try {
    const userInput = req.body.message;
    console.log("[DEBUG] Incoming /chat, message =", userInput);

    if (!userInput) {
      console.log("[DEBUG] ❌ message missing");
      return res.status(400).json({ error: "message is required" });
    }

    // ------------------------------------------------
    // 1) สร้าง Thread ใหม่
    // ------------------------------------------------
    console.log("[DEBUG] 1) Creating thread...");
    const thread = await client.beta.threads.create();
    const threadId = thread.id;
    console.log("[DEBUG] ✔ Thread created:", threadId);

    // ------------------------------------------------
    // 2) เพิ่มข้อความ user ลงใน thread
    // ------------------------------------------------
    console.log("[DEBUG] 2) Adding user message to thread...");
    await client.beta.threads.messages.create(threadId, {
      role: "user",
      content: userInput,
    });
    console.log("[DEBUG] ✔ Message added to thread");

    // ------------------------------------------------
    // 3) สร้าง Run
    // ------------------------------------------------
    console.log("[DEBUG] 3) Creating run for assistant:", ASSISTANT_ID);
    let run = await client.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
    });
    let runId = run.id;
    console.log("[DEBUG] ✔ Run created:", runId, "for thread:", threadId);

    // ------------------------------------------------
    // 4) Poll สถานะ Run
    // ------------------------------------------------
    console.log("[DEBUG] 4) Start polling run status...");

    while (true) {
      console.log(
        `[DEBUG] Polling: threadId=${threadId}, runId=${runId} ...`
      );

      // ❗❗ จุดสำคัญ: ต้องเป็น (threadId, runId) เท่านั้น
      run = await client.beta.threads.runs.retrieve(threadId, runId);

      console.log("[DEBUG] Current run.status =", run.status);

      if (run.status === "completed") {
        console.log("[DEBUG] ✔ Run completed");
        break;
      }

      if (run.status === "requires_action") {
        console.log("[DEBUG] ⚡ Run requires_action → tool calls");

        const required = run.required_action;
        if (
          !required ||
          !required.submit_tool_outputs ||
          !required.submit_tool_outputs.tool_calls
        ) {
          console.log("[DEBUG] ⚠ requires_action แต่ไม่มี tool_calls");
          break;
        }

        const toolCalls = required.submit_tool_outputs.tool_calls;
        console.log(
          "[DEBUG] toolCalls =",
          JSON.stringify(toolCalls, null, 2)
        );

        const toolOutputs = [];

        for (const call of toolCalls) {
          const fn = call.function;
          const toolName = fn.name;
          const args = JSON.parse(fn.arguments || "{}");

          console.log("[DEBUG] → Tool call name:", toolName);
          console.log("[DEBUG] → Tool args:", args);

          // ตัวอย่าง: handle function ชื่อ get_flight_statistics_from_APPS
          if (toolName === "get_flight_statistics_from_APPS") {
            // ถ้ายังไม่มี sqlBuilder / BigQuery ให้ mock ไว้ก่อน
            // const sql = buildSQL_APPS(args);
            // const rows = await runBigQuery(sql);
            // toolOutputs.push({
            //   tool_call_id: call.id,
            //   output: JSON.stringify({ sql, rows }),
            // });

            // MOCK: ยังไม่ต่อ BigQuery จริง
            const mockResult = {
              note: "This is mock result. BigQuery not wired yet.",
              received_args: args,
            };

            toolOutputs.push({
              tool_call_id: call.id,
              output: JSON.stringify(mockResult),
            });
          } else {
            // unknown tool
            toolOutputs.push({
              tool_call_id: call.id,
              output: JSON.stringify({
                error: `Unknown tool: ${toolName}`,
              }),
            });
          }
        }

        console.log("[DEBUG] Submitting tool outputs back to assistant...");
        // ❗❗ ต้องเป็น (threadId, runId, { tool_outputs })
        await client.beta.threads.runs.submitToolOutputs(threadId, runId, {
          tool_outputs: toolOutputs,
        });
        console.log("[DEBUG] ✔ Tool outputs submitted");

        // กลับไปวน polling status ต่อ
        continue;
      }

      if (["failed", "cancelled", "expired"].includes(run.status)) {
        console.log("[DEBUG] ❌ Run terminated with status:", run.status);
        throw new Error("Run terminated with status: " + run.status);
      }

      // หน่วงเวลาเล็กน้อยก่อนรีเช็ค
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // ------------------------------------------------
    // 5) ดึงข้อความสุดท้ายจาก assistant
    // ------------------------------------------------
    console.log("[DEBUG] 5) Fetching final assistant message...");
    const messages = await client.beta.threads.messages.list(threadId, {
      limit: 10,
    });

    const assistantMessage = messages.data.find(
      (m) => m.role === "assistant"
    );

    let answer = "No response";
    if (assistantMessage && assistantMessage.content?.length) {
      answer = assistantMessage.content
        .map((c) => (c.text ? c.text.value : ""))
        .join("\n");
    }

    console.log("[DEBUG] ✔ Final answer:", answer);
    return res.json({ reply: answer });
  } catch (err) {
    console.error("[ERROR]", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
