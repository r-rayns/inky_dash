import os
import threading
from abc import ABC, abstractmethod
from typing import Generic

import numpy
from PIL import Image

from backend.lib.display_utilis import InkyDisplay, detect_inky_display, resolve_display_from_settings
from backend.lib.image_utilis import crop_image_width, crop_image_height, pad_image
from backend.lib.logger_setup import logger
from backend.models.display_model import DisplaySettings, DetectionError


class DisplayWorkerAbstract(ABC):
  worker_name: str

  running: bool
  stop_event: threading.Event
  thread: threading.Thread | None
  display: InkyDisplay | None

  def __init__(self, worker_name: str):
    self.worker_name = worker_name
    self.running = False
    self.thread = None
    self.stop_event = threading.Event()
    self.display: InkyDisplay | DetectionError | None = None

  @abstractmethod
  def get_current_image_in_base64(self):
    pass

  @abstractmethod
  def run(self):
    pass

  def start(self, display_settings: DisplaySettings):
    if self.running:
      logger.info(f"{self.worker_name} is already running, restarting with latest settings...")
      self.stop()

    self.display = detect_inky_display()
    if not isinstance(self.display, InkyDisplay):
      logger.info("Manual initialisation of Inky Device will be attempted")
      self.display = resolve_display_from_settings(display_settings)

    logger.info(f'Starting {self.worker_name}...')
    self.running = True
    # reset the stop event
    self.stop_event.clear()
    # create and start the thread
    self.thread = threading.Thread(target=self.run)
    self.thread.start()

  def shutdown(self, signum, frame):
    if self.running:
      logger.info(f"{self.worker_name} is running and the application has received a signal to shut down")
      self.stop()

  def stop(self):
    self.stop_event.set()
    self.running = False
    logger.info(f"Stopping {self.worker_name} thread...")
    if self.thread:
      self.thread.join()  # wait for thread to close
      self.thread = None

  def display_image(self, display: InkyDisplay, image: Image.Image):

    if image.mode != "P":
      logger.info("Image is not palette based, converting to palette based")
      image = image.convert("P")

    if image.width > display.resolution[0]:
      logger.info("Image is wider than display width, cropping image")
      image = crop_image_width(image, display.resolution)

    if image.height > display.resolution[1]:
      logger.info("Image is higher than display height, cropping image")
      image = crop_image_height(image, display.resolution)

    if image.width < display.resolution[0] or image.height < display.resolution[1]:
      image = pad_image(display.resolution, image)

    if os.getenv("DEV", "False").lower() == "true":
      # When in dev save the image to disk for debugging purposes
      image.save("result.png")

    display.set_image(image)

    if os.getenv("DESKTOP", "False").lower() == "true":
      logger.info("Running in a desktop environment, we won't attempt to set the display")
    else:
      display.show()