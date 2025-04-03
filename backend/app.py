import os
import signal

from flask import Flask, send_from_directory
from flask_cors import CORS

from backend.api.image_feed_api import image_feed_api
from backend.api.settings_api import settings_api
from backend.api.slideshow_api import slideshow_api
from backend.api.utils_api import utils_api
from backend.lib.ascii import print_logo
from backend.lib.container import Container
from backend.lib.logger_setup import setup_inky_logger, logger

setup_inky_logger()
# Initialise the Container class for Dependency Injection to work
container = Container()
app = Flask(__name__)

print_logo()

if os.getenv("DEV", "False").lower() == "true":
    logger.info("Enabling CORs for development mode")
    CORS(app, origins=["*"])


@app.route("/")
def base():
    # Serve site entry point from the base route
    return send_from_directory("public", "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    logger.info(f"Requesting {filename} {os.getcwd()}")
    if filename.endswith("/"):
        filename = filename + "index.html"
    # Serve any static files requested by the client from the public directory
    return send_from_directory("public", filename)


app.register_blueprint(settings_api, url_prefix="/api")
app.register_blueprint(slideshow_api, url_prefix="/api")
app.register_blueprint(image_feed_api, url_prefix="/api")
app.register_blueprint(utils_api, url_prefix="/api")

# Initialise the singleton services
Container.initialise_singletons(container)


def thread_shutdown_handler(signum, frame):
    # Ensure threads are stopped when the application exits or restarts
    container.slideshow_worker().shutdown(signum, frame)
    container.image_feed_worker().shutdown(signum, frame)


signal.signal(signal.SIGTERM, thread_shutdown_handler)
