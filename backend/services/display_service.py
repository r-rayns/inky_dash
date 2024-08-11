import json
import logging
from backend.models.display_model import DisplaySettings
from backend.workers.slideshow_worker import SlideshowWorker

logger = logging.getLogger('inky_dash')


class DisplayService():

    def __init__(self, slideshow_worker: SlideshowWorker):
        logger.info("Create DisplayService")
        self.slideshow_worker = slideshow_worker

    def set_display(self, settings: DisplaySettings, store=False):
        logger.info("Attempting to set the Inky display...")
        logger.info(f"Settings: {settings.type} ({settings.colour_palette})")
        self.slideshow_worker.start(settings)
        if store:
            self.store_settings(settings)

    def store_settings(self, settings: DisplaySettings):
        with open("store.json", "w") as file:
            json.dump(settings.model_dump(), file,
                      ensure_ascii=False, indent=4)

    def restore_settings(self):
        settings_json = self.retrieve_settings()
        if isinstance(settings_json, dict):
            logger.info(
                "Existing settings detected, attempting to restore settings...")
            settings = DisplaySettings(**settings_json)
            self.set_display(settings)

    def retrieve_settings(self):
        try:
            with open("store.json", "r") as file:
                return json.load(file)
        except FileNotFoundError:
            logger.info("No settings found...")
            return False
