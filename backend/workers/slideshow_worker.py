from backend.lib.image_utilis import base64_to_pil_image
from backend.lib.logger_setup import logger
from backend.models.display_model import DisplaySettings
from backend.models.slideshow_model import SlideshowConfiguration
from backend.workers.display_worker_abstract import DisplayWorkerAbstract


class SlideshowWorker(DisplayWorkerAbstract):
  images: list[str]
  delay_seconds: int
  current_image: str
  next_image_index: int

  def __init__(self):
    super().__init__("slideshow_worker")
    logger.info("Created SlideshowWorker")
    self.images = []
    self.delay_seconds = 30
    self.next_image_index = 0

  def start_slideshow(self, slideshow_configuration: SlideshowConfiguration, display_settings: DisplaySettings):
    self.images = slideshow_configuration.images
    self.delay_seconds = slideshow_configuration.change_delay
    self.next_image_index = 0
    self.start(display_settings)

  def get_current_image_in_base64(self) -> str | None:
    return self.current_image

  def run(self):
    while not self.stop_event.is_set():
      self.current_image = self.images[self.next_image_index]
      logger.info(f"Displaying image number #{self.next_image_index}. Running is: {self.running}")
      image = base64_to_pil_image(self.current_image)
      self.display_image(self.display, image)
      # increment the image index
      self.next_image_index = (self.next_image_index + 1) % len(self.images)
      # sleep for the allotted delay until the next image is displayed
      self.stop_event.wait(self.delay_seconds)
