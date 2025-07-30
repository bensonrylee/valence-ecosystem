# Claude Agent System for Valence Ecosystem

This directory contains specialized AI agents that help maintain and improve the Valence Ecosystem codebase.

## Available Agents

### 🧪 test-fixer
Analyzes and fixes failing E2E tests, updates selectors, and resolves timing issues.

### 🔥 firebase-config
Resolves Firebase Admin SDK issues, manages environment variables, and handles auth configuration.

### 🎨 ui-consistency
Validates dark theme implementation, responsive design, and accessibility standards.

### 💳 booking-flow
Validates booking, payment, escrow, and review pipeline logic.

### ✅ code-quality
Reviews code for TypeScript types, patterns, security, and prevents duplicate implementations.

## Usage

### Using the Agent Runner Script

```bash
# Fix failing tests
./.claude/agents/agent-runner.sh test-fix

# Fix Firebase issues
./.claude/agents/agent-runner.sh firebase-fix

# Run all pre-deployment checks
./.claude/agents/agent-runner.sh pre-deploy

# Fix all current issues
./.claude/agents/agent-runner.sh fix-all
```

### Direct Agent Invocation

```bash
# Use specific agent
claude agents use test-fixer

# Target specific file
claude agents use code-quality --target app/bookings/page.tsx

# Run agent pipeline
claude agents pipeline code-quality → test-fixer → booking-flow
```

## Agent Activation Patterns

1. **Automatic**: Agents are triggered based on error patterns
   - E2E test failures → test-fixer
   - Firebase errors → firebase-config
   - UI changes → ui-consistency

2. **Explicit**: Manual invocation for specific tasks
   - "Use code-quality agent to review the booking components"
   - "Use test-fixer agent to update navigation tests"

3. **Pipeline**: Chained execution for comprehensive checks
   - Pre-deployment: quality → tests → firebase → ui → booking
   - Post-refactor: quality → tests

## Integration with Development Workflow

### Pre-commit Hook
```bash
# Add to .git/hooks/pre-commit
./.claude/agents/agent-runner.sh quality-check
```

### CI/CD Pipeline
```yaml
# GitHub Actions example
- name: Run Claude Agents
  run: |
    ./.claude/agents/agent-runner.sh pre-deploy
```

### VS Code Task
```json
// .vscode/tasks.json
{
  "label": "Run Claude Quality Check",
  "type": "shell",
  "command": "./.claude/agents/agent-runner.sh quality-check"
}
```

## Creating New Agents

To create a new agent:

1. Create a new `.md` file in this directory
2. Use the following template:

```markdown
---
name: agent-name
description: One-line description of the agent's purpose
tools: read_file, write_file, search_files, run_command
color: blue
---

# Agent Name

Detailed description and instructions...
```

3. Update `agent-runner.sh` to include the new agent

## Best Practices

- Keep agents focused on a single domain
- Use clear, actionable descriptions
- Include specific examples in agent instructions
- Test agents thoroughly before relying on them
- Document any project-specific patterns