import threading

from backend.lib.image_utilis import base64_to_pil_image
from backend.lib.logger_setup import logger
from backend.models.display_model import DisplaySettings, DetectionError
from backend.models.slideshow_model import SlideshowConfiguration
from backend.workers.display_worker_abstract import DisplayWorkerAbstract


class SlideshowWorker(DisplayWorkerAbstract):
    images: list[str]
    delay_seconds: int
    current_image: str
    next_image_index: int
    _slideshow_lock: threading.Lock

    def __init__(self):
        super().__init__("slideshow_worker")
        logger.info("Created SlideshowWorker")
        self.images = []
        self.delay_seconds = 30
        self.next_image_index = 0
        self._slideshow_lock = threading.Lock()

    def start_slideshow(self, slideshow_configuration: SlideshowConfiguration, display_settings: DisplaySettings):
        with self._slideshow_lock:
            self.images = slideshow_configuration.images
            self.delay_seconds = slideshow_configuration.change_delay
            self.next_image_index = 0
        self.start(display_settings)

    def get_current_image_in_base64(self) -> str | None:
        with self._slideshow_lock:
            return self.current_image

    def run(self):
        display = self.display
        while not self.stop_event.is_set():
            with self._slideshow_lock:
                images = self.images
                delay_seconds = self.delay_seconds
                next_image_index = self.next_image_index

            if display is None or display == DetectionError.UNSUPPORTED:
                raise ValueError(f"Display has not been setup or is unsupported: {display}")

            with self._slideshow_lock:
                current_image = images[next_image_index]
                self.current_image = current_image
                logger.info(f"Displaying image number #{next_image_index}. Running is: {self.running}")
                # increment the image index
                self.next_image_index = (next_image_index + 1) % len(images)

            image = base64_to_pil_image(current_image)
            self.display_image(display, image)
            # sleep for the allotted delay until the next image is displayed
            self.stop_event.wait(delay_seconds)
