#!/usr/bin/env bash
#
# build.sh - Build PyInstaller binaries for Raspberry Pi using Docker buildx
# Usage: ./build.sh [arm64|armv7]   (default: build both)

#==============================================================================
# Logger
#==============================================================================

# Reset
Colour_Off=''

# Colours
Red=''
Green=''
White=''

# Bold
Bold_White=''
Bold_Green=''

if [[ -t 1 ]]; then
  Colour_Off='\033[0m'
  Red='\033[0;31m'
  Green='\033[0;32m'
  White='\033[0;2m'
  Bold_Green='\033[1;32m'
  Bold_White='\033[1m'
fi

error() {
  echo -e "${Red}error${Colour_Off}:" "$@" >&2
  exit 1
}

info() {
  echo -e "${White}$* ${Colour_Off}" >&2
}

info_bold() {
  echo -e "${Bold_White}$* ${Colour_Off}" >&2
}

success() {
  echo -e "${Green}$* ${Colour_Off}" >&2
}

success_bold() {
  echo -e "${Bold_Green}$* ${Colour_Off}" >&2
}

spinner_pid=

start_spinner() {
  set +m
  echo -n "$1         "
  { while :; do for X in '  •     ' '   •    ' '    •   ' '     •  ' '      • ' '     •  ' '    •   ' '   •    ' '  •     ' ' •      '; do
    echo -en "\b\b\b\b\b\b\b\b$X"
    sleep 0.1
  done; done & } 2>/dev/null
  spinner_pid=$!
}

stop_spinner() {
  { kill -9 $spinner_pid && wait; } 2>/dev/null
  set -m
  echo -en "\033[2K\r"
}

trap stop_spinner EXIT

#==============================================================================
# Configuration
#==============================================================================

BUILDER="rpi-builder"

#==============================================================================
# Functions
#==============================================================================

build_platform() {
  # $1 docker platform target e.g. linux/arm64
  local platform="$1"
  # $2 image tag used to identify the built docker image e.g. inky-dash-arm64
  local tag="$2"
  # $3 filename for the extracted binary e.g. inky_dash_arm64.bin
  local output="$3"

  info_bold "Building docker image for platform target: ${platform}..."

  # Build the image for the target platform and load it into the local Docker image store (--load)
  docker buildx build --platform "$platform" --load -t "$tag" . ||
    error "docker build failed for platform target: ${platform}"

  # Create a stopped container from the image so we can copy files out of it
  docker create --name "extract-${tag}" "$tag" >/dev/null
  # Copy the PyInstaller binary out of the container to the project root
  docker cp "extract-${tag}:/app/dist/run" "./${output}"
  # Remove the stopped container now we have the binary
  docker rm "extract-${tag}" >/dev/null
  # Remove the image as it is no longer needed
  docker rmi "$tag" >/dev/null

  success "✓ ${output}"
}

#==============================================================================
# Main Installation Flow
#==============================================================================
main() {
  # Create the buildx builder if it doesn't already exist
  if ! docker buildx ls | grep -q "^${BUILDER}"; then
    # The builder is what supports multi-platform builds via QEMU emulation
    start_spinner "Creating buildx builder..."
    # --use sets this as the active builder for subsequent buildx commands
    docker buildx create --use --name "$BUILDER" >/dev/null
    stop_spinner
  fi

  start_spinner "Registering QEMU ARM emulation..."
  # Registers QEMU as a kernel-level handler for ARM binaries so Docker can
  # execute ARM instructions on this host. Idempotent - safe to run repeatedly.
  docker run --privileged --rm tonistiigi/binfmt --install arm64,arm >/dev/null 2>&1
  stop_spinner

  # Default to building both platforms if no argument is provided
  local target="${1:-all}"

  # Extract version from pyproject.toml e.g. 4.4.0
  local version
  version=$(grep '^version' pyproject.toml | sed 's/version = "\(.*\)"/\1/' | tr '.' '-')

  echo
  info_bold "=== 🛠️ Inky Dash Build 🛠️ ==="
  echo

  if [[ "$target" == "all" || "$target" == "arm64" ]]; then
    build_platform "linux/arm64" "inky-dash-arm64" "inky-dash-v${version}-arm64.bin"
    echo
  fi

  if [[ "$target" == "all" || "$target" == "armv7" ]]; then
    build_platform "linux/arm/v7" "inky-dash-armv7" "inky-dash-v${version}-armv7.bin"
    echo
  fi

  success_bold "=== Build complete ==="
}

main "$@"
