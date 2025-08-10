# VibeHero AI Agent Integration Script

A simple Python script that connects AI agents with VibeHero project management. This script automatically monitors your VibeHero project for new tasks and can be easily integrated with AI agents like Claude.

## 🚀 Quick Start

### 1. Copy the Script
Copy `vibehero-agent.py` to your local machine.

### 2. Find Your Project ID
1. Go to your VibeHero project in the browser
2. Look at the URL: `https://vibehero.io/projects/YOUR_PROJECT_ID/board`
3. Copy the project ID from the URL

### 3. Run the Script
```bash
python3 vibehero-agent.py YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your actual project ID.

## 📋 What It Does

The script will:
- ✅ Connect to your VibeHero project
- 🔍 Continuously monitor for new READY tasks
- 📋 Display task details when found
- 💡 Provide integration points for your AI agent

## 🛠 AI Agent Integration

To connect this with your AI agent:

1. **Modify the main loop** in the script where it says "In a real implementation, here you would:"
2. **Parse task details** from the `task` object
3. **Send to your AI agent** (Claude API, OpenAI API, etc.)
4. **Update task status** using the VibeHero API:
   ```python
   # Update to IN_PROGRESS
   requests.post(f"{VIBEHERO_BASE_URL}/api/ai/issues", json={
       "action": "update_status",
       "cardId": task["id"],
       "status": "IN_PROGRESS", 
       "projectId": project_id,
       "comment": "Starting work on task"
   })
   
   # Later, update to READY_FOR_REVIEW
   requests.post(f"{VIBEHERO_BASE_URL}/api/ai/issues", json={
       "action": "update_status", 
       "cardId": task["id"],
       "status": "READY_FOR_REVIEW",
       "projectId": project_id,
       "comment": "Task completed"
   })
   ```

## ⚙️ Configuration

You can modify these settings in the script:
- `POLL_INTERVAL`: How often to check for new tasks (default: 30 seconds)
- `MAX_RETRIES`: How many empty responses before showing "no tasks" message

## 🏃‍♂️ Example Output

```
[2025-08-06 18:45:12] 🚀 Starting VibeHero Agent for project: cme0a0fir000ol304w0cvo38m
[2025-08-06 18:45:12] ✅ Successfully connected to VibeHero project
[2025-08-06 18:45:12] 📖 Project onboarding instructions received
[2025-08-06 18:45:12] 🔍 Checking for new tasks...
[2025-08-06 18:45:13] ✨ Found task #1

📋 New Task Available!
   Title: Fix navigation bug
   Priority: 1
   Status: READY
   Description: The navigation menu is not working properly on mobile devices...
   Task ID: abc123def456

💡 To integrate with your AI agent:
   - Parse task details above
   - Send task to your AI agent
   - Update task status via API
   - Use task ID: abc123def456
```

## 🔒 Security Notes

- The script only reads task information and project details
- No sensitive data is stored or transmitted beyond what VibeHero already provides
- All communication is over HTTPS

## 🐛 Troubleshooting

**"Could not connect to project"**: Check that your project ID is correct and the project exists.

**"No tasks available"**: This is normal - the script will keep monitoring for new tasks.

**Script exits unexpectedly**: Check your internet connection and that VibeHero is accessible.

## 🔄 Stopping the Script

Press `Ctrl+C` to stop the script gracefully. It will show a summary of tasks found.