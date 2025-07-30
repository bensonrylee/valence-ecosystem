#!/bin/bash

# Claude Agent Runner Script for Valence Ecosystem
# This script provides convenient commands to run agents individually or in pipelines

AGENT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$(dirname "$AGENT_DIR")")"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Claude command detection
CLAUDE_CMD=""
if command -v claude &> /dev/null; then
    CLAUDE_CMD="claude"
elif command -v claude-cli &> /dev/null; then
    CLAUDE_CMD="claude-cli"
else
    echo -e "${RED}Error: Claude CLI not found. Please install Claude CLI first.${NC}"
    echo "Visit: https://docs.anthropic.com/claude/docs/claude-cli"
    exit 1
fi

# Global options
DRY_RUN=false
SHOW_DIFF=false
VERBOSE=false

# Parse global options
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --diff)
            SHOW_DIFF=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            break
            ;;
    esac
done

# Function to display usage
usage() {
    echo -e "${BLUE}Claude Agent Runner for Valence Ecosystem${NC}"
    echo ""
    echo "Usage:"
    echo "  ./agent-runner.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  test-fix              Run test-fixer agent on failing tests"
    echo "  firebase-fix          Fix Firebase configuration issues"
    echo "  ui-check              Validate UI consistency"
    echo "  booking-validate      Check booking flow integrity"
    echo "  quality-check         Run code quality analysis"
    echo "  chain                 Run multiple agents in sequence"
    echo "  pre-deploy            Run all validation agents"
    echo "  fix-all               Fix all current issues"
    echo ""
    echo "Options:"
    echo "  --target <file>       Specific file to target"
    echo "  --dry-run             Preview changes without applying them"
    echo "  --diff                Show detailed diff of proposed changes"
    echo "  --verbose             Show detailed output"
    echo ""
    echo "Examples:"
    echo "  ./agent-runner.sh test-fix --dry-run"
    echo "  ./agent-runner.sh chain quality-check ui-check booking-validate"
    echo "  ./agent-runner.sh firebase-fix --target lib/firebase --diff"
    echo ""
}

# Function to run a specific agent
run_agent() {
    local agent_name=$1
    local target=$2
    local config_file="${AGENT_DIR}/config/${agent_name}.json"
    local prompt_file="${AGENT_DIR}/prompts/${agent_name}.md"
    
    echo -e "${BLUE}Running ${agent_name} agent...${NC}"
    
    # Check if config and prompt files exist
    if [ ! -f "$config_file" ]; then
        echo -e "${RED}Error: Config file not found: $config_file${NC}"
        return 1
    fi
    
    if [ ! -f "$prompt_file" ]; then
        echo -e "${RED}Error: Prompt file not found: $prompt_file${NC}"
        return 1
    fi
    
    # Build the agent command
    local agent_prompt="You are the ${agent_name} agent for Valence Ecosystem. 

$(cat "$prompt_file")

Project root: ${PROJECT_ROOT}
Configuration: $(cat "$config_file")"
    
    if [ -n "$target" ]; then
        agent_prompt="$agent_prompt

Target file/directory: $target"
    fi
    
    # Add dry-run mode instructions
    if [ "$DRY_RUN" = true ]; then
        agent_prompt="$agent_prompt

IMPORTANT: This is a DRY RUN. Do not make any actual changes to files. Instead:
1. Analyze what changes would be made
2. List all files that would be modified
3. Show what the changes would be
4. Provide a summary of the impact"
    fi
    
    # Add diff mode instructions
    if [ "$SHOW_DIFF" = true ]; then
        agent_prompt="$agent_prompt

IMPORTANT: Show detailed diffs for all proposed changes:
1. Use unified diff format
2. Show before/after for each change
3. Include line numbers
4. Highlight additions and deletions"
    fi
    
    # Execute the agent using Claude CLI
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}Executing ${agent_name} agent in DRY RUN mode...${NC}"
    else
        echo -e "${YELLOW}Executing ${agent_name} agent...${NC}"
    fi
    
    # Create a temporary file for the prompt
    local temp_prompt="/tmp/claude_agent_${agent_name}_$$.txt"
    echo "$agent_prompt" > "$temp_prompt"
    
    # Run Claude with the agent prompt
    cd "$PROJECT_ROOT"
    
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}--- Agent Prompt ---${NC}"
        cat "$temp_prompt"
        echo -e "${BLUE}--- End Prompt ---${NC}"
    fi
    
    $CLAUDE_CMD < "$temp_prompt"
    local exit_code=$?
    
    # Clean up
    rm -f "$temp_prompt"
    
    if [ $exit_code -eq 0 ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "${GREEN}✓ ${agent_name} agent dry run completed${NC}"
        else
            echo -e "${GREEN}✓ ${agent_name} agent completed successfully${NC}"
        fi
    else
        echo -e "${RED}✗ ${agent_name} agent failed with exit code $exit_code${NC}"
    fi
    
    echo ""
    return $exit_code
}

