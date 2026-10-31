# syntax=docker/dockerfile:1
# Builds a PyInstaller binary targeting Raspberry Pi OS Bookworm (Debian 12)
# Supports both arm64 (64-bit) and arm/v7 (32-bit) via the --platform flag.
# To be used in conjunction with build.sh

# ── Stage 1: Build the React frontend ────────────────────────────────────────
# This is an intermediate stage to build the frontend and will not be written to the final image

# $BUILDPLATFORM pins this stage to the host machine's native architecture so
# npm runs at full speed without QEMU emulation, regardless of the --platform
# target for the final binary.
FROM --platform=$BUILDPLATFORM node:20-bookworm-slim AS frontend-builder

WORKDIR /app/frontend

# Copy package files first so npm install is cached by docker (on the host) unless dependencies change
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build
# Output lands in /app/frontend/dist

# ── Stage 2: Build the PyInstaller binary ────────────────────────────────────
FROM python:3.11-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    binutils \
    gcc \
    g++ \
    python3-dev \
    libc6-dev \
    libffi-dev \
    libssl-dev \
    zlib1g-dev \
    make \
    # Remove cached apt package lists to reduce final image size
    && rm -rf /var/lib/apt/lists/*

RUN pip install uv

# Copy lockfiles separately so this layer is cached unless dependencies change
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --all-groups

COPY backend/ ./backend/
COPY run.py run.spec ./

# Copy the built frontend assets from stage 1 into the Flask static directory
COPY --from=frontend-builder /app/frontend/dist/ ./backend/public/

# run pyinstaller to produce the final build
RUN uv run pyinstaller run.spec
