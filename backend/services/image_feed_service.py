import json
from typing import cast

from dependency_injector.wiring import inject, Provide

from backend.lib.logger_setup import logger
from backend.models.display_model import DisplayMode, DisplaySettings
from backend.models.image_feed_model import ImageFeedConfiguration
from backend.services.display_mode_abstract import ModeAbstract
from backend.workers.image_feed_worker import ImageFeedWorker


class ImageFeedService(ModeAbstract):
  image_feed_configuration: ImageFeedConfiguration | None = None
  image_feed_worker: ImageFeedWorker

  @inject
  def __init__(self, image_feed_worker: ImageFeedWorker = Provide["image_feed_worker"], ):
    super().__init__()
    logger.info("Created ImageFeedService")
    self.image_feed_worker = image_feed_worker

    stored_image_feed_configuration = self.restore_image_feed()
    if stored_image_feed_configuration:
      self.image_feed_configuration = stored_image_feed_configuration
      logger.info("Image feed configuration was restored from file")

    if self.display_settings_service.display_settings.mode == DisplayMode.IMAGE_FEED:
      self.start_image_feed()

  def start_image_feed(self):
    display_settings = self.display_settings_service.display_settings
    logger.info("Attempting to start image feed on the Inky display...")
    if self.image_feed_configuration is not None:
      logger.info(
        f"Settings: {display_settings.type} ({display_settings.colour_palette}) - interval: {self.image_feed_configuration.polling_interval} seconds")
      self.image_feed_worker.start_image_feed(self.image_feed_configuration, display_settings)
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

  def on_settings_update(self, settings: DisplaySettings):
    logger.info("Settings have changed")
    if settings.mode == DisplayMode.IMAGE_FEED and self.image_feed_configuration is not None:
      logger.info("Image feed mode is active, restart image feed")
      self.start_image_feed()
    elif settings.mode == DisplayMode.IMAGE_FEED and self.image_feed_configuration is None:
      logger.info("Image feed mode is active but no configuration found")
      self.image_feed_worker.stop()
    elif self.image_feed_worker.running:
      logger.info("Image feed mode has been disabled, stop image feed")
      self.image_feed_worker.stop()

  def store_image_feed(self, image_feed_configuration: ImageFeedConfiguration):
    with open("feed.json", "w") as file:
      json.dump(image_feed_configuration.model_dump(), cast('SupportsWrite[str]', file),
                ensure_ascii=False, indent=4)
    logger.info("Configuration stored")

  def restore_image_feed(self) -> ImageFeedConfiguration | None:
    feed_configuration_json = self.read_stored_feed_configuration()
    if isinstance(feed_configuration_json, dict):
      logger.info("Existing image feed configuration found")
      feed_configuration = ImageFeedConfiguration(**feed_configuration_json)
      return feed_configuration

  def read_stored_feed_configuration(self):
    try:
      with open("feed.json", "r") as file:
        return json.load(file)
    except FileNotFoundError:
      logger.info("No image feed configuration file found...")
      return False
