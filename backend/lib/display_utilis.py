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


def resolve_supported_palette_from_inky_instance(inky_instance: InkyDisplay) -> ColourPalette:
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


# Constructs a two or three colour palette for the Inky Phat displays.
def construct_phat_palette(supported_palette: ColourPalette) -> list[int]:
  # Palette must be ordered white, black, colour
  palette = [
    255, 255, 255,
    0, 0, 0,
  ]

  if supported_palette == ColourPalette.RED:
    palette.extend([255, 0, 0])
  if supported_palette == ColourPalette.YELLOW:
    palette.extend([255, 255, 0])

  return palette


# Constructs a seven colour palette for the Inky Impression displays by blending a saturated and desaturated palette.
# This function is borrows logic from the "palette_blend" function in the Inky Library
def construct_impression_palette(saturation=0.5) -> list[int]:
  saturated_palette = [
    [57, 48, 57],
    [255, 255, 255],
    [58, 91, 70],
    [61, 59, 94],
    [156, 72, 75],
    [208, 190, 71],
    [177, 106, 73],
    [255, 255, 255]
  ]
  desaturated_palette = [
    [0, 0, 0],
    [255, 255, 255],
    [0, 255, 0],
    [0, 0, 255],
    [255, 0, 0],
    [255, 255, 0],
    [255, 140, 0],
    [255, 255, 255]
  ]

  saturation = float(saturation)
  palette = []
  for i in range(7):
    r_saturated, g_saturated, b_saturated = [colour * saturation for colour in saturated_palette[i]]
    r_desaturated, g_desaturated, b_desaturated = [colour * (1.0 - saturation) for colour in desaturated_palette[i]]
    palette += [int(r_saturated + r_desaturated),
                int(g_saturated + g_desaturated),
                int(b_saturated + b_desaturated)]

  palette += [255, 255, 255]
  return palette
