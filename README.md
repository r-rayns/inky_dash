# Inky Dash
Inky dash is an interface for [Inky pHAT](https://shop.pimoroni.com/products/inky-phat?variant=12549254217811), an e-paper display for the Raspberry Pi, that can be accessed from a browser via a local web server.
![demo](./demo.gif)

## Prerequisites
### Build the front-end
1. `cd` into the `frontend` directory
2. Run `npm install; npm run build`
3. This will output the build to `./frontend/out`
4. Move the contents of the build from the `out` directory to `./backend/public`
### Setup Inky pHAT on your Pi
1. Ensure the Inky pHAT is correctly setup on your Pi. Typically this should just running:
`curl https://get.pimoroni.com/inky | bash` as per the [guide](https://learn.pimoroni.com/article/getting-started-with-inky-phat).
For additional help setting up the display follow [this tutorial](https://learn.pimoroni.com/tutorial/sandyj/getting-started-with-inky-phat).
2. Reboot your Pi once the setup is complete.

## Running 🏃
1. Compress your `inky_dash` directory and transfer it across to your Raspberry Pi.
2. SSH into your Raspberry Pi.
3. Once the transfer is complete, extract `inky_dash` onto the home directory of you Raspberry Pi.
4. Consider creating a Python Virtual Environment, to keep things tidy: `mkdir ~/venv`
5. `cd venv`
6. `python3 -m venv inky-dash`
7. Change directories to the project root.
8. Install the required Python libraries`pip3 install -r requirements.txt`
9. If required, setup ufw and allow port 8080
10. From the project root run: `python3 run.py &` or 
11. You should now hopefully be able to access the Inky Dash UI via the network IP of your Pi on port 8080

## Trouble Shooting 🎯
To see additional logs run with the `--dev` flag:

```bash
python3 run.py --dev
```
- If there are issues with spidev: `sudo apt install python3-dev`
- If there are issues with numpy: `sudo apt install libopenblas0`


## Image Constraints
Uploaded images must conform with the confines of the Inky pHAT display:
- Dimensions are 212 x 104 pixels (I have not yet got around to supporting the newer 250x122 dimensions).
- Colour palette is white, black and (red or yellow) in that order, see [here](https://github.com/pimoroni/inky/blob/master/tools/inky-palette.gpl).
- File format is PNG.
- File is 100KB or less in size.
