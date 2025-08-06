#!/bin/bash

# VibeSight Claude AI Agent Monitor
# Continuously monitors for new tasks and executes Claude AI agent in dangerous mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
DEFAULT_BASE_URL="http://localhost:3000"
DEFAULT_PROJECT_ID=""
DEFAULT_INTERVAL=60
DEFAULT_MAX_RUNS=0
DEFAULT_LOG_FILE="./claude-monitor.log"

# Configuration variables
BASE_URL="$DEFAULT_BASE_URL"
PROJECT_ID="$DEFAULT_PROJECT_ID"
INTERVAL="$DEFAULT_INTERVAL"
MAX_RUNS="$DEFAULT_MAX_RUNS"
LOG_FILE="$DEFAULT_LOG_FILE"
CLAUDE_EXECUTABLE="claude"

# Usage information
usage() {
    echo "VibeSight Claude AI Agent Monitor"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --base-url URL       Base URL for VibeSight API (default: $DEFAULT_BASE_URL)"
    echo "  -p, --project-id ID      Project ID to monitor (required)"
    echo "  -i, --interval SEC       Polling interval in seconds (default: $DEFAULT_INTERVAL)"
    echo "  -m, --max-runs NUM       Maximum number of task runs (0 = unlimited, default: $DEFAULT_MAX_RUNS)"
    echo "  -l, --log-file PATH      Log file path (default: $DEFAULT_LOG_FILE)"
    echo "  -c, --claude-path PATH   Path to Claude executable (default: $CLAUDE_EXECUTABLE)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --project-id cmdz7f6is0002xg5ethwxk5ul"
    echo "  $0 -p cmdz7f6is0002xg5ethwxk5ul -i 30 -m 50"
    echo "  $0 --base-url https://vibesight.com --project-id abc123"
    echo ""
    echo "Environment Variables:"
    echo "  VIBESIGHT_BASE_URL       Override base URL"
    echo "  VIBESIGHT_PROJECT_ID     Override project ID"
    echo "  VIBESIGHT_INTERVAL       Override polling interval"
    echo ""
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -u|--base-url)
                BASE_URL="$2"
                shift 2
                ;;
            -p|--project-id)
                PROJECT_ID="$2"
                shift 2
                ;;
            -i|--interval)
                INTERVAL="$2"
                shift 2
                ;;
            -m|--max-runs)
                MAX_RUNS="$2"
                shift 2
                ;;
            -l|--log-file)
                LOG_FILE="$2"
                shift 2
                ;;
            -c|--claude-path)
                CLAUDE_EXECUTABLE="$2"
                shift 2
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                echo "Unknown option: $1" >&2
                usage >&2
                exit 1
                ;;
        esac
    done
}

# Override with environment variables if set
load_env() {
    [[ -n "$VIBESIGHT_BASE_URL" ]] && BASE_URL="$VIBESIGHT_BASE_URL"
    [[ -n "$VIBESIGHT_PROJECT_ID" ]] && PROJECT_ID="$VIBESIGHT_PROJECT_ID"
    [[ -n "$VIBESIGHT_INTERVAL" ]] && INTERVAL="$VIBESIGHT_INTERVAL"
}

