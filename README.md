# OpenAI-BigQuery Integration

This project integrates OpenAI's API with Google BigQuery to provide AI-powered query generation and data analysis capabilities.

## Features

- Express.js server for handling chat requests
- OpenAI Assistant integration
- Google BigQuery integration for data queries
- SQL query building functionality

## Prerequisites

- Node.js (v16 or higher)
- Google Cloud Platform account with BigQuery enabled
- OpenAI API account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/eddyElectronics/openai-bigquery.git
cd openai-bigquery
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the project root with the following:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ASSISTANT_ID=your_assistant_id_here
     PORT=3000
     ```

4. Set up Google Cloud service account:
   - Update `service-account-key.json` with your GCP credentials

## Running the Application

Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000` (or your configured PORT).

## API Endpoints

These endpoints are available when running `npm start` (server.js):

### Health Check
```
GET /
```
Returns the server status and available endpoints.

### Test OpenAI Connection
```
GET /test-openai
```
Tests the OpenAI API connection.

### Chat
```
POST /chat
Content-Type: application/json

{
  "message": "your query here"
}
```

**Note**: If using `index.js` directly, the health check is at `GET /health` instead.

## How to Commit Changes from VS Code

VS Code provides multiple ways to commit your changes to Git:

### Method 1: Using the Source Control Panel (Recommended)

1. **Open the Source Control view**:
   - Click the Source Control icon in the left sidebar (branch icon)
   - Or press `Ctrl+Shift+G` (Windows/Linux) or `Cmd+Shift+G` (Mac)

2. **Stage your changes**:
   - You'll see a list of changed files under "Changes"
   - Click the `+` icon next to each file to stage it
   - Or click the `+` icon next to "Changes" to stage all files

3. **Write your commit message**:
   - In the message box at the top, type your commit message
   - First line should be a brief summary (50 characters or less)
   - Press `Enter` for a blank line, then add detailed description if needed

4. **Commit your changes**:
   - Click the checkmark (✓) icon above the message box
   - Or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

5. **Push your changes** (optional):
   - Click the `...` menu in the Source Control panel
   - Select "Push" to push your commits to the remote repository

### Method 2: Using the Command Palette

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Git: Commit" and select it
3. Follow the prompts to stage files and write your commit message

### Method 3: Using the Terminal

1. Open the integrated terminal:
   - Press `` Ctrl+` `` or select "Terminal" → "New Terminal"

2. Use standard Git commands:
```bash
# Check status
git status

# Stage specific files
git add filename.js

# Stage all changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to remote
git push
```

### Best Practices for Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Keep the first line under 50 characters
- Capitalize the first letter
- Don't end with a period
- Use the body to explain what and why, not how

Example:
```
Add BigQuery connection pooling

Implement connection pooling to improve performance
and reduce the number of connections to BigQuery.
This resolves timeout issues under heavy load.
```

## Project Structure

```
openai-bigquery/
├── server.js           # Production server (used by npm start)
├── index.js            # Main module entry point (alternative implementation)
├── bigquery.js         # BigQuery integration
├── sqlBuilder.js       # SQL query builder
├── package.json        # Dependencies and scripts
├── .env                # Environment variables (not committed)
└── service-account-key.json  # GCP credentials (not committed)
```

**Note**: The project has two server implementations:
- `server.js` - The production server used by `npm start` (recommended)
- `index.js` - Alternative implementation with different endpoint structure

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more details on how to contribute to this project.

## License

ISC
