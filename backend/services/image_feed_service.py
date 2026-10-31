import json
import os
import threading

from dependency_injector.wiring import inject, Provide

from backend.lib.logger_setup import logger
from backend.models.display_model import DisplayMode, DisplaySettings
from backend.models.image_feed_model import ImageFeedConfiguration
from backend.services.display_mode_abstract import ModeAbstract
from backend.workers.image_feed_worker import ImageFeedWorker


class ImageFeedService(ModeAbstract):
    _image_feed_configuration: ImageFeedConfiguration | None
    image_feed_worker: ImageFeedWorker
    _lock: threading.RLock

    @inject
    def __init__(
        self,
        image_feed_worker: ImageFeedWorker = Provide["image_feed_worker"],
    ):
        super().__init__()
        logger.info("Created ImageFeedService")
        self._image_feed_configuration = None
        self.image_feed_worker = image_feed_worker
        self._lock = threading.RLock()

        stored_image_feed_configuration = self.restore_image_feed()
        if stored_image_feed_configuration:
            self._image_feed_configuration = stored_image_feed_configuration
            logger.info("Image feed configuration was restored from file")

        if self.display_settings_service.display_settings.mode == DisplayMode.IMAGE_FEED:
            self.start_image_feed()

    @property
    def image_feed_configuration(self) -> ImageFeedConfiguration | None:
        with self._lock:
            return self._image_feed_configuration

    @image_feed_configuration.setter
    def image_feed_configuration(self, value: ImageFeedConfiguration | None) -> None:
        with self._lock:
            self._image_feed_configuration = value

    def start_image_feed(self):
        display_settings = self.display_settings_service.display_settings
        logger.info("Attempting to start image feed on the Inky display...")
        image_feed_configuration = self.image_feed_configuration

        if image_feed_configuration is not None:
            logger.info(
                f"Settings: {display_settings.type} ({display_settings.colour_palette})"
                f" - interval: {image_feed_configuration.polling_interval} seconds"
            )
            self.image_feed_worker.start_image_feed(image_feed_configuration, display_settings)
            self.display_settings_service.active_worker = self.image_feed_worker
        else:
            logger.info("Image feed could not be started, no image feed configuration found")

    def update_image_feed(self, configuration: ImageFeedConfiguration):
        # Update the image feed configuration attribute
        self.image_feed_configuration = configuration
        # Write the configuration to file
        logger.info("Attempting to store image feed configuration to feed.json...")
        self.store_image_feed(configuration)

        if self.display_settings_service.display_settings.mode == DisplayMode.IMAGE_FEED:
            self.start_image_feed()

    def on_settings_update(self, settings: DisplaySettings, display_has_changed: bool = False):
        logger.info("Settings have changed")
        image_feed_configuration = self.image_feed_configuration

        if settings.mode == DisplayMode.IMAGE_FEED and image_feed_configuration is not None:
            logger.info("Image feed mode is active, restart image feed")
            self.start_image_feed()
        elif settings.mode == DisplayMode.IMAGE_FEED and image_feed_configuration is None:
            logger.info("Image feed mode is active but no configuration found")
            self.image_feed_worker.stop()
        elif self.image_feed_worker.running:
            logger.info("Image feed mode has been disabled, stop image feed")
            self.image_feed_worker.stop()

    def store_image_feed(self, image_feed_configuration: ImageFeedConfiguration):
        with self._lock:
            with open(os.path.join(os.getenv("DATA_DIR", ""), "feed.json"), "w") as file:
                json.dump(image_feed_configuration.model_dump(), file, ensure_ascii=False, indent=4)
            logger.info("Configuration stored")

    def restore_image_feed(self) -> ImageFeedConfiguration | None:
        feed_configuration_json = self.read_stored_feed_configuration()
        if isinstance(feed_configuration_json, dict):
            logger.info("Existing image feed configuration found")
            feed_configuration = ImageFeedConfiguration(**feed_configuration_json)
            return feed_configuration

    def read_stored_feed_configuration(self):
        try:
            with open(os.path.join(os.getenv("DATA_DIR", ""), "feed.json"), "r") as file:
                return json.load(file)
        except FileNotFoundError:
            logger.info("No image feed configuration file found...")
            return False
