#!/bin/bash

# Claude Agent File Watcher
# Automatically runs relevant agents when files change

AGENT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$(dirname "$AGENT_DIR")")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for fswatch or inotify-tools
if command -v fswatch &> /dev/null; then
    WATCH_CMD="fswatch"
elif command -v inotifywait &> /dev/null; then
    WATCH_CMD="inotifywait"
else
    echo -e "${RED}Error: No file watcher found. Please install fswatch or inotify-tools${NC}"
    echo "  macOS: brew install fswatch"
    echo "  Linux: apt-get install inotify-tools"
    exit 1
fi

# Usage
usage() {
    echo -e "${BLUE}Claude Agent File Watcher${NC}"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Run agents in dry-run mode"
    echo "  --quiet      Suppress verbose output"
    echo "  --help       Show this help message"
    echo ""
    echo "Watches for file changes and runs appropriate agents:"
    echo "  - *.spec.ts → test-fixer"
    echo "  - *.tsx → ui-consistency"
    echo "  - lib/firebase/* → firebase-config"
    echo "  - app/booking/* → booking-flow"
    echo "  - *.ts/*.tsx → code-quality"
    echo ""
}

# Parse options
DRY_RUN=""
QUIET=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN="--dry-run"
            shift
            ;;
        --quiet)
            QUIET=true
            shift
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Function to determine which agent to run based on file path
get_agent_for_file() {
    local file=$1
    
    # Test files
    if [[ $file == *".spec.ts" ]] || [[ $file == *".test.ts" ]]; then
        echo "test-fixer"
        return
    fi
    
    # Firebase configuration
    if [[ $file == *"lib/firebase"* ]] || [[ $file == *"firebase"* ]]; then
        echo "firebase-config"
        return
    fi
    
    # Booking flow
    if [[ $file == *"app/booking"* ]] || [[ $file == *"app/bookings"* ]]; then
        echo "booking-flow"
        return
    fi
    
    # UI components
    if [[ $file == *".tsx" ]] && [[ $file == *"components"* || $file == *"app"* ]]; then
        echo "ui-consistency"
        return
    fi
    
    # General TypeScript files
    if [[ $file == *".ts" ]] || [[ $file == *".tsx" ]]; then
        echo "code-quality"
        return
    fi
    
    echo ""
}

# Function to run agent for changed file
handle_file_change() {
    local file=$1
    local agent=$(get_agent_for_file "$file")
    
    if [ -z "$agent" ]; then
        return
    fi
    
    if [ "$QUIET" = false ]; then
        echo -e "${YELLOW}File changed: $file${NC}"
        echo -e "${BLUE}Running agent: $agent${NC}"
    fi
    
    # Run the agent with the changed file as target
    "${AGENT_DIR}/agent-runner.sh" "$agent" --target "$file" $DRY_RUN
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Agent completed${NC}"
    else
        echo -e "${RED}✗ Agent failed${NC}"
    fi
    echo ""
}

# Main watch loop
echo -e "${BLUE}Claude Agent File Watcher Started${NC}"
echo -e "${YELLOW}Watching for file changes in: $PROJECT_ROOT${NC}"
if [ -n "$DRY_RUN" ]; then
    echo -e "${YELLOW}Running in DRY RUN mode${NC}"
fi
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Set up file watching based on available command
if [ "$WATCH_CMD" = "fswatch" ]; then
    # macOS fswatch
    fswatch -r -e "node_modules" -e ".git" -e ".next" -e "dist" \
        --include "\.ts$" --include "\.tsx$" \
        "$PROJECT_ROOT" | while read file; do
        handle_file_change "$file"
    done
else
    # Linux inotifywait
    inotifywait -r -m -e modify,create \
        --exclude "(node_modules|\.git|\.next|dist)" \
        --format '%w%f' \
        "$PROJECT_ROOT" | while read file; do
        if [[ $file =~ \.(ts|tsx)$ ]]; then
            handle_file_change "$file"
        fi
    done
fi