# Validate configuration
validate_config() {
    if [[ -z "$PROJECT_ID" ]]; then
        echo -e "${RED}Error: Project ID is required${NC}" >&2
        echo "Use --project-id or set VIBESIGHT_PROJECT_ID environment variable" >&2
        exit 1
    fi

    if ! command -v "$CLAUDE_EXECUTABLE" >/dev/null 2>&1; then
        echo -e "${RED}Error: Claude executable not found: $CLAUDE_EXECUTABLE${NC}" >&2
        echo "Please install Claude CLI or specify path with --claude-path" >&2
        exit 1
    fi

    if ! [[ "$INTERVAL" =~ ^[0-9]+$ ]] || [[ "$INTERVAL" -lt 1 ]]; then
        echo -e "${RED}Error: Invalid interval: $INTERVAL${NC}" >&2
        echo "Interval must be a positive integer" >&2
        exit 1
    fi

    if ! [[ "$MAX_RUNS" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}Error: Invalid max-runs: $MAX_RUNS${NC}" >&2
        echo "Max runs must be a non-negative integer" >&2
        exit 1
    fi
}

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Check if VibeSight API is available
check_api_health() {
    local url="$BASE_URL/api/projects"
    
    if curl -s --max-time 10 --fail "$url" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Get next ready task from VibeSight API
get_next_task() {
    local api_url="$BASE_URL/api/ai/cards"
    local params="action=next_ready&projectId=$PROJECT_ID"
    
    curl -s --max-time 30 --fail "$api_url?$params" 2>/dev/null || echo "ERROR"
}

# Execute Claude in dangerous mode with task context
execute_claude() {
    local onboard_url="$BASE_URL/api/$PROJECT_ID/ai/onboard"
    
    log_message "INFO" "Starting Claude AI agent in dangerous mode"
    echo -e "${CYAN}🤖 Executing Claude AI Agent...${NC}"
    
    # Create a temporary script to handle the Claude execution
    local temp_script=$(mktemp)
    cat > "$temp_script" << EOF
#!/bin/bash
echo "Claude, you are now connected to the VibeSight project monitoring system."
echo "Please fetch your onboarding instructions from: $onboard_url"
echo "Then begin the continuous monitoring workflow as instructed."
echo "Continue checking for new tasks and completing them as they become available."
EOF
    
    chmod +x "$temp_script"
    
    # Execute Claude with the onboarding context
    if "$CLAUDE_EXECUTABLE" --dangerous < "$temp_script"; then
        log_message "SUCCESS" "Claude agent execution completed successfully"
        echo -e "${GREEN}✅ Claude agent completed task successfully${NC}"
        rm -f "$temp_script"
        return 0
    else
        log_message "ERROR" "Claude agent execution failed"
        echo -e "${RED}❌ Claude agent execution failed${NC}"
        rm -f "$temp_script"
        return 1
    fi
}

# Signal handler for graceful shutdown
cleanup() {
    echo ""
    log_message "INFO" "Received shutdown signal, cleaning up..."
    echo -e "${YELLOW}🛑 Shutting down Claude monitor...${NC}"
    exit 0
}

# Main monitoring loop
monitor_loop() {
    local run_count=0
    local successful_runs=0
    local failed_runs=0
    
    echo -e "${BLUE}🚀 Starting VibeSight Claude Monitor${NC}"
    echo -e "${BLUE}Project ID: $PROJECT_ID${NC}"
    echo -e "${BLUE}Base URL: $BASE_URL${NC}"
    echo -e "${BLUE}Polling Interval: ${INTERVAL}s${NC}"
    echo -e "${BLUE}Max Runs: $([ $MAX_RUNS -eq 0 ] && echo "Unlimited" || echo $MAX_RUNS)${NC}"
    echo -e "${BLUE}Log File: $LOG_FILE${NC}"
    echo ""
    
    log_message "INFO" "Claude monitor started (PID: $$)"
    
    # Initial API health check
    if ! check_api_health; then
        echo -e "${RED}⚠️  Warning: VibeSight API may not be available at $BASE_URL${NC}"
        log_message "WARN" "Initial API health check failed"
    fi
    
    while true; do
        # Check if we've reached the maximum number of runs
        if [[ $MAX_RUNS -gt 0 && $run_count -ge $MAX_RUNS ]]; then
            echo -e "${YELLOW}🏁 Reached maximum runs limit ($MAX_RUNS)${NC}"
            log_message "INFO" "Reached maximum runs limit: $MAX_RUNS"
            break
        fi
        
        run_count=$((run_count + 1))
        echo -e "${PURPLE}🔄 Run #$run_count - Checking for new tasks...${NC}"
        log_message "INFO" "Starting monitoring cycle #$run_count"
        
        # Check for next ready task
        local task_response=$(get_next_task)
        
        if [[ "$task_response" == "ERROR" ]]; then
            echo -e "${RED}❌ Failed to connect to VibeSight API${NC}"
            log_message "ERROR" "API connection failed"
            failed_runs=$((failed_runs + 1))
        elif [[ $(echo "$task_response" | grep -c '"cards"') -gt 0 ]] && [[ $(echo "$task_response" | grep -o '"cards":\[\]' | wc -l) -eq 0 ]]; then
            echo -e "${GREEN}🎯 Found new task! Launching Claude agent...${NC}"
            log_message "INFO" "New task found, executing Claude agent"
            
            if execute_claude; then
                successful_runs=$((successful_runs + 1))
            else
                failed_runs=$((failed_runs + 1))
            fi
        else
            echo -e "${CYAN}💤 No new tasks available${NC}"
            log_message "INFO" "No new tasks found"
        fi
        
        # Display statistics
        echo -e "${BLUE}📊 Stats: Total: $run_count | Success: $successful_runs | Failed: $failed_runs${NC}"
        
        # Wait for next polling cycle
        if [[ $MAX_RUNS -eq 0 || $run_count -lt $MAX_RUNS ]]; then
            echo -e "${CYAN}⏰ Waiting ${INTERVAL}s for next check...${NC}"
            sleep "$INTERVAL"
        fi
    done
    
    echo -e "${GREEN}🏁 Monitoring completed${NC}"
    echo -e "${GREEN}📊 Final Stats: Total: $run_count | Success: $successful_runs | Failed: $failed_runs${NC}"
    log_message "INFO" "Monitoring session completed"
}

# Main function
main() {
    # Set up signal handlers
    trap cleanup SIGINT SIGTERM
    
    # Parse arguments and load configuration
    parse_args "$@"
    load_env
    validate_config
    
    # Start monitoring loop
    monitor_loop
}

# Run main function with all arguments
main "$@"