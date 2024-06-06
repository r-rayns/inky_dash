# syntax=docker/dockerfile:1
# experimental docker file to create binary for RPi Zero 2 arm32v7 device
# RPi Zero has arm32v6 architecture - cannot find a supporting image for this
# RPi Zero 2 W has arm32v7 architecture
FROM dtcooper/raspberrypi-os:python3.11

ENV PATH="/venv/bin:$PATH"
WORKDIR /app

# Install binutils requirment for PyInstaller
RUN apt-get update && apt-get install -y \
    binutils \
    gcc \
    g++ \
    python3-dev \
    libc6-dev \
    libffi-dev \
    libssl-dev \
    zlib1g-dev \
    make

# Copy files from the build context to the working directory in the container
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run PyInstaller for ARM
RUN pyinstaller run.spec
