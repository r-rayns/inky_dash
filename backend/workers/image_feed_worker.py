import io

import requests
from PIL import Image

from backend.lib.image_utilis import pil_image_to_base64
from backend.lib.logger_setup import logger
from backend.models.display_model import DisplaySettings
from backend.models.image_feed_model import ImageFeedConfiguration
from backend.workers.display_worker_abstract import DisplayWorkerAbstract


class ImageFeedWorker(DisplayWorkerAbstract):
  polling_interval: int
  image_feed_url: str | None
  current_image: Image.Image | None

  def __init__(self):
    super().__init__("image_feed_worker")
    logger.info("Created ImageFeedWorker")
    self.polling_interval = 120
    self.image_feed_url = None
    self.current_image = None

  def start_image_feed(self, image_feed_configuration: ImageFeedConfiguration, display_settings: DisplaySettings):
    self.polling_interval = image_feed_configuration.polling_interval
    self.image_feed_url = image_feed_configuration.image_feed_url

    self.start(display_settings)

  def get_current_image_in_base64(self) -> str | None:
    if isinstance(self.current_image, Image.Image):
      return pil_image_to_base64(self.current_image)

  def run(self):
    while not self.stop_event.is_set():
      image: Image.Image | None = None
      try:
        image_data = requests.get(self.image_feed_url).content
        image_stream = io.BytesIO(image_data)
        image = Image.open(image_stream)
        self.current_image = image
        self.display_image(self.display, image)
        logger.info(f"Displaying image from feed {self.image_feed_url}")
        # Sleep for the allotted interval until retrieving the next image
        self.stop_event.wait(self.polling_interval)
      except Exception as err:
        logger.error(f"Failed to retrieve a valid image from feed: {err}")
        logger.info("Waiting before attempting to retrieve again...")
        self.stop_event.wait(self.polling_interval)

