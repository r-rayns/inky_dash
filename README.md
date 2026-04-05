# `Inky Dash`

Inky dash is a web interface for Pimoroni's line of Raspberry Pi ePaper displays. It is intended to be self-hosted from
a Raspberry Pi and accessed from a browser.

The following displays are supported:

- [Inky pHAT (212 x 104)](https://shop.pimoroni.com/products/inky-phat?variant=12549254217811)
- [Inky pHAT (250 x 122)](https://shop.pimoroni.com/products/inky-phat?variant=12549254217811)
- [Inky Impression 4"](https://shop.pimoroni.com/products/inky-impression-4?variant=39599238807635)
- [Inky Impression 5.7"](https://shop.pimoroni.com/products/inky-impression-5-7?variant=32298701324371)
- [Inky Impression 7.3"](https://shop.pimoroni.com/products/inky-impression-7-3?variant=40512683376723)
- [Inky Impression 7.3 2025 ed."](https://shop.pimoroni.com/products/inky-impression-7-3?variant=55186435244411)
- [Inky Impression 13.3"](https://shop.pimoroni.com/products/inky-impression-7-3?variant=55186435277179)

## Important 📌

To support the new Inky Impression 7.3" and Inky Impression 13.3" displays the Inky library has been updated to the latest version (v2.1.0).

As a consequence of this change you may find setting an image no longer works, as in nothing changes on the display. It's possible this is accompanied by the following error message:

```bash
Woah there, some pins we need are in use!
     Chip Select: (line 8, GPIO8) currently claimed by spi0 CS0
```

If you do experience this, try adding `dtoverlay=spi0-0cs` to the end of your `/boot/firmware/config.txt` file, saving it and rebooting. As per the [advice](https://github.com/pimoroni/inky?tab=readme-ov-file#install-stable-library-from-pypi-and-configure-manually) in the official Inky repo.

## Features ✨

Inky Dash provides two different display modes.

### Slideshow

Slideshow mode automatically cycles through a collection of images at a chosen interval. You can select
which images to display and set the transition timing.

<https://github.com/user-attachments/assets/68a7088d-d6e4-4474-94b9-65278ce625c9>

_Video of Slideshow mode in action_

![Inky pHAT 212x104 display in Slideshow mode](examples/212x104-example.png)

_Inky pHAT 212x104 display in Slideshow mode_

### Image Feed

Image Feed mode allows your display to automatically update with images from a specified web location. When
enabled, the display periodically checks a URL that points to a PNG or JPEG image, downloading and
displaying the latest version at your chosen interval.

The display will only update when the downloaded image differs from the currently displayed image.

<https://github.com/user-attachments/assets/7950718a-322a-4d3b-8344-30b2bd62b36c>

_Video of Image Feed mode in action_

#### Image Feed Projects

While image feed mode can be used with any hosted image, such as webcam feeds, the following projects are specifically
designed to generate images that can be easily integrated with this mode.

- [Inky Dash Energy Mix Image Feed](https://github.com/r-rayns/inky_uk_energy)
- [Inky Dash YouTube Live Image Feed](https://github.com/r-rayns/inky_yt_capture)

![Inky Impression 4" displaying the energy mix image feed](examples/impression-4-image-feed.png)

_Inky Impression 4" displaying the energy mix image feed_

#### Make your own

Image feed mode opens up the possibility of creating your own image feeds. Just host an image, either locally (for
personal use) or on the web and then point Inky Dash to that location. If you do make your own image feed project,
let me know and I can list it here for others to discover.

## Install 🫙

The best way to install Inky Dash on your Raspberry Pi is to download and run the installer:

```bash
curl -fsSL https://raw.githubusercontent.com/r-rayns/inky_dash/main/install.sh | sudo bash
```

The install script will download the latest release binary, enable I2C and SPI (the hardware communication interfaces used by the Inky display), and create a systemd service so Inky Dash runs on boot.

### Post-install steps

After installation you will likely need to add `dtoverlay=spi0-0cs` to the end of `/boot/firmware/config.txt` and reboot, otherwise the display may not update. See the [Important](#important-📌) section for more details.

If you have a firewall enabled, allow port 8080 through:

```bash
sudo ufw allow 8080/tcp comment INKY-DASH
```

### Uninstall

If you have installed Inky Dash using the install script you can uninstall it by running the install script again and passing a `-u` flag.

```bash
curl -fsSL https://raw.githubusercontent.com/r-rayns/inky_dash/main/install.sh -u | sudo bash
```

### Update

If you have installed Inky Dash using the install script you perform an update by running the install script again.

### Alternatively

Alternatively you can perform the manual setup by following the steps outlined under [manual setup](#manual-setup-🛠️).

## Manual setup 🛠️

These steps will guide you through downloading the project and transferring it to your Raspberry Pi.

**Ensure you have [enabled I2C and SPI](#enabling-i2c-and-spi) on your RaspberryPi**

### Enabling I2C and SPI

1. Run raspi-config on your Raspberry Pi.

   ```bash
   sudo raspi-config
   ```

2. In the menu, go to Interface Options.
3. Select I2C and enable it.
4. Repeat for SPI and enable it.
5. Select Finish and reboot the Pi.

### 1. Download the project

Download this repository from GitHub. You can clone it using:

```bash
git clone https://github.com/r-rayns/inky_dash.git`
```

### 2. Build the front-end

Change directories to the `./inky_dash/frontend` directory and build the front-end

```bash
cd frontend
npm install; npm run build
```

The build will be output to the `./frontend/dist` directory.

Move the contents of the build from the `dist` directory to the `./backend/public` directory

### 3. Transfer the project to the Raspberry Pi

Compress the `inky_dash` directory and transfer it across to your Raspberry Pi.

```bash
tar -czf inky_dash.tar.gz inky_dash
scp inky_dash.tar.gz <pi_username>@<pi_address>:~/
```

### 4. Extract the project on the Raspberry Pi

Once the transfer is complete, SSH onto your Raspberry Pi and extract `inky_dash.tar.gz` into the Raspberry Pi's home
directory.

```bash
tar -xzf inky_dash.tar.gz inky_dash
```

### 5. Install the project dependencies

Next install the project dependencies.

The best way to install dependencies is to use `uv`. Do follow the [official documentation](https://docs.astral.sh/uv/getting-started/installation/) for installing `uv` but typically this will involve running the following:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Once `uv` is setup, install the project dependencies:

```bash
# At the root of the project directory run the following
uv sync
```

#### Alternative dependency installation method

If `uv` does not work for you, dependencies can alternatively be installed using pip.

To install using pip create a new Python virtual environment:

```bash
# Create the virtual environment directory, if it doesn't already exist
mkdir ~/venv
# Create the virtual environment
python3 -m venv ~/venv/inky-dash
# Activate the virtual environment
source ~/venv/inky-dash/bin/activate
```

Then run the following, from the project root:

```bash
cd ~/inky_dash
pip install -r requirements.txt
```

**If you experience errors here check the [Trouble Shooting](#trouble-shooting-) section.**

### 6. Open firewall port 8080

**If required**, allow port 8080 through your firewall, see [ufw](https://help.ubuntu.com/community/UFW).

```bash
sudo ufw allow 8080/tcp comment INKY-DASH
```

### 7. Run Inky Dash

If you just want to quickly run Inky Dash then go to the project root and execute:

```bash
uv run run.py
```

Or if you installed using pip:

```bash
# Activate the virtual environment (if you haven't already)
source ~/venv/inky-dash/bin/activate

python3 run.py
```

**The recommended way to run this project is as a service. This ensures it starts automatically on boot and stays
running in the background as a managed process.**

### 8. Setting up a systemd service

A systemd file can be used to run inky dash as a service. Follow the steps outline [here](#Running-as-a-service-),
you'll want to follow the instructions for running the Python script as a service.

## Building a binary 📦

> You can alternatively use the pre-compiled binary attached to the release (if one is available for your CPU
> architecture)

PyInstaller can be used to create a single binary file that can be used to run Inky Dash.
**Ensure that the build process is executed on the CPU architecture that matches the target environment.**

Make sure the frontend is built so that there is a `backend/public` directory and then from the project root run:

```bash
uv run pyinstaller run.spec
```

Or if not using uv:

```bash
source ~/venv/inky-dash/bin/activate
pyinstaller run.spec
```

This will create a binary called `run` inside the `dist` directory of the project root.
You can rename this binary to something more meaningful such as `inky_dash.bin`

To start Inky Dash run the binary e.g. `./dist/run`.

**It is recommended that you run the Inky Dash binary as a service.**

## Running as a service ⚙️

### 1. Create a `.service` file

Change directories to:

```bash
cd /etc/systemd/system/
```

And create a new `.service` file:

```bash
touch inky_dash.service
```

### 2. Edit the file

Choose from one of the following options, depending on if you want to run the binary as a service or the Python script
as a service

#### a) If you want to run the Python script as a service using uv

Copy the example below into the new file.

- `WorkingDirectory` points to the project directory. Config files will be stored here.
- `ExecStart` uses `uv run` to execute the script with the correct dependencies.
- `your_username` should be replaced with the correct username.

```bash
[Unit]
Description=Inky Dash - ePaper display interface
After=network.target

[Service]
User=<your_username>
WorkingDirectory=/home/<your_username>/inky_dash/
ExecStart=/home/<your_username>/.local/bin/uv run run.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Note:** The default installation path for `uv` is `~/.local/bin/uv`. If you installed `uv` to a different location, you can find the path by running `which uv`.

Save the file.

#### b) If you want to run the Python script as a service using a virtual environment

Copy the example below into the new file.

- `WorkingDirectory` points to the project directory. Config files will be stored here.
- `ExecStart` path should use the Python binary in the virtual environment you set up, to run `run.py`.
- `your_username` should be replaced with the correct username.

```bash
[Unit]
Description=Inky Dash - ePaper display interface
After=network.target

[Service]
User=<your_username>
WorkingDirectory=/home/<your_username>/inky_dash/
ExecStart=/home/<your_username>/venv/inky-dash/bin/python3 run.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Save the file.

#### c) If you want to run the binary as a service

This mirrors the service created by the install script. If you used the installer, this is already set up for you.

Copy the example below into the new file, replacing `your_username` with the correct username.

```bash
[Unit]
Description=Inky Dash - ePaper display interface
After=network.target

[Service]
User=<your_username>
WorkingDirectory=/opt/inky_dash
ExecStart=/opt/inky_dash/inky_dash.bin
StateDirectory=inky_dash
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

If you are creating the service manually without the install script, you will also need to create the state directory:

```bash
sudo mkdir /var/lib/inky_dash
```

Save the file.

#### 3. Start the service

You'll now need to refresh the systemd daemon and enable the service:

```bash
# Refresh systemd so your new service is detected
sudo systemctl daemon-reload
# Enable your new service so it starts on boot
sudo systemctl enable inky_dash
# Start your new service
sudo systemctl start inky_dash
```

## Trouble Shooting 🎯

You may need to install additional dependencies if you are running into issues when setting up on your Raspberry Pi:

- If there are issues with spidev: `sudo apt install python3-dev`
- If there are issues with numpy: `sudo apt install libopenblas0`

### Additional logs

To see additional logs run with the `--dev` flag:

```bash
uv run run.py --dev
```

## Flags

- `--dev` Enables development mode for additional logging and hot-reloading.
- `--desktop` When running in a desktop environment, actions to update the Inky display will not be attempted.

## Development 🧑‍💻

### Install dependencies using uv

Dependencies are managed using [uv](https://docs.astral.sh/uv/).

To install all the dependencies for the first time, using uv, run the following:

```bash
uv sync
```

### Updating dependencies

To add a new dependency:

```bash
uv add <package-name>
```

To add a development dependency:

```bash
uv add --dev <package-name>
```

To generate a requirements.txt file (includes dev dependencies):

```bash
uv export --no-hashes -o requirements.txt
```

To generate a requirements.txt file without dev dependencies:

```bash
uv export --no-hashes --no-dev -o requirements.txt
```

### Testing

Pytest is the test runner for this project. Run the tests with:

```bash
cd inky_dash
uv run pytest
```

## Attribution 🏷️

- The stand I use for my Pi Zero 2 W was 3D printed using an Adafruit [design](https://github.com/adafruit/Adafruit_Learning_System_Guides/tree/main/Pi_Zero_Stand).
