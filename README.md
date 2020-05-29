# Inky Dash
Inky dash is an interface for [Inky pHAT](https://shop.pimoroni.com/products/inky-phat?variant=12549254217811), an e-paper display for the Raspberry Pi, that can be accessed from a browser via a local 
web server.

## Build
Before commencing ensure the Inky pHAT is correctly setup on your Pi. 
For help setting up the display follow [this tutorial](https://learn.pimoroni.com/tutorial/sandyj/getting-started-with-inky-phat).

1. Install the latest version of Node, must be version 11 or greater. 
    - It's recommended to install Node through the 
      [Node Version Manager](https://github.com/nvm-sh/nvm)
    - Using NVM run `nvm install node`
    - If your hardware is armv6, install the last supported version of node (11.15.0) `nvm install 11.15.0`. Newer unoffical builds can be found [here](https://unofficial-builds.nodejs.org/download/release/).
2. Clone this directory onto your Raspberry Pi using Git clone
3. From the project root run `npm install`
4. Next build the UI by running `npm install; npm run build` inside `/src/ui`

***Note**: On hardware with low RAM such as the Pi Zero 
it may be quicker to build on a more powerful machine 
and copy across the files*

## Run
1. On your Pi inside the project root run `node app.js`.
2. On another device browse to your Raspberry Pi on port 8080, e.g.`http://192.168.0.24:8080` 
3. From here you should be able to upload an image to the Pi.

Uploaded images must conform with the confines of the Inky pHAT display:
- Dimensions are 212 x 104 pixels.
- Colour palette is white, black and (red or yellow) in that order, see [here](https://github.com/pimoroni/inky/blob/master/tools/inky-palette.gpl).
- File format is PNG.

**Auto start**

Run Inky Dash manually once before setting up auto start.

There are numerous solutions to running Node scripts on boot, here are a few possibilities:

- [forever](https://www.npmjs.com/package/forever) & [forever-service](https://www.npmjs.com/package/forever-service)
- [pm2](https://www.npmjs.com/package/pm2)
- [rc.local](https://www.raspberrypi.org/documentation/linux/usage/rc-local.md) 
- [systemd](https://www.raspberrypi.org/documentation/linux/usage/systemd.md)

A quick and dirty way could be placing a line in rc.local to run the node server, similar to:
```
su pi -c '/home/pi/.nvm/versions/node/v11.15.0/bin/node /home/pi/inky_dash/app.js < /dev/null &'
```
You have to be explicit with the node binary as the user's PATH variables are not accessible during boot up.

## Additional Info

**Tech Stack:**
- **Node.js + Express** handles REST API and serves the interface.
- **React + Redux** used in construction of the interface.

**Requirements**
- **Node.js** v11+

##### Why Express, React, Redux, etc...?
It may have been more suitable to have created Inky Dash 
using a Python web framework such as Flask, but the 
primary purpose of this project was so I could get more 
experience with the Express framework and React library.



