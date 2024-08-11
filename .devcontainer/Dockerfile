FROM mcr.microsoft.com/vscode/devcontainers/python:0-3.9

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

# Set up the workspace
WORKDIR /workspace

# Install additional utilities
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the default user
USER vscode
