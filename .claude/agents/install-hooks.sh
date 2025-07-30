#!/bin/bash

# Install Git hooks for Claude agents

AGENT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$(dirname "$AGENT_DIR")")"
HOOKS_DIR="${PROJECT_ROOT}/.git/hooks"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Installing Claude Agent Git Hooks${NC}"

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Create pre-commit hook
cat > "${HOOKS_DIR}/pre-commit" << 'EOF'
#!/bin/bash

# Claude Agent Pre-commit Hook
# Runs code quality checks before allowing commit

# Get the project root
PROJECT_ROOT=$(git rev-parse --show-toplevel)
AGENT_RUNNER="${PROJECT_ROOT}/.claude/agents/agent-runner.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Running Claude code quality checks...${NC}"

# Get list of staged TypeScript files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$')

if [ -z "$STAGED_FILES" ]; then
    echo -e "${GREEN}No TypeScript files to check${NC}"
    exit 0
fi

# Run code quality agent in dry-run mode
"$AGENT_RUNNER" quality-check --dry-run

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Code quality check failed${NC}"
    echo -e "${YELLOW}Fix the issues or run with --no-verify to skip${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Code quality check passed${NC}"
exit 0
EOF

chmod +x "${HOOKS_DIR}/pre-commit"
echo -e "${GREEN}✓ Created pre-commit hook${NC}"

# Create pre-push hook
cat > "${HOOKS_DIR}/pre-push" << 'EOF'
#!/bin/bash

# Claude Agent Pre-push Hook
# Runs full validation pipeline before push

# Get the project root
PROJECT_ROOT=$(git rev-parse --show-toplevel)
AGENT_RUNNER="${PROJECT_ROOT}/.claude/agents/agent-runner.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if pushing to protected branch
protected_branch='main'
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

if [ "$current_branch" = "$protected_branch" ]; then
    echo -e "${BLUE}Pushing to main branch - running full validation...${NC}"
    
    # Run pre-deployment validation
    "$AGENT_RUNNER" pre-deploy --dry-run
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Pre-deployment validation failed${NC}"
        echo -e "${YELLOW}Fix all issues before pushing to main${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All validations passed${NC}"
fi

exit 0
EOF

chmod +x "${HOOKS_DIR}/pre-push"
echo -e "${GREEN}✓ Created pre-push hook${NC}"

# Create commit-msg hook for conventional commits
cat > "${HOOKS_DIR}/commit-msg" << 'EOF'
#!/bin/bash

# Conventional commit message validation

commit_regex='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,50}'
error_msg="Commit message must follow Conventional Commits format:
  
  type(scope): description
  
Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
Example: feat(booking): add payment confirmation email"

if ! grep -qE "$commit_regex" "$1"; then
    echo "$error_msg" >&2
    exit 1
fi
EOF

chmod +x "${HOOKS_DIR}/commit-msg"
echo -e "${GREEN}✓ Created commit-msg hook${NC}"

echo ""
echo -e "${GREEN}✅ Git hooks installed successfully!${NC}"
echo ""
echo "Hooks installed:"
echo "  - pre-commit: Runs code quality checks"
echo "  - pre-push: Runs full validation on main branch"
echo "  - commit-msg: Enforces conventional commits"
echo ""
echo "To skip hooks temporarily, use --no-verify flag"