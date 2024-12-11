import io
import os
import signal
import threading

import requests
from PIL import Image

from backend.lib.display_utilis import InkyDisplay, detect_inky_display, resolve_display_from_settings
from backend.lib.image_utilis import crop_image_width, crop_image_height, pad_image
from backend.lib.logger_setup import logger
from backend.models.display_model import DisplaySettings
from backend.models.image_feed_model import ImageFeedConfiguration


# RR TODO think about an abstract worker class
class ImageFeedWorker:
  polling_interval: int
  image_feed_url: str or None
  running: bool
  thread: threading.Thread or None
  display: InkyDisplay or None
  stop_event: threading.Event

  def __init__(self):
    logger.info("Created ImageFeedWorker")
    self.polling_interval = 120
    self.image_feed_url = None
    self.running = False
    self.thread = None
    self.display: InkyDisplay or None = None
    self.stop_event = threading.Event()
    # ensure thread is stopped when the application exits
    signal.signal(signal.SIGTERM, self.shutdown)

  def shutdown(self, signum, frame):
    if self.running:
      logger.info("Image feed is running and application has received a signal to shut down")
      self.stop()

  def start(self, image_feed_configuration: ImageFeedConfiguration, display_settings: DisplaySettings):
    if self.running:
      logger.info("Image Feed is already running, restarting with latest settings...")
      self.stop()

    self.polling_interval = image_feed_configuration.polling_interval
    self.image_feed_url = image_feed_configuration.image_feed_url

    self.display = detect_inky_display()
    if not self.display:
      logger.info("Manual initialisation of Inky Device will be attempted")
      self.display = resolve_display_from_settings(display_settings)

    logger.info('Starting image feed...')
    self.running = True
    # reset the stop event
    self.stop_event.clear()
    # create and start the thread
    self.thread = threading.Thread(target=self.run)
    self.thread.start()

  def stop(self):
    self.stop_event.set()
    self.running = False
    logger.info("Stopping image feed worker thread...")
    if self.thread:
      self.thread.join()  # wait for thread to close
      self.thread = None

  def run(self):
    # while self.running and self.display != None:
    while not self.stop_event.is_set():
      image: Image.Image or None = None
      try:
        image_data = requests.get(self.image_feed_url).content
        image_stream = io.BytesIO(image_data)
        image = Image.open(image_stream)
      except Exception as err:
        logger.error(f"Failed to retrieve a valid image from feed: {err}")
        self.stop()

      self._display_image(self.display, image)
      # RR TODO move validation funcs to display utils so they can be used here as well as in the slideshow model?
      logger.info(f"Displaying image from feed {self.image_feed_url}")

      # Sleep for the allotted interval until retrieving the next image
      self.stop_event.wait(self.polling_interval)

  def _display_image(self, display: InkyDisplay, image: Image.Image):
    if image.width > display.resolution[0]:
      logger.info("Image is wider than display width, cropping image")
      image = crop_image_width(image, display.resolution)

    if image.height > display.resolution[1]:
      logger.info("Image is higher than display height, cropping image")
      image = crop_image_height(image, display.resolution)

    if image.width < display.resolution[0] or image.height < display.resolution[1]:
      image = pad_image(display.resolution, image)

    if os.getenv("DEV", "False").lower() == "true":
      # when in dev save the image to disk for debugging purposes
      image.save("result.png")

      display.set_image(image)

    if os.getenv("DESKTOP", "False").lower() == "true":
      logger.info("Running in a desktop environment, we won't attempt to set the display")
    else:
      display.show()