# Main command processing
case "$1" in
    "test-fix")
        run_agent "test-fixer" "$2"
        ;;
        
    "firebase-fix")
        run_agent "firebase-config" "$2"
        ;;
        
    "ui-check")
        run_agent "ui-consistency" "$2"
        ;;
        
    "booking-validate")
        run_agent "booking-flow" "$2"
        ;;
        
    "quality-check")
        run_agent "code-quality" "$2"
        ;;
        
    "pre-deploy")
        echo -e "${BLUE}Running pre-deployment validation pipeline...${NC}"
        echo ""
        
        # Track overall success
        local all_passed=true
        
        # Run each validation agent
        for agent in "code-quality" "test-fixer" "firebase-config" "ui-consistency" "booking-flow"; do
            if ! run_agent "$agent"; then
                all_passed=false
            fi
        done
        
        if [ "$all_passed" = true ]; then
            echo -e "${GREEN}✅ Pre-deployment validation complete! All checks passed.${NC}"
            exit 0
        else
            echo -e "${RED}❌ Pre-deployment validation failed. Please fix issues before deploying.${NC}"
            exit 1
        fi
        ;;
        
    "fix-all")
        echo -e "${BLUE}Running all fixing agents...${NC}"
        echo ""
        
        # Track overall success
        local all_passed=true
        
        # Run fixing agents
        for agent in "test-fixer" "firebase-config"; do
            if ! run_agent "$agent"; then
                all_passed=false
            fi
        done
        
        if [ "$all_passed" = true ]; then
            echo -e "${GREEN}✅ All fixes applied successfully!${NC}"
            exit 0
        else
            echo -e "${RED}❌ Some fixes failed. Please check the output above.${NC}"
            exit 1
        fi
        ;;
        
    "chain")
        shift # Remove 'chain' from arguments
        
        if [ $# -eq 0 ]; then
            echo -e "${RED}Error: No agents specified for chain${NC}"
            echo "Usage: ./agent-runner.sh chain <agent1> <agent2> ..."
            exit 1
        fi
        
        echo -e "${BLUE}Running agent chain: $@${NC}"
        echo ""
        
        # Track overall success
        local all_passed=true
        local chain_step=1
        
        # Run each agent in sequence
        for agent in "$@"; do
            echo -e "${BLUE}[Step $chain_step] Running ${agent}...${NC}"
            
            # Map friendly names to actual agent names
            case $agent in
                "quality-check") agent="code-quality" ;;
                "ui-check") agent="ui-consistency" ;;
                "booking-validate") agent="booking-flow" ;;
                "test-fix") agent="test-fixer" ;;
                "firebase-fix") agent="firebase-config" ;;
            esac
            
            if ! run_agent "$agent"; then
                echo -e "${RED}❌ Chain failed at step $chain_step (${agent})${NC}"
                all_passed=false
                break
            fi
            
            ((chain_step++))
        done
        
        if [ "$all_passed" = true ]; then
            echo -e "${GREEN}✅ Agent chain completed successfully!${NC}"
            exit 0
        else
            echo -e "${RED}❌ Agent chain failed. Fix issues before continuing.${NC}"
            exit 1
        fi
        ;;
        
    *)
        usage
        exit 1
        ;;
esac