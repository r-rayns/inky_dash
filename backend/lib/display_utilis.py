from inky import auto, mock, InkyPHAT, InkyPHAT_SSD1608, Inky7Colour, Inky_Impressions_7, InkyWHAT, InkyWHAT_SSD1683

from backend.lib.logger_setup import logger
from backend.models.display_model import DisplaySettings, DisplayType, ColourPalette, DetectionError

InkyDisplay = (InkyPHAT | InkyPHAT_SSD1608 | InkyWHAT |
               Inky7Colour | InkyWHAT_SSD1683 | Inky_Impressions_7 |
               mock.InkyMockWHAT | mock.InkyMockPHAT | mock.InkyMockImpression |
               mock.InkyMockPHATSSD1608)


def detect_inky_display() -> InkyDisplay | DetectionError | None:
  display: InkyDisplay | DetectionError | None = None
  try:
    display: InkyDisplay = auto(ask_user=False)
  except Exception as e:
    logger.error(f"Could not auto detect Inky Device: {e}")

  if isinstance(display, (InkyWHAT, InkyWHAT_SSD1683)):
    logger.error("Inky WHAT is not a supported display type")
    # Set to false for unsupported display
    display = DetectionError.UNSUPPORTED

  return display


def resolve_display_from_settings(display_settings: DisplaySettings) -> InkyDisplay:
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


def resolve_display_type_from_inky_instance(inky_instance: InkyDisplay) -> DisplayType:
  if isinstance(inky_instance, InkyPHAT) and inky_instance.resolution == (212, 104):
    return DisplayType.PHAT_104
  elif isinstance(inky_instance, InkyPHAT_SSD1608) and inky_instance.resolution == (250, 122):
    return DisplayType.PHAT_122
  elif isinstance(inky_instance, Inky7Colour) and inky_instance.resolution == (640, 400):
    return DisplayType.IMPRESSION_400
  elif isinstance(inky_instance, Inky7Colour) and inky_instance.resolution == (600, 448):
    return DisplayType.IMPRESSION_448
  else:
    return DisplayType.IMPRESSION_480


def resolve_colour_palette_from_inky_instance(inky_instance: InkyDisplay) -> ColourPalette:
  palette: ColourPalette
  if inky_instance.colour == "red":
    palette = ColourPalette.RED
  elif inky_instance.colour == "yellow":
    palette = ColourPalette.YELLOW
  elif inky_instance.colour == "black":
    palette = ColourPalette.BLACK
  else:
    palette = ColourPalette.SEVEN_COLOUR
  return palette
