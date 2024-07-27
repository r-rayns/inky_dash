import argparse
import multiprocessing
import signal
import gunicorn.app.base
import os
from gunicorn.config import Config

# PyInstaller works with Python scripts, so we need this Python script to run the Gunicorn server for the inky_dash application

# Parse command-line arguments
parser = argparse.ArgumentParser(description='Start the Gunicorn server.')
parser.add_argument('--dev', action='store_true',
                    help='Enable development mode')
parser.add_argument('--desktop', action='store_true',
                    help='When running in a desktop environment, actions to update the Inky display will not be attempted')

args = parser.parse_args()

# Check the value of the flags
if args.dev:
    os.environ["DEV"] = "True"
else:
    os.environ["DEV"] = "False"

if args.desktop:
    os.environ["DESKTOP"] = "True"
else:
    os.environ["DESKTOP"] = "False"


def number_of_workers():
    return (multiprocessing.cpu_count() * 2) + 1


def worker_exit(server, worker):
    # The spawned worker thread in the SlideshowWorker class causes a delay in server reloading until a timeout occurs.
    # Send a SIGTERM signal to the worker to allow SlideshowWorker to stop the thread and let the server reload.

    os.kill(worker.pid, signal.SIGTERM)
    pass


class StandaloneApplication(gunicorn.app.base.BaseApplication):
    def __init__(self, app_module, options={}):
        self.options = options or {}
        self.app_module = app_module
        super().__init__()

    def load_config(self):
        if isinstance(self.cfg, Config):
            # filter, so only options supported by gunicorn are present
            config = {key: value for key, value in self.options.items()
                      if key in self.cfg.settings and value is not None}
            for key, value in config.items():
                self.cfg.set(key.lower(), value)
        else:
            print("ERROR: No Gunicorn config found")

    def load(self):
        # dynamic import of the app object from our Flask application (initialised in src/app.py)
        module = __import__(self.app_module, fromlist=['app'])
        return module.app


if __name__ == '__main__':
    options = {
        'bind': '%s:%s' % ('0.0.0.0', '8080'),
        'workers': 1,  # number_of_workers(),
        'timeout': 120,
        'loglevel': 'debug' if args.dev else 'info',
        # Enable auto-reload in development mode
        'reload': True if args.dev else False,
        'worker_exit': worker_exit
    }

    # backend.app module will be dynamically imported for each worker
    StandaloneApplication("backend.app", options).run()
