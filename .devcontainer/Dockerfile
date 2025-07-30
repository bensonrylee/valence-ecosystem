FROM node:20-bullseye

# Install essential tools
RUN apt-get update && apt-get install -y \
    curl \
    git \
    jq \
    ripgrep \
    fd-find \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Claude CLI (placeholder - update with actual installation when available)
# Note: Replace this with the actual Claude CLI installation method
RUN echo "Claude CLI installation placeholder" && \
    mkdir -p /usr/local/bin && \
    echo '#!/bin/bash\necho "Claude CLI - awaiting official release\nVisit: https://docs.anthropic.com/claude/docs/claude-cli"' > /usr/local/bin/claude && \
    chmod +x /usr/local/bin/claude

# Install global npm packages
RUN npm install -g \
    typescript \
    @playwright/test \
    eslint \
    prettier

# Set up non-root user
ARG USERNAME=developer
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Switch to non-root user
USER $USERNAME

# Set working directory
WORKDIR /workspace

# Copy agent system
COPY .claude/agents /home/$USERNAME/.claude/agents

# Make scripts executable
RUN sudo chmod +x /home/$USERNAME/.claude/agents/*.sh

# Environment variables for Claude
ENV CLAUDE_AGENT_DIR=/home/$USERNAME/.claude/agents
ENV PATH="$PATH:$CLAUDE_AGENT_DIR"