#!/bin/bash

# VibeHero Git Hooks Setup Script
# Sets up git hooks for automatic issue integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up VibeHero Git Hooks...${NC}"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    echo "Please run this script from the root of your git repository."
    exit 1
fi

# Get project root directory
PROJECT_ROOT=$(pwd)
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
SOURCE_HOOKS_DIR="$PROJECT_ROOT/scripts/git-hooks"

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Function to install a hook
install_hook() {
    local hook_name="$1"
    local source_file="$SOURCE_HOOKS_DIR/$hook_name"
    local target_file="$HOOKS_DIR/$hook_name"
    
    if [ -f "$source_file" ]; then
        echo -e "Installing ${YELLOW}$hook_name${NC} hook..."
        cp "$source_file" "$target_file"
        chmod +x "$target_file"
        echo -e "${GREEN}✓${NC} $hook_name hook installed"
    else
        echo -e "${YELLOW}⚠${NC} $hook_name hook source not found, skipping..."
    fi
}

# Install hooks
echo "Installing git hooks..."
install_hook "pre-commit"
install_hook "post-commit"

echo ""
echo -e "${BLUE}📝 Configuration Setup${NC}"
echo ""

# Prompt for configuration
read -p "Enter your VibeHero Project ID (required for issue integration): " project_id

if [ -n "$project_id" ]; then
    # Set git config for the project
    git config vibehero.projectId "$project_id"
    echo -e "${GREEN}✓${NC} Project ID configured: $project_id"
else
    echo -e "${YELLOW}⚠${NC} No Project ID provided. You can set it later with:"
    echo "  git config vibehero.projectId YOUR_PROJECT_ID"
fi

# Optional: Set API URL (defaults to https://vibehero.io)
read -p "Enter VibeHero API URL (press enter for default: https://vibehero.io): " api_url

if [ -n "$api_url" ]; then
    git config vibehero.apiUrl "$api_url"
    echo -e "${GREEN}✓${NC} API URL configured: $api_url"
else
    git config vibehero.apiUrl "https://vibehero.io"
    echo -e "${GREEN}✓${NC} API URL set to default: https://vibehero.io"
fi

# Optional: Set repository URL for commit links
repo_url=$(git config --get remote.origin.url 2>/dev/null || "")
if [ -n "$repo_url" ]; then
    # Convert SSH URL to HTTPS if needed
    if [[ "$repo_url" =~ ^git@github\.com:(.+)\.git$ ]]; then
        repo_url="https://github.com/${BASH_REMATCH[1]}"
    fi
    git config vibehero.repositoryUrl "$repo_url"
    echo -e "${GREEN}✓${NC} Repository URL configured: $repo_url"
fi

echo ""
echo -e "${BLUE}📋 Usage Instructions${NC}"
echo ""
echo "The git hooks are now installed and configured. Here's how they work:"
echo ""
echo -e "${YELLOW}Pre-commit hook:${NC}"
echo "  • Validates issue references in commit messages"
echo "  • Supports formats: VH-123, #123, card-abc123, issue-abc123"
echo "  • Checks if referenced issues exist in your project"
echo ""
echo -e "${YELLOW}Post-commit hook:${NC}"
echo "  • Automatically adds commit information as comments to referenced issues"
echo "  • Includes commit hash, author, date, branch, message, and changed files"
echo "  • Links back to the commit in your repository"
echo ""
echo -e "${YELLOW}Example commit message:${NC}"
echo '  git commit -m "feat: add user login functionality VH-123"'
echo '  git commit -m "fix: resolve authentication bug #456"'
echo ""
echo -e "${GREEN}✅ Git hooks setup completed!${NC}"
echo ""
echo "Your next commits will automatically integrate with VibeHero issues."

# Create a sample .vibehero config file
cat > .vibehero << EOF
# VibeHero Configuration
# This file contains project-specific settings for VibeHero integration

# Project ID (can also be set via git config vibehero.projectId)
PROJECT_ID=$project_id

# API URL (can also be set via git config vibehero.apiUrl)
API_URL=https://vibehero.io

# Repository URL for commit links (auto-detected)
REPOSITORY_URL=$repo_url

# Commit message patterns that trigger issue integration
# Supports: VH-123, #123, card-abc123, issue-abc123, or full issue IDs
ISSUE_PATTERNS=(VH- # card- issue-)

# Optional: Automatic status updates based on commit keywords
# COMMIT_STATUS_MAPPING=(
#   "WIP:|work in progress" -> "IN_PROGRESS"
#   "fix:|fixes:|fixed" -> "READY_FOR_REVIEW"  
#   "complete:|done:|finish" -> "READY_FOR_REVIEW"
# )
EOF

echo "Created .vibehero configuration file with your settings."
echo ""
echo "Add .vibehero to your .gitignore if it contains sensitive information."