import json
from typing import cast, Callable

from backend.lib.display_utilis import detect_inky_display, InkyDisplay, resolve_display_type_from_inky_instance, \
  resolve_supported_palette_from_inky_instance
from backend.lib.logger_setup import logger
from backend.models.display_model import DisplaySettings, DisplayType, ColourPalette, BorderColour, DisplayMode, \
  DisplaySettingsUpdate
from backend.workers.display_worker_abstract import DisplayWorkerAbstract


class DisplaySettingsService:
  display_settings: DisplaySettings = DisplaySettings(type=DisplayType.PHAT_104,
                                                      colour_palette=ColourPalette.RED,
                                                      border_colour=BorderColour.WHITE)
  settings_update_callbacks: list[Callable[[DisplaySettings], None]] = []
  active_worker: DisplayWorkerAbstract | None = None

  def __init__(self):
    logger.info("Created DisplaySettingsService")
    detected_display = detect_inky_display()

    # Check for existing settings
    stored_settings = self.restore_settings()
    logger.info(f"Stored settings: {stored_settings}")
    if stored_settings:
      self.display_settings = stored_settings
      logger.info("Settings where restored from file")

    if isinstance(detected_display, InkyDisplay):
      display_type = resolve_display_type_from_inky_instance(detected_display)
      display_palette = resolve_supported_palette_from_inky_instance(detected_display)
      # Set the display settings if no stored settings exist or the stored settings do not match the detected display
      if (not stored_settings
        or stored_settings.type != display_type
        or stored_settings.colour_palette != display_palette):
        # Use the detected display to form the display settings
        logger.info(
          f"Detected display of {display_type} ({display_palette}). Updating display settings...")
        display_mode = getattr(stored_settings, 'mode', DisplayMode.SLIDESHOW)
        display_settings = DisplaySettings(type=display_type,
                                           colour_palette=display_palette,
                                           border_colour=BorderColour.WHITE,
                                           mode=display_mode)
        self.update_settings(display_settings)

    if not detected_display and not stored_settings:
      # No display was detected and no setting exist so use default settings
      logger.info("Unable to detect display, using default settings")

  def subscribe(self, callback: Callable[[DisplaySettings], None]):
    self.settings_update_callbacks.append(callback)

  def update_settings(self, settings: DisplaySettings or DisplaySettingsUpdate, emit_update: bool = True):
    # Update the display settings, merge existing settings with the updated settings
    self.display_settings = DisplaySettings(**{
      **self.display_settings.model_dump(),
      **settings.model_dump(exclude_unset=True)
    })
    # Write the settings to file
    logger.info("Attempting to store settings to file...")
    with open("settings.json", "w") as file:
      json.dump(self.display_settings.model_dump(), cast('SupportsWrite[str]', file),
                ensure_ascii=False, indent=4)
    logger.info("Settings stored")

    if emit_update:
      self.emit_settings_update(settings)

  def emit_settings_update(self, settings: DisplaySettings):
    for callback in self.settings_update_callbacks:
      callback(settings)

  def restore_settings(self) -> DisplaySettings | None:
    settings_json = DisplaySettingsService.retrieve_settings_from_file()
    if isinstance(settings_json, dict):
      logger.info(
        "Existing settings detected, attempting to restore settings...")
      settings = DisplaySettings(**settings_json)
      return settings

  @staticmethod
  def retrieve_settings_from_file():
    try:
      with open("settings.json", "r") as file:
        return json.load(file)
    except FileNotFoundError:
      logger.info("No settings found...")
      return False
