# Claude Agent System for Valence Ecosystem

This directory contains specialized AI agents that help maintain and improve the Valence Ecosystem codebase. These agents are now fully functional and integrated with Claude CLI for automated validation and fixes.

## Available Agents

### 🧪 test-fixer
Analyzes and fixes failing E2E tests, updates selectors, and resolves timing issues.
- **Config**: `config/test-fixer.json`
- **Prompt**: `prompts/test-fixer.md`
- **Tools**: read_file, write_file, search_files, run_command

### 🔥 firebase-config
Resolves Firebase Admin SDK issues, manages environment variables, and handles auth configuration.
- **Config**: `config/firebase-config.json`
- **Prompt**: `prompts/firebase-config.md`
- **Tools**: read_file, write_file, search_files, run_command

### 🎨 ui-consistency
Validates dark theme implementation, responsive design, and accessibility standards.
- **Config**: `config/ui-consistency.json`
- **Prompt**: `prompts/ui-consistency.md`
- **Tools**: read_file, write_file, search_files, run_command

### 💳 booking-flow
Validates booking, payment, escrow, and review pipeline logic.
- **Config**: `config/booking-flow.json`
- **Prompt**: `prompts/booking-flow.md`
- **Tools**: read_file, write_file, search_files, run_command

### ✅ code-quality
Reviews code for TypeScript types, patterns, security, and prevents duplicate implementations.
- **Config**: `config/code-quality.json`
- **Prompt**: `prompts/code-quality.md`
- **Tools**: read_file, write_file, search_files, run_command

## Prerequisites

1. **Install Claude CLI**:
   ```bash
   # Visit https://docs.anthropic.com/claude/docs/claude-cli
   # Follow installation instructions for your platform
   ```

2. **Verify Installation**:
   ```bash
   claude --version
   # or
   claude-cli --version
   ```

## Usage

### Using the Agent Runner Script

```bash
# Fix failing tests
./.claude/agents/agent-runner.sh test-fix

# Fix Firebase issues
./.claude/agents/agent-runner.sh firebase-fix

# Check UI consistency
./.claude/agents/agent-runner.sh ui-check

# Validate booking flow
./.claude/agents/agent-runner.sh booking-validate

# Run code quality checks
./.claude/agents/agent-runner.sh quality-check

# Run all pre-deployment checks
./.claude/agents/agent-runner.sh pre-deploy

# Fix all auto-fixable issues
./.claude/agents/agent-runner.sh fix-all
```

### Targeting Specific Files

```bash
# Target a specific test file
./.claude/agents/agent-runner.sh test-fix --target e2e/auth-flow.spec.ts

# Check UI consistency in a component
./.claude/agents/agent-runner.sh ui-check --target app/components/ServiceCard.tsx

# Review code quality for a module
./.claude/agents/agent-runner.sh quality-check --target lib/stripe/
```

## How It Works

1. **Configuration-Driven**: Each agent has a JSON config file defining its scope and rules
2. **Prompt-Based**: Detailed prompts guide the agent's behavior and decision-making
3. **Tool Access**: Agents can read, write, search files, and run commands
4. **Automated Execution**: The runner script handles agent invocation via Claude CLI

## Agent Execution Flow

```
1. User runs: ./agent-runner.sh test-fix
2. Script loads: config/test-fixer.json + prompts/test-fixer.md
3. Creates prompt with project context
4. Executes via Claude CLI
5. Agent performs analysis and fixes
6. Returns results to user
```

## Integration with Development Workflow

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit
./.claude/agents/agent-runner.sh quality-check
exit $?
```

### CI/CD Pipeline
```yaml
# GitHub Actions example
name: Pre-deployment Validation
on:
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Claude CLI
        run: |
          # Install Claude CLI per documentation
      - name: Run Claude Agents
        run: |
          ./.claude/agents/agent-runner.sh pre-deploy
```

### VS Code Task
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run Claude Quality Check",
      "type": "shell",
      "command": "${workspaceFolder}/.claude/agents/agent-runner.sh",
      "args": ["quality-check"],
      "problemMatcher": []
    }
  ]
}
```

## Directory Structure

```
.claude/agents/
├── README.md           # This file
├── agent-runner.sh     # Main execution script
├── config/            # Agent configuration files
│   ├── test-fixer.json
│   ├── firebase-config.json
│   ├── ui-consistency.json
│   ├── booking-flow.json
│   └── code-quality.json
└── prompts/          # Agent prompt templates
    ├── test-fixer.md
    ├── firebase-config.md
    ├── ui-consistency.md
    ├── booking-flow.md
    └── code-quality.md
```

## Creating New Agents

To create a new agent:

1. **Create Configuration File**: `config/new-agent.json`
   ```json
   {
     "name": "new-agent",
     "description": "Agent purpose",
     "tools": ["read_file", "write_file", "search_files", "run_command"],
     "targets": {
       "file_patterns": ["**/*.ts"]
     },
     "rules": {}
   }
   ```

2. **Create Prompt File**: `prompts/new-agent.md`
   ```markdown
   # New Agent
   
   You are a specialized agent for...
   
   ## Responsibilities
   - Task 1
   - Task 2
   
   ## Guidelines
   ...
   ```

3. **Update Runner Script**: Add new command case in `agent-runner.sh`

4. **Test Thoroughly**: Run the agent on sample files first

## Best Practices

- **Single Responsibility**: Each agent should focus on one domain
- **Clear Documentation**: Document what the agent does and doesn't do
- **Conservative Changes**: Agents should prefer safe, incremental fixes
- **Human Review**: Always review agent changes before committing
- **Regular Updates**: Keep agent configs aligned with project standards

## Troubleshooting

### "Claude CLI not found"
- Install Claude CLI from the official documentation
- Ensure it's in your PATH
- Try both `claude` and `claude-cli` commands

### "Config file not found"
- Check file exists in `config/` directory
- Verify file permissions
- Ensure correct agent name

### "Agent made incorrect changes"
- Review the prompt file for clarity
- Adjust configuration rules
- Provide more specific targets
- Report issues for prompt improvements

## Advanced Features

### 🆕 Agent Generator
Create new agents with one command:
```bash
./.claude/agents/new-agent.sh api-validator "Validates API endpoints and OpenAPI specs"
```

### 🔍 Dry Run Mode
Preview changes without applying them:
```bash
./.claude/agents/agent-runner.sh test-fix --dry-run
./.claude/agents/agent-runner.sh firebase-fix --dry-run --diff
```

### ⛓️ Agent Chains
Run multiple agents in sequence:
```bash
# Run TypeScript check → UI validation → booking logic
./.claude/agents/agent-runner.sh chain quality-check ui-check booking-validate

# Custom chain with dry-run
./.claude/agents/agent-runner.sh chain test-fix code-quality --dry-run
```

### 👁️ File Watcher
Auto-run agents on file changes:
```bash
# Start watching (runs appropriate agent when files change)
./.claude/agents/watch-mode.sh

# Watch with dry-run mode
./.claude/agents/watch-mode.sh --dry-run
```

### 🪝 Git Hooks
Install pre-commit and pre-push hooks:
```bash
./.claude/agents/install-hooks.sh
```

### 🐳 Docker Support
Run agents in containers:
```bash
# Build dev container
docker build -f .devcontainer/Dockerfile -t valence-agents .

# Run agent in container
docker run -v $(pwd):/workspace valence-agents \
  /workspace/.claude/agents/agent-runner.sh pre-deploy
```

## CI/CD Integration

The repository includes GitHub Actions workflow for automated validation:
- `.github/workflows/claude-agents.yml` - Runs on PRs and pushes
- Builds and publishes dev container images
- Supports manual workflow dispatch

## Command Reference

| Command | Description | Options |
|---------|-------------|---------|
| `test-fix` | Fix failing E2E tests | `--target`, `--dry-run` |
| `firebase-fix` | Fix Firebase config | `--target`, `--dry-run` |
| `ui-check` | Validate UI consistency | `--target`, `--dry-run` |
| `booking-validate` | Check booking flow | `--target`, `--dry-run` |
| `quality-check` | Code quality analysis | `--target`, `--dry-run` |
| `chain` | Run multiple agents | List of agents |
| `pre-deploy` | Full validation pipeline | `--dry-run` |
| `fix-all` | Apply all auto-fixes | `--dry-run` |

### Global Options
- `--dry-run` - Preview changes without applying
- `--diff` - Show detailed diffs
- `--verbose` - Show debug output
- `--target <path>` - Target specific file/directory

## Scaling Your Agent System

### For Teams
1. Share agent configurations via version control
2. Customize rules per project requirements
3. Add team-specific agents using `new-agent.sh`
4. Integrate with existing CI/CD pipelines

### For Enterprise
Consider building:
- Web dashboard for agent results
- Centralized agent management
- Custom rule engines
- API for external integrations
- SaaS platform for code validation

## Future Roadmap

- [x] Dry-run mode for preview
- [x] Agent chaining/composition
- [x] File system watcher
- [x] Docker/container support
- [x] Git hooks integration
- [ ] Progress indicators
- [ ] Parallel agent execution
- [ ] Web dashboard for results
- [ ] Agent marketplace
- [ ] AI-powered rule generation

---

**🚀 You're now deploying autonomous engineers inside your stack!**

These agents augment but don't replace human code review. Always verify changes match your expectations before committing.