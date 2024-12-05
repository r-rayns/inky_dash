import logging
import base64
import io
import os
import threading
from PIL import Image
from backend.models.display_model import DisplaySettings, DisplayType
from inky import auto, mock, InkyPHAT, InkyPHAT_SSD1608, Inky7Colour, Inky_Impressions_7, InkyWHAT, InkyWHAT_SSD1683
from typing import Tuple, Union
import signal

logger = logging.getLogger('inky_dash')

InkyDisplay = Union[InkyPHAT, InkyPHAT_SSD1608, InkyWHAT,
Inky7Colour, InkyWHAT_SSD1683, Inky_Impressions_7,
mock.InkyMockWHAT, mock.InkyMockPHAT, mock.InkyMockImpression,
mock.InkyMockPHATSSD1608]


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
    self.display: InkyDisplay
    self.stop_event = threading.Event()
    # ensure thread is stopped when the application exits
    signal.signal(signal.SIGTERM, self.shutdown)

  def shutdown(self, signum, frame):
    logger.info("Application has received a signal to shut down")
    self._instance = None
    self.stop()

  def start(self, display_settings: DisplaySettings):
    if self.running:
      logger.info(
        "Slideshow is already running, restarting with latest settings...")
      self.stop()

    self.images = display_settings.images
    self.delay_seconds = display_settings.change_delay

    try:
      self.display = auto(ask_user=False)
    except Exception as e:
      logger.error(f"Could not auto detect Inky Device: {e}")
      logger.info(
        "Manual initialisation of Inky Device will be attempted")
      self.display = self.resolve_display_from_settings(display_settings)

    if isinstance(self.display, (InkyWHAT, InkyWHAT_SSD1683)):
      raise Exception("Inky WHAT is not a supported display type")

    logger.info('Starting slideshow...')
    self.current_image_index = 0
    self.running = True
    # reset the stop event
    self.stop_event.clear()
    # create and start the thread
    self.thread = threading.Thread(target=self.run)
    self.thread.start()

  def resolve_display_from_settings(self, display_settings: DisplaySettings) -> InkyDisplay:
    if display_settings.type == DisplayType.PHAT_104:
      return InkyPHAT(display_settings.colour_palette)
    elif display_settings.type == DisplayType.PHAT_122:
      return InkyPHAT_SSD1608(display_settings.colour_palette)
    elif display_settings.type == DisplayType.IMPRESSION_400:
      return Inky7Colour(resolution=(640, 400))
    elif display_settings.type == DisplayType.IMPRESSION_448:
      return Inky7Colour(resolution=(600, 448))
    else:
      # otherwise the only other displays we support are the 7 colour
      return Inky_Impressions_7()

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

  def _display_base64_image(self, display: InkyDisplay, base64_image: str):
    image = self._load_base64_image(base64_image)
    if image.width > display.resolution[0]:
      logger.info("Image is wider than display width, cropping image")
      image = self.crop_image_width(image, display.resolution)
    if image.height > display.resolution[1]:
      logger.info("Image is higher than display height, cropping image")
      image = self.crop_image_height(image, display.resolution)
    if image.width < display.resolution[0] or image.height < display.resolution[1]:
      image = self.pad_image(display.resolution, image)

    if os.getenv("DEV", "False").lower() == "true":
      # when in dev save the image to disk for debugging purposes
      image.save("result.png")

    display.set_image(image)

    if os.getenv("DESKTOP", "False").lower() == "true":
      logger.info(
        "Running in a desktop environment, we won't attempt to set the display")
    else:
      display.show()

  def _load_base64_image(self, base64_image) -> Image.Image:
    # convert the base64 to bytes
    byte_data = base64.b64decode(base64_image)
    # create a stream to provide a file like interface for our image
    image_stream = io.BytesIO(byte_data)
    # PIL can then open the stream as if it was an image on disk
    image = Image.open(image_stream)

    return image

  def pad_image(self, target_resolution: Tuple[int, int], image: Image.Image) -> Image.Image:
    logger.info("Image is below target resolution, padding image")
    target_width, target_height = target_resolution
    # Calculate the padding needed
    pad_left = (target_width - image.width) // 2
    pad_top = (target_height - image.height) // 2

    # Mode P for palette based images
    if image.mode == "P":
      # we must find the index of white in the palette to use as the padding colour
      white_index = self.find_white_index(image.getpalette())
      # Create a new white image with the target dimensions, use the mode of the original image
      padded_image = Image.new(
        image.mode, (target_width, target_height), white_index)
      padded_image.putpalette(image.getpalette())
    else:
      # non palette based default to RGB
      padded_image = Image.new(
        "RGB", (target_width, target_height), (255, 255, 255))

    # Paste the original image onto the new image
    padded_image.paste(image, (pad_left, pad_top))

    return padded_image

  def crop_image_width(self, image: Image.Image, target_resolution: Tuple[int, int]) -> Image.Image:
    left_crop = (image.width - target_resolution[0]) // 2
    right_crop = left_crop + target_resolution[0]
    return image.crop((left_crop, 0, right_crop, image.height))

  def crop_image_height(self, image: Image.Image, target_resolution: Tuple[int, int]) -> Image.Image:
    top_crop = (image.height - target_resolution[1]) // 2
    bottom_crop = top_crop + target_resolution[1]
    return image.crop((0, top_crop, image.width, bottom_crop))

  def find_white_index(self, palette: list[int] | None) -> int:
    if palette is None:
      return 0

    for i in range(0, len(palette), 3):
      if palette[i] == 255 and palette[i + 1] == 255 and palette[i + 2] == 255:
        return i

    return 0
