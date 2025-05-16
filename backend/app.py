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

# Define the absolute path to the public directory from which static files are served
PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "public"))
logger.info(f"Public directory: {PUBLIC_DIR}")

print_logo()

if os.getenv("DEV", "False").lower() == "true":
    logger.info("Enabling CORs for development mode")
    CORS(app, origins=["*"])


# Catch-all route
# Handler for root path, set path param to an empty string (so it always has a value)
@app.route("/", defaults={"path": ""})
# Handler for other URL paths, first "path:" is the converter type, second ":path" is the actual path value
@app.route("/<path:path>")
def serve_frontend(path):
    logger.info(f"Requesting: {path}")

    # Check if file exists in public directory using absolute path
    file_path = os.path.join(PUBLIC_DIR, path)
    logger.debug(f"Checking file path: {file_path}")

    if os.path.isfile(file_path):
        # If it's a real file, serve it directly
        logger.debug(f"File exists, serving directly: {path}")
        dirname, filename = os.path.split(file_path)
        return send_from_directory(dirname, filename)

    # For all other paths, serve the index.html to support client-side routing
    logger.debug("File not found, serving index.html")
    return send_from_directory(PUBLIC_DIR, "index.html")


# API routes, have higher priority to the catch-all route so are tested first
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
