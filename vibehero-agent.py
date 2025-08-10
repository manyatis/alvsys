#!/usr/bin/env python3
"""
VibeHero AI Agent Integration Script

A simple script to connect AI agents with VibeHero project management.
Copy and paste this script to automatically fetch tasks and work with AI agents.

Usage:
    python vibehero-agent.py YOUR_PROJECT_ID

Replace YOUR_PROJECT_ID with your actual VibeHero project ID.
"""

import requests
import time
import sys
import json
from datetime import datetime

# Configuration
VIBEHERO_BASE_URL = "https://vibehero.io"
POLL_INTERVAL = 30  # seconds between task checks
MAX_RETRIES = 3

def log(message):
    """Simple logging with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def get_onboard_instructions(project_id):
    """Fetch onboarding instructions from VibeHero"""
    try:
        url = f"{VIBEHERO_BASE_URL}/api/{project_id}/ai/onboard"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            log("✅ Successfully connected to VibeHero project")
            return response.text
        else:
            log(f"❌ Failed to get onboard instructions: {response.status_code}")
            return None
    except Exception as e:
        log(f"❌ Connection error: {e}")
        return None

def get_next_ready_task(project_id):
    """Check for the next available READY task"""
    try:
        url = f"{VIBEHERO_BASE_URL}/api/ai/issues"
        payload = {
            "action": "next_ready",
            "projectId": project_id
        }
        
        response = requests.post(url, json=payload, timeout=10)
        data = response.json()
        
        if response.status_code == 200 and data.get("card"):
            return data["card"]
        elif "No ready tasks available" in data.get("message", ""):
            return None
        else:
            log(f"⚠️  API response: {data.get('message', 'Unknown error')}")
            return None
            
    except Exception as e:
        log(f"❌ Error checking for tasks: {e}")
        return None

def display_task(task):
    """Display task information in a readable format"""
    print(f"\n📋 New Task Available!")
    print(f"   Title: {task.get('title', 'N/A')}")
    print(f"   Priority: {task.get('priority', 'N/A')}")
    print(f"   Status: {task.get('status', 'N/A')}")
    
    if task.get('description'):
        print(f"   Description: {task['description'][:100]}...")
    
    if task.get('acceptanceCriteria'):
        print(f"   Acceptance Criteria: {task['acceptanceCriteria'][:100]}...")
    
    print(f"   Task ID: {task.get('id', 'N/A')}")
    print()

def main():
    """Main execution loop"""
    if len(sys.argv) != 2:
        print("Usage: python vibehero-agent.py YOUR_PROJECT_ID")
        print("\nTo find your project ID:")
        print("1. Go to your VibeHero project")
        print("2. Look at the URL: https://vibehero.io/projects/YOUR_PROJECT_ID/board")
        print("3. Copy the project ID from the URL")
        sys.exit(1)
    
    project_id = sys.argv[1]
    log(f"🚀 Starting VibeHero Agent for project: {project_id}")
    
    # Get onboarding instructions
    instructions = get_onboard_instructions(project_id)
    if not instructions:
        log("❌ Could not connect to project. Please check your project ID.")
        sys.exit(1)
    
    log("📖 Project onboarding instructions received")
    
    # Main monitoring loop
    task_count = 0
    retry_count = 0
    
    try:
        while True:
            log("🔍 Checking for new tasks...")
            
            task = get_next_ready_task(project_id)
            
            if task:
                task_count += 1
                retry_count = 0  # Reset retry counter on success
                
                log(f"✨ Found task #{task_count}")
                display_task(task)
                
                # In a real implementation, here you would:
                # 1. Parse the task details
                # 2. Call your AI agent (Claude, GPT, etc.)
                # 3. Update task status to IN_PROGRESS
                # 4. Execute the work
                # 5. Update task status to READY_FOR_REVIEW
                
                print("💡 To integrate with your AI agent:")
                print("   - Parse task details above")
                print("   - Send task to your AI agent")
                print("   - Update task status via API")
                print(f"   - Use task ID: {task.get('id')}")
                
            else:
                retry_count += 1
                if retry_count >= MAX_RETRIES:
                    log("😴 No tasks available. Waiting...")
                    retry_count = 0
            
            # Wait before next check
            time.sleep(POLL_INTERVAL)
            
    except KeyboardInterrupt:
        log("👋 Shutting down VibeHero Agent")
        log(f"📊 Total tasks found: {task_count}")

if __name__ == "__main__":
    main()