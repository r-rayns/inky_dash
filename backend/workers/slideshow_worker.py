import logging
import base64
import io
import os
import threading
from PIL import Image
from backend.models.display_model import DisplaySettings
from inky import InkyPHAT
import signal

logger = logging.getLogger('inky_dash')


class SlideshowWorker:
    _instance = None  # holds the singleton instance
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        # double-checked locking just incase
        if not cls._instance:
            with cls._lock:  # acquire the lock
                if not cls._instance:  # double check no instance was created while waiting for the lock
                    # create the new instance
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        logger.info("Created SlideshowWorker")
        self.images = []
        self.delay_seconds = 30
        self.current_image_index = 0
        self.running = False
        self.thread = None
        self.display = None
        self.stop_event = threading.Event()
        # ensure thread is stopped when the application exits
        signal.signal(signal.SIGTERM, self.shutdown)

    def shutdown(self, signum, frame):
        logger.info("Application has received a signal to shut down")
        self._instance = None
        self.stop()

    def start(self, display_settings: DisplaySettings):
        self.images = display_settings.images
        self.display = InkyPHAT(display_settings.colour_palette)
        self.delay_seconds = display_settings.change_delay
        if not self.running:
            logger.info('Starting slideshow...')
            self.current_image_index = 0
            self.running = True
            # reset the stop event
            self.stop_event.clear()
            # create and start the thread
            self.thread = threading.Thread(target=self.run)
            self.thread.start()
        else:
            logger.info(
                "Slideshow is already running, restarting with latest settings...")
            self.stop()
            self.start(display_settings)

    def stop(self):
        self.stop_event.set()
        self.running = False
        logger.info("Stopping slideshow worker thread...")
        if self.thread:
            self.thread.join()  # wait for thread to close
            self.thread = None

    def run(self):
        # while self.running and self.display != None:
        while not self.stop_event.isSet():
            current_image = self.images[self.current_image_index]
            logger.info(
                f"Displaying image number #{self.current_image_index} {self.running}")
            self._display_base64_image(self.display, current_image)
            # increment the image index
            self.current_image_index = (
                self.current_image_index + 1) % len(self.images)
            # sleep for the alloted delay until the next image is displayed
            self.stop_event.wait(self.delay_seconds)
            # time.sleep(self.delay_seconds)

    def _display_base64_image(self, display, base64_image):
        image = self._load_base64_image(base64_image)
        display.set_image(image)

        if os.getenv("DESKTOP", "False").lower() == "true":
            logger.info(
                "Running in a desktop environment, we won't attempt to set the display")
        else:
            display.show()

    def _load_base64_image(self, base64_image):
        # convert the base64 to bytes
        byte_data = base64.b64decode(base64_image)
        # create a stream to provide a file like interface for our image
        image_stream = io.BytesIO(byte_data)
        # PIL can then open the stream as if it was an image on disk
        image = Image.open(image_stream)

        return image
