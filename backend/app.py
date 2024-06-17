import logging
from flask import Flask, send_from_directory
from backend.api.display_api import display_api
from backend.lib.ascii import print_logo
from backend.lib.container import Container
import backend.lib.logger_setup
import os
from flask_cors import CORS

# Initialise the Container class for Dependency Injection to work
Container()
app = Flask(__name__)
# app.container = container
logger = logging.getLogger('inky_dash')
print_logo()
if os.getenv("DEV", "False").lower() == "true":
    logger.info("Enabling CORs for development mode")
    CORS(app, origins=['*'])


@app.route("/")
def base():
    # serve site entry point from the base route
    return send_from_directory("public", "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    logger.info(f"Requesting {filename} {os.getcwd()}")
    if filename.endswith('/'):
        filename = filename + 'index.html'
    # serve any static files requested by the client from the public directory
    return send_from_directory("public", filename)

# def stop():
#     print("STOP")
# atexit.register(stop)
app.register_blueprint(display_api, url_prefix='/api')
