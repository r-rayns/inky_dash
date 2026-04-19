import json
import os
import threading
from typing import Callable

from backend.lib.display_utilis import (
    detect_inky_display,
    InkyDisplay,
    resolve_display_type_from_inky_instance,
    resolve_supported_palette_from_inky_instance,
)
from backend.lib.logger_setup import logger
from backend.models.display_model import (
    DisplaySettings,
    DisplayType,
    ColourPalette,
    BorderColour,
    DisplayMode,
    DisplaySettingsUpdate,
)
from backend.workers.display_worker_abstract import DisplayWorkerAbstract


class DisplaySettingsService:
    _display_settings: DisplaySettings
    settings_update_callbacks: list[Callable[[DisplaySettings, bool], None]]
    _active_worker: DisplayWorkerAbstract | None
    _lock: threading.RLock

    def __init__(self):
        self._display_settings = DisplaySettings(
            type=DisplayType.PHAT_104,
            colour_palette=ColourPalette.RED,
            border_colour=BorderColour.WHITE,
            mode=DisplayMode.SLIDESHOW,
        )
        self.settings_update_callbacks = []
        self._active_worker = None
        self._lock = threading.RLock()
        logger.info("Created DisplaySettingsService")
        detected_display = detect_inky_display()

        # Check for existing settings
        stored_settings = self.restore_settings()
        logger.info(f"Stored settings: {stored_settings}")
        if stored_settings:
            self._display_settings = stored_settings
            logger.info("Settings were restored from file")

        if isinstance(detected_display, InkyDisplay):
            display_type = resolve_display_type_from_inky_instance(detected_display)
            display_palette = resolve_supported_palette_from_inky_instance(detected_display)
            # Set the display settings if no stored settings exist or
            # the stored settings do not match the detected display
            if (
                not stored_settings
                or stored_settings.type != display_type
                or stored_settings.colour_palette != display_palette
            ):
                # Use the detected display to form the display settings
                logger.info(f"Detected display of {display_type} ({display_palette}). Updating display settings...")
                display_mode = getattr(stored_settings, "mode", DisplayMode.SLIDESHOW)
                display_settings = DisplaySettings(
                    type=display_type,
                    colour_palette=display_palette,
                    border_colour=BorderColour.WHITE,
                    mode=display_mode,
                )
                self.update_settings(display_settings)

        if not detected_display and not stored_settings:
            # No display was detected and no setting exist so use default settings
            logger.info("Unable to detect display, using default settings")

    @property
    def display_settings(self) -> DisplaySettings:
        with self._lock:
            return self._display_settings

    @display_settings.setter
    def display_settings(self, value: DisplaySettings) -> None:
        with self._lock:
            self._display_settings = value

    def subscribe(self, callback: Callable[[DisplaySettings, bool], None]):
        with self._lock:
            self.settings_update_callbacks.append(callback)

    def update_settings(self, settings: DisplaySettings | DisplaySettingsUpdate, emit_update: bool = True):
        display_has_changed = False

        with self._lock:
            current_display_type = self._display_settings.type

            if current_display_type != settings.type:
                logger.info(f"Display type has changed from {current_display_type} to {settings.type}.")
                display_has_changed = True

            # Update the display settings, merge existing settings with the updated settings
            self._display_settings = DisplaySettings(
                **{**self._display_settings.model_dump(), **settings.model_dump(exclude_unset=True)}
            )
            # Take snapshot for use outside lock
            updated_settings = self._display_settings
            # Write the settings to file
            logger.info("Attempting to store settings to file...")
            with open(os.path.join(os.getenv("DATA_DIR", ""), "settings.json"), "w") as file:
                json.dump(updated_settings.model_dump(), file, ensure_ascii=False, indent=4)
            logger.info("Settings stored")

        if emit_update:
            self.emit_settings_update(updated_settings, display_has_changed)

    def emit_settings_update(self, settings: DisplaySettings, display_has_changed: bool = False):
        with self._lock:
            # Snapshot callback list under lock to prevent new subscribers added mid-iteration from affecting this emit
            callbacks = list(self.settings_update_callbacks)
        for callback in callbacks:
            callback(settings, display_has_changed)

    def restore_settings(self) -> DisplaySettings | None:
        settings_json = DisplaySettingsService.retrieve_settings_from_file()
        if isinstance(settings_json, dict):
            logger.info("Existing settings detected, attempting to restore settings...")
            settings = DisplaySettings(**settings_json)
            return settings

    @property
    def active_worker(self) -> DisplayWorkerAbstract | None:
        with self._lock:
            return self._active_worker

    @active_worker.setter
    def active_worker(self, worker: DisplayWorkerAbstract) -> None:
        with self._lock:
            self._active_worker = worker

    @staticmethod
    def retrieve_settings_from_file():
        try:
            with open(os.path.join(os.getenv("DATA_DIR", ""), "settings.json"), "r") as file:
                return json.load(file)
        except FileNotFoundError:
            logger.info("No settings found...")
            return False
