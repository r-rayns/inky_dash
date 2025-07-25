import json

from dependency_injector.wiring import inject, Provide

from backend.lib.logger_setup import logger
from backend.lib.place_holder_image import generate_place_holder_image
from backend.models.display_model import DisplaySettings, DisplayMode
from backend.models.slideshow_model import SlideshowConfiguration
from backend.services.display_mode_abstract import ModeAbstract
from backend.workers.slideshow_worker import SlideshowWorker


class SlideshowService(ModeAbstract):
    slideshow_configuration: SlideshowConfiguration = SlideshowConfiguration(images=[],
                                                                             change_delay=1800)
    slideshow_worker: SlideshowWorker

    @inject
    def __init__(self, slideshow_worker: SlideshowWorker = Provide["slideshow_worker"], ):
        super().__init__()
        logger.info("Created SlideshowService")
        self.slideshow_worker = slideshow_worker

        stored_slideshow_configuration = self.restore_slideshow()
        if stored_slideshow_configuration:
            self.slideshow_configuration = stored_slideshow_configuration
            logger.info("Slideshow configuration was restored from file")

        if len(self.slideshow_configuration.images) < 1:
            logger.info("Slideshow has no images...")
            self.default_to_placeholder_image()

        if self.display_settings_service.display_settings.mode == DisplayMode.SLIDESHOW:
            self.start_slideshow()

    def start_slideshow(self):
        display_settings = self.display_settings_service.display_settings
        logger.info("Attempting to start slideshow on the Inky display...")
        logger.info(
            f"Settings: {display_settings.type} ({display_settings.colour_palette}) - "
            f"delay: {self.slideshow_configuration.change_delay} seconds")
        self.slideshow_worker.start_slideshow(self.slideshow_configuration, display_settings)
        self.display_settings_service.active_worker = self.slideshow_worker

    def update_slideshow(self, configuration: SlideshowConfiguration):
        # Update the slideshow configuration attribute
        self.slideshow_configuration = configuration
        # Write the configuration to file
        logger.info("Attempting to store slideshow configuration to slideshow.json...")
        self.store_slideshow_configuration(configuration)

        if self.display_settings_service.display_settings.mode == DisplayMode.SLIDESHOW:
            self.start_slideshow()

    def on_settings_update(self, settings: DisplaySettings, display_has_changed: bool = False):
        logger.info("Settings have changed")

        if display_has_changed:
            place_holder_image = generate_place_holder_image(self.display_settings_service.display_settings)
            logger.info("Display has changed, clearing slideshow configuration")
            self.slideshow_configuration = SlideshowConfiguration(images=[place_holder_image],
                                                                  change_delay=1800)
            self.store_slideshow_configuration(self.slideshow_configuration)

        if settings.mode == DisplayMode.SLIDESHOW:
            logger.info("Slideshow mode is active, restart slideshow")
            self.start_slideshow()
        elif self.slideshow_worker.running:
            logger.info("Slideshow mode has been disabled, stop slideshow")
            self.slideshow_worker.stop()

    def store_slideshow_configuration(self, slideshow_configuration: SlideshowConfiguration):
        with open("slideshow.json", "w") as file:
            json.dump(slideshow_configuration.model_dump(), file,
                      ensure_ascii=False, indent=4)
        logger.info("Slideshow Configuration stored")

    def default_to_placeholder_image(self):
        place_holder_image = generate_place_holder_image(self.display_settings_service.display_settings)
        change_delay = self.slideshow_configuration.change_delay
        logger.info("Defaulting slideshow to placeholder image")
        self.slideshow_configuration = SlideshowConfiguration(images=[place_holder_image],
                                                              change_delay=change_delay)
        self.store_slideshow_configuration(self.slideshow_configuration)

    def restore_slideshow(self) -> SlideshowConfiguration | None:
        slideshow_configuration_json = self.read_stored_slideshow_configuration()
        if isinstance(slideshow_configuration_json, dict):
            logger.info("Existing slideshow configuration found")
            slideshow_configuration = SlideshowConfiguration(**slideshow_configuration_json)
            return slideshow_configuration

    def read_stored_slideshow_configuration(self):
        try:
            with open("slideshow.json", "r") as file:
                return json.load(file)
        except FileNotFoundError:
            logger.info("No slideshow configuration file found...")
            return False
