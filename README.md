# `Inky Dash`

Inky dash is an interface for Pimoroni's line of Raspberry Pi ePaper displays. It is intended to be self-hosted from
a Raspberry Pi and accessed from a browser.

The following displays are supported:

- [Inky pHAT (212 x 104)](https://shop.pimoroni.com/products/inky-phat?variant=12549254217811)
- [Inky pHAT (250 x 122)](https://shop.pimoroni.com/products/inky-phat?variant=12549254217811)
- [Inky Impression 4"](https://shop.pimoroni.com/products/inky-impression-4?variant=39599238807635)
- [Inky Impression 5.7"](https://shop.pimoroni.com/products/inky-impression-5-7?variant=32298701324371)
- [Inky Impression 7.3"](https://shop.pimoroni.com/products/inky-impression-7-3?variant=40512683376723)

## Features ✨

Inky Dash provides two different display modes.

### Slideshow

Slideshow mode automatically cycles through a collection of images at a chosen interval. You can select
which images to display and set the transition timing.

https://github.com/user-attachments/assets/18f9485c-5c60-4445-974b-3e416f7d7dd1

### Image Feed

Image Feed mode allows your display to automatically update with images from a specified web location. When
enabled, the display periodically checks a URL that points to a PNG or JPEG image, downloading and
displaying the latest version at your chosen interval.

The source image should match your display's specifications in terms of resolution and color palette. The display will
only update when the downloaded image differs from the currently displayed image.

https://github.com/user-attachments/assets/ad384973-0740-40ff-a416-5300f17c5afd

## Running 🏃

The best way to run Inky Dash on your Raspberry Pi is to download the relevant binary from the releases
and [set up a systemd service](#Running-the-binary-as-a-service).

If you have a Raspberry Pi Zero or a Raspberry Pi 1 you'll want the ARMv6 binary.
If you have a Raspberry Pi Zero 2 or a Raspberry Pi 2, 3, 4 or 5 you'll want the ARMv8 binary.

Alternatively you can follow the steps outlined under [manual setup](#Manual-setup-).

## Manual setup 🛠️

### Build the front-end

1. `cd` into the `frontend` directory
2. Run `npm install; npm run build`
3. This will output the build to `./frontend/out`
4. Move the contents of the build from the `out` directory to `./backend/public`

### Run Inky on the Raspberry Pi

This project uses [Poetry](https://python-poetry.org/), so you do not need to create a new Python virtual environment
manually. If you don't want to or unable to use Poetry, alternative steps are outlined.

1. Compress the `inky_dash` directory and transfer it across to the Raspberry Pi.
2. SSH into the Raspberry Pi.
3. Once the transfer is complete, extract `inky_dash` into the Raspberry Pi's home directory.
4. Change directories to the project root.
5. Install the project dependencies. If you are using Poetry run `poetry install` otherwise follow
   these [alternate steps](#manual-installation-of-dependencies).
6. If required, allow port 8080 through your firewall, see [ufw](https://help.ubuntu.com/community/UFW).
7. From the project root run: `poetry run python3 run.py &` or if you are not using Poetry run: `python3 run.py &`.
8. The Inky Dash UI should now be accessible on port 8080 of the Raspberry Pi.
9. Consider setting up a systemd service to run Inky Dash as a service.

### Manual installation of dependencies

If you are unable to use Poetry, or it is not working, you can manually set up a virtual environment and install all the
dependencies.

- Create a directory to contain your Python virtual environments (if you don't already have one).

```
mkdir ~/venv
cd ~/venv
```

- Generate a new virtual environment.

```
python3 -m venv ~/venv/inky-dash
```

- Activate the virtual environment.

```
source ~/venv/inky-dash/bin/activate
```

- Install the requirements.

```
cd ~/inky_dash
pip install -r requirements.txt
```

----

*The requirements.txt file has been generated using Poetry export:*

```bash
poetry export --without-hashes -f requirements.txt -o requirements.txt
```

## Building a binary 📦

PyInstaller can be used to create a single binary file which can run Inky Dash.
Ensure that the build process is executed on the CPU architecture that matches the target environment.

1. From the project root run `poetry run pyinstaller run.spec` or `pyinstaller run.spec` if you are not using Poetry.
2. This should create a binary called `run` inside the `dist` directory
3. To start Inky Dash run the binary e.g. `./dist/run.py`

**You can alternatively use the pre-compiled binary attached to the release (if one is available for your CPU
architecture)**

### Running the binary as a service

A systemd file can be used to run inky dash as a service.

1. Create a new file called `inky_dash.service` in `/etc/systemd/system/`.

2. Copy the example below into the new file. Check the `ExecStart` path points to the Inky Dash binary and the
   `WorkingDirectory` points to the parent directory of the binary. Replace `your_username` with the correct username.

```
[Unit]
Description=Inky Dash Service
After=network.target

[Service]
ExecStart=/home/your_username/inky_dash/dist/run
WorkingDirectory=/home/your_username/inky_dash/dist
User=your_username
Restart=always

[Install]
WantedBy=multi-user.target
```

3. Save the systemd service file.

4. Refresh systemd then enable and start the service

```
sudo systemctl daemon-reload
sudo systemctl enable inky_dash.service
sudo systemctl start inky_dash.service
```

## Trouble Shooting 🎯

To see additional logs run with the `--dev` flag:

```bash
poetry run python3 run.py --dev
```

- If there are issues with spidev: `sudo apt install python3-dev`
- If there are issues with numpy: `sudo apt install libopenblas0`

## Testing 🧪

Pytest is the test runner for this project. Run the tests with:

```bash
cd inky_dash
python3 -m pytest
```

Or if you are using Poetry:

```bash
poetry run python3 -m pytest
```
