#!/usr/bin/env bash

# Reset
Colour_Off=''

# Colours
Red=''
Green=''
White=''
Yellow=''

# Bold
Bold_White=''
Bold_Green=''
Bold_Yellow=''

# -t 1 returns true if stdout is connected to a terminal and false if it is being redirected to a file or pipe
# If the script will output to the terminal then we setup ANSI colour codes
if [[ -t 1 ]]; then
  # Reset
  Colour_Off='\033[0m' # Text Reset

  # Colours
  Red='\033[0;31m'
  Green='\033[0;32m'
  White='\033[0;2m'
  Yellow='\033[0;33m'

  # Bold
  Bold_Green='\033[1;32m'
  Bold_White='\033[1m'
  Bold_Yellow='\033[1;33m'
fi

error() {
  echo -e "${Red}error${Colour_Off}:" "$@" >&2
  exit 1
}

# Logging functions write to stderr (>&2) so output is not captured when
# functions are called via $() command substitution
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

warning() {
  echo -e "${Yellow}$* ${Colour_Off}" >&2
}

warning_bold() {
  echo -e "${Bold_Yellow}$* ${Colour_Off}" >&2
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
# Configuration Variables
#==============================================================================

INSTALL_DIR="/opt/inky_dash"                       # Installation directory opt (optional addon software)
BINARY_NAME="inky_dash.bin"                        # Name of the compiled executable
SERVICE_NAME="inky_dash.service"                   # Name for the systemd service
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}" # Location of the systemd service file
GITHUB_REPO="r-rayns/inky_dash"                    # GitHub repository (owner/repo format)
APP_PORT="8080"                                    # Port Inky runs on
LATEST_VERSION=""                                  # Latest release version

#==============================================================================
#
#==============================================================================

# The script will exit with an error if not run as root.
# Root is required for things such as enabling I2C/SPI and writing to /opt/ and /etc/systemd/system
check_root() {
  # $EUID is a bash variable containing the effective user ID
  # Root user has ID 0, so we use this to check user is root
  if [[ $EUID -ne 0 ]]; then
    error "This script must be run as root (use sudo)"
  fi
}

# raspi-config is the Raspberry Pi configuration tool, used to enable I2C/SPI.
# It is included by default on Raspberry Pi OS.
check_raspi_config() {
  # Suppress error messages by redirecting to null device ($>/dev/null)
  if ! command -v raspi-config &>/dev/null; then
    error "raspi-config required for install, please consult documentation on installing it and then rerun this script"
  else
    success "✓ raspi-config tool is installed"
  fi
}

get_release_data() {
  # Get latest release info
  local release_url="https://api.github.com/repos/${GITHUB_REPO}/releases/latest"

  local release_data
  # Get JSON data about the latest release (-s for silent request)
  release_data=$(curl -s "$release_url")

  # Check latest release data was retrieved (-z tests if string is empty)
  if [[ -z "$release_data" ]]; then
    error "Failed to fetch release information from GitHub"
  fi

  echo "$release_data"
}

get_installed_version() {
  installed_version=$(awk -F'=' '/X-InkyVersion/ {print $2}' ${SERVICE_FILE})
  echo "$installed_version"
}

get_latest_version() {
  if [ -z "$LATEST_VERSION" ]; then
    local release_data
    release_data=$(get_release_data)

    local version
    version=$(echo "$release_data" | python3 -c "
import sys, json
print(json.load(sys.stdin)['tag_name'])
")
    LATEST_VERSION=$version
  fi
}

# Downloads the pre-compiled binary from the latest GitHub release
download_binary() {
  info_bold "Downloading latest Inky Dash binary..."

  # Get the CPU arcitecture of the device so we can download the relevant binary
  local arcitecture
  arcitecture=$(uname -m)

  local binary_arcitecture

  # Set the binary_arcitecture variable depending on the detected CPU arcitecture
  if [[ $arcitecture == "aarch64" ]]; then
    info "ARMv8 arcitecture detected"
    binary_arcitecture="armv8"
  elif [[ $arcitecture == "armv6l" ]]; then
    info "ARMv6 arcitecture detected"
    binary_arcitecture="armv6"
  else
    error "Unsupported arcitecture"
  fi

  local release_data
  release_data=$(get_release_data)

  # Extract the download URLs for each available binary file (using Python)
  readarray -t download_urls < <(echo "$release_data" | python3 -c "
import sys, json
for asset in json.load(sys.stdin)['assets']:
    print(asset['browser_download_url'])
")

  # Find the binary download URL that matches the arcitecture
  local download_url
  for url in "${download_urls[@]}"; do
    if [[ $url == *"$binary_arcitecture"* ]]; then
      download_url="$url"
      break
    fi
  done

  # Ensure we have found a download URL for the relevant binary
  if [[ -z "$download_url" ]]; then
    error "Could not find binary in latest release"
  fi

  # Begin the download
  info "Downloading from: $download_url"

  # (-p) creates directory and any missing parent directories
  mkdir -p "$INSTALL_DIR"

  # Download the binary
  # (-L) follows redirects (GitHub redirects to the actual release binary)
  if ! curl --clobber -L -o "${INSTALL_DIR}/${BINARY_NAME}" "$download_url"; then
    error "Failed to download binary"
  fi

  # Make the downloaded file executable
  chmod +x "${INSTALL_DIR}/${BINARY_NAME}"

  success "✓ Binary downloaded and installed to ${INSTALL_DIR}/${BINARY_NAME}"
}

# I2C (Inter-Integrated Circuit) used by the Inky displays
check_i2c() {
  # get_i2c returns 0 if enabled, 1 if disabled
  [[ $(raspi-config nonint get_i2c) -eq 0 ]]
}

# Returns: 0 if I2C was enabled (change made), 1 if already enabled (no change)
enable_i2c() {
  info_bold "⚙️Enabling I2C..."

  # Check if already enabled - no need to modify anything
  if check_i2c; then
    success "✓ I2C is already enabled"
    return 1 # No change made
  fi

  # nonint = non-interactive mode (no user prompts)
  # Enable I2C (0 = enable, 1 = disable)
  raspi-config nonint do_i2c 0
  success "✓ I2C enabled"
  return 0 # Change made
}

# SPI (Serial Peripheral Interface) used by Inky displays
check_spi() {
  # get_spi returns 0 if enabled, 1 if disabled
  [[ $(raspi-config nonint get_spi) -eq 0 ]]
}

# Returns: 0 if SPI was enabled (change made), 1 if already enabled (no change)
enable_spi() {
  info_bold "⚙️Enabling SPI..."

  # Check if already enabled
  if check_spi; then
    success "✓ SPI is already enabled"
    return 1 # No change made
  fi

  # Enable SPI (0 = enable, 1 = disable)
  raspi-config nonint do_spi 0
  success "✓ SPI enabled"
  return 0 # Change made
}

# Create a systemd service definition
# to automatically start Inky Dash on boot and restart it if it crashes.
create_service() {
  info_bold "Creating systemd service..."

  # Use the user who invoked sudo, otherwise use the current user
  local service_user="${SUDO_USER:-$USER}"

  # Write the systemd file
  cat >"$SERVICE_FILE" <<EOF
[Unit]
# Service name shown in logs and status commands
Description=Inky Dash - ePaper display interface
# Wait for network to be available before starting
After=network.target
X-InkyVersion=${LATEST_VERSION}

[Service]
# Run as the user who installed the service
User=${service_user}
# Directory where the binary looks for config files
WorkingDirectory=${INSTALL_DIR}
# Path to the executable
ExecStart=${INSTALL_DIR}/${BINARY_NAME}
# Create /var/lib/inky_dash/ owned by the service user for config and data files
StateDirectory=inky_dash
# Automatically restart if the process exits with an error
Restart=on-failure
# Wait 10 seconds before restarting to prevent rapid restart loops
RestartSec=10

[Install]
# Start this service when the system reaches multi-user mode (normal boot)
WantedBy=multi-user.target
EOF

  success "✓ Service file created at $SERVICE_FILE (User: ${service_user})"

  # Reload systemd to recognize the new service file
  systemctl daemon-reload

  # Enable service to start automatically on boot
  systemctl enable "$SERVICE_NAME"

  success "✓ Service created and enabled to start on boot"
}

get_ip_address() {
  local ip
  # hostname -I returns all IP addresses assigned to the device
  # awk '{print $1}' takes the first IP address (primary network interface)
  ip=$(hostname -I | awk '{print $1}' || echo "Unable to determine")
  echo "$ip"
}

#==============================================================================
# Main Installation Flows
#==============================================================================

update() {
  echo
  info_bold "=== Inky Dash Update ==="
  echo

  local installed_version
  installed_version=$(get_installed_version)

  if [ "$LATEST_VERSION" == "$installed_version" ]; then
    success_bold "Inky Dash is up to date at version ${installed_version}"
    exit 0
  fi

  if systemctl is-active --quiet "$SERVICE_NAME"; then
    info_bold "Inky Dash is running, stopping service before update"
    start_spinner
    systemctl stop --quiet "$SERVICE_NAME"
    stop_spinner
    echo
  fi

  download_binary
  echo

  if [ ! -f "$SERVICE_FILE" ]; then
    warning "No existing systemd service was detected for Inky Dash"
    create_service ""
    echo
  fi

  info_bold "🔃 Restarting Inky Dash"
  systemctl restart --quiet "$SERVICE_NAME"
  echo

  if systemctl is-active --quiet "$SERVICE_NAME"; then
    success_bold "=== Success! Inky Dash has been updated to $LATEST_VERSION ==="
  else
    error "Failed to start Inky Dash after update. Please check service log for errors"
  fi
}

install() {
  echo
  info_bold "=== Inky Dash Installation ==="
  echo

  # Verify raspi-config is available
  check_raspi_config

  # Download and install the Inky Dash binary
  download_binary
  echo

  # Enable required hardware interfaces
  local i2c_changed=false
  local spi_changed=false

  enable_i2c && i2c_changed=true
  echo

  enable_spi && spi_changed=true
  echo

  # Set up the systemd service
  create_service
  echo

  # Installation complete - show user instructions
  info_bold "=== Installation Complete ==="
  echo

  success "Inky Dash has been installed to ${INSTALL_DIR}"
  info "Service: ${SERVICE_NAME}"
  echo

  # Determine if reboot is needed based on whether we actually made changes to the hardware interfaces
  local needs_reboot=false
  if [[ "$i2c_changed" == true ]] || [[ "$spi_changed" == true ]]; then
    needs_reboot=true
  fi

  if [[ "$needs_reboot" == true ]]; then
    # I2C/SPI changes require a reboot
    warning_bold "⚠ REBOOT REQUIRED"
    info "I2C/SPI changes require a system reboot to take effect."
    echo
    info "After rebooting, the service will start automatically."
    info "Or start it manually with:"
    info_bold " 🔹sudo systemctl start ${SERVICE_NAME}"
  else
    # No reboot needed - can start immediately
    info "Starting Inky Dash..."
    systemctl start ${SERVICE_NAME}
  fi

  echo
  info "To start the the service"
  info_bold " 🔹sudo systemctl start ${SERVICE_NAME}"
  echo
  info "To stop the the service"
  info_bold " 🔹sudo systemctl stop ${SERVICE_NAME}"
  echo
  info "To view service status:"
  info_bold " 🔹sudo systemctl status ${SERVICE_NAME}"
  echo
  info "To view logs:"
  info_bold " 🔹sudo journalctl -u ${SERVICE_NAME} -f"
  echo

  # Show user how to access the web interface
  local ip_address
  ip_address=$(get_ip_address)
  info_bold "=== Accessing the Inky Web Interface ==="
  info "Once the service is running, access Inky Dash in your browser at:"
  echo
  success_bold "  http://${ip_address}:${APP_PORT}"
  echo
  info "From this device, you can also use:"
  info_bold "  http://localhost:${APP_PORT}"
  echo
}

uninstall() {
  echo
  info_bold "=== Inky Dash Uninstall ==="
  echo

  # Stop and disable the service if it exists
  if [ -f "$SERVICE_FILE" ]; then
    if systemctl is-active --quiet "$SERVICE_NAME"; then
      info_bold "Stopping Inky Dash service..."
      systemctl stop "$SERVICE_NAME"
      success "✓ Service stopped"
    fi

    systemctl disable "$SERVICE_NAME"
    success "✓ Service disabled"

    rm "$SERVICE_FILE"
    success "✓ Service file removed"

    systemctl daemon-reload
    success "✓ systemd reloaded"
  else
    warning "No systemd service file found at ${SERVICE_FILE}, skipping"
  fi

  echo

  # Remove the install directory
  if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    success "✓ Removed install directory ${INSTALL_DIR}"
  else
    warning "Install directory ${INSTALL_DIR} not found, skipping"
  fi

  # Remove the state/config directory created by StateDirectory=inky_dash
  local state_dir="/var/lib/inky_dash"
  if [ -d "$state_dir" ]; then
    rm -rf "$state_dir"
    success "✓ Removed state directory ${state_dir}"
  else
    warning "State directory ${state_dir} not found, skipping"
  fi

  echo
  success_bold "Inky Dash has been uninstalled"
  echo
}

main() {
  # Verify we have root privileges
  check_root

  # Check for uninstall flag
  if [[ "${1}" == "-u" ]]; then
    uninstall
    exit 0
  fi

  # Get the latest version
  get_latest_version

  if [ -f "${INSTALL_DIR}/${BINARY_NAME}" ]; then
    update
  else
    install
  fi
}

# Execute the main installation function (entry point)
main "$@"
