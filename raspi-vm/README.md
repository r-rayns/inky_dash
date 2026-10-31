# Raspberry Pi VM Test Environment

This directory contains Ansible playbooks for testing the Inky Dash in an emulated Raspberry Pi environment. Using [ptrsr/pi-ci](https://github.com/ptrsr/pi-ci) a Docker image that runs a Raspberry Pi OS virtual machine using QEMU emulation.

```
┌─────────────────────────────────────────────────┐
│ Docker Container (ptrsr/pi-ci)                  │
│   └─ QEMU (ARM64 emulator)                      │
│       └─ Raspberry Pi OS (virtual machine)      │
└─────────────────────────────────────────────────┘
```

`host/` - Contains playbooks that run locally (Docker host)
`raspi/` - Contains playbooks that run inside the Raspberry Pi VM

## Usage

```bash
# Start VM
sudo ansible-playbook main.yml

# SSH into the VM
ssh root@localhost -p 2222 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null
```

Once you have SSH'd onto the VM run `install.sh` to create a fresh install of Inky Dash:

```bash
# Inside the VM
./install.sh
```

The Inky service should then start and you can access the UI using an SSH tunnel:

```bash
# Access the Inky Dash UI (port 8080) via SSH tunnel
ssh -L 8181:localhost:8080 root@localhost -p 2222 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null
# Then open http://localhost:8181 in your browser
```

> We have to tunnel because Pi-Ci has configured QEMU to only forward port 2222 from the guest VM to the Docker container, so an SSH tunnel is needed to access other services running inside the VM.

## Known Issues

When running the install script inside the VM, errors will appear when enabling I2C and SPI interfaces (e.g. `mount: /config/device-tree: mount point does not exist` and `modprobe: FATAL: Module i2c-dev not found`). These are expected as the QEMU VM lacks real hardware device tree and kernel modules.

## Requirements

- Docker
- Ansible
