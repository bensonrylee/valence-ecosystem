#!/bin/bash

# Claude Agent Generator Script
# Creates a new agent with config and prompt templates

AGENT_DIR="$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to display usage
usage() {
    echo -e "${BLUE}Claude Agent Generator${NC}"
    echo ""
    echo "Usage: $0 <agent-name> <description>"
    echo ""
    echo "Example:"
    echo "  $0 api-validator \"Validates API endpoints and OpenAPI specs\""
    echo ""
    exit 1
}

# Check arguments
if [ $# -ne 2 ]; then
    usage
fi

AGENT_NAME="$1"
AGENT_DESC="$2"
CONFIG_FILE="${AGENT_DIR}/config/${AGENT_NAME}.json"
PROMPT_FILE="${AGENT_DIR}/prompts/${AGENT_NAME}.md"

# Validate agent name (alphanumeric and hyphens only)
if ! [[ "$AGENT_NAME" =~ ^[a-z0-9-]+$ ]]; then
    echo -e "${RED}Error: Agent name must be lowercase alphanumeric with hyphens only${NC}"
    exit 1
fi

# Check if agent already exists
if [ -f "$CONFIG_FILE" ] || [ -f "$PROMPT_FILE" ]; then
    echo -e "${RED}Error: Agent '$AGENT_NAME' already exists${NC}"
    exit 1
fi

echo -e "${BLUE}Creating new agent: ${AGENT_NAME}${NC}"
echo -e "${YELLOW}Description: ${AGENT_DESC}${NC}"

# Create config file
cat > "$CONFIG_FILE" << EOF
{
  "name": "${AGENT_NAME}",
  "description": "${AGENT_DESC}",
  "tools": ["read_file", "write_file", "search_files", "run_command"],
  "targets": {
    "file_patterns": ["**/*.ts", "**/*.tsx"],
    "exclude_patterns": ["node_modules/**", "dist/**", ".next/**"]
  },
  "rules": {
    "validation": {
      "enabled": true,
      "strict_mode": false
    },
    "auto_fix": {
      "enabled": true,
      "require_confirmation": true
    }
  },
  "common_fixes": {
    "example_issue": {
      "detect": true,
      "fix": true,
      "description": "Example of a common issue this agent handles"
    }
  },
  "output": {
    "format": "detailed",
    "include_diff": true,
    "color_output": true
  }
}
EOF

echo -e "${GREEN}✓ Created config: $CONFIG_FILE${NC}"

# Create prompt file
cat > "$PROMPT_FILE" << EOF
# ${AGENT_NAME^} Agent

${AGENT_DESC}

## Your Responsibilities

1. **Primary Task**
   - Main responsibility of this agent
   - Key validation or fix it performs
   - Scope of operation

2. **Secondary Tasks**
   - Additional checks or validations
   - Related improvements
   - Optimization opportunities

3. **Constraints**
   - What this agent should NOT do
   - Boundaries and limitations
   - Safety considerations

## Guidelines

- Follow project conventions and standards
- Prioritize safety and correctness over speed
- Provide clear explanations for changes
- Test changes when possible

## Target Files

This agent operates on:
- File patterns defined in config
- Specific subsystems or modules
- Exclude patterns to avoid

## Common Patterns

### Pattern 1: [Name]
\`\`\`typescript
// Bad
example of problematic code

// Good
example of corrected code
\`\`\`

### Pattern 2: [Name]
\`\`\`typescript
// Bad
another example

// Good
corrected version
\`\`\`

## Validation Rules

1. **Rule 1**: Description of what to check
2. **Rule 2**: Another validation rule
3. **Rule 3**: Additional checks

## Output Format

When analyzing code, provide:
1. Summary of issues found
2. List of files affected
3. Specific fixes applied
4. Recommendations for manual review
5. Confidence level of changes

## Example Usage

\`\`\`bash
# Run this agent
./agent-runner.sh ${AGENT_NAME}

# Target specific files
./agent-runner.sh ${AGENT_NAME} --target src/api/

# Dry run mode
./agent-runner.sh ${AGENT_NAME} --dry-run
\`\`\`

## Integration Points

- Works well with: [list related agents]
- Should run after: [prerequisite agents]
- Should run before: [dependent agents]
EOF

echo -e "${GREEN}✓ Created prompt: $PROMPT_FILE${NC}"

# Update agent-runner.sh to include new agent
RUNNER_FILE="${AGENT_DIR}/agent-runner.sh"

# Check if the agent command already exists
if grep -q "\"${AGENT_NAME}\")" "$RUNNER_FILE"; then
    echo -e "${YELLOW}⚠ Agent command already exists in runner${NC}"
else
    # Find the line with the wildcard case
    LINE_NUM=$(grep -n '^\s*\*)'  "$RUNNER_FILE" | head -1 | cut -d: -f1)
    
    if [ -n "$LINE_NUM" ]; then
        # Insert new case before the wildcard
        sed -i "${LINE_NUM}i\\
    \"${AGENT_NAME}\")\\
        run_agent \"${AGENT_NAME}\" \"\$2\"\\
        ;;\\
        " "$RUNNER_FILE"
        
        echo -e "${GREEN}✓ Added command to agent-runner.sh${NC}"
    else
        echo -e "${YELLOW}⚠ Could not auto-update agent-runner.sh - please add manually${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Agent '${AGENT_NAME}' created successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit the prompt file to customize agent behavior:"
echo "   $PROMPT_FILE"
echo ""
echo "2. Adjust the config file if needed:"
echo "   $CONFIG_FILE"
echo ""
echo "3. Test your agent:"
echo "   ${AGENT_DIR}/agent-runner.sh ${AGENT_NAME}"
echo ""
echo "4. Add to pipeline commands if appropriate"