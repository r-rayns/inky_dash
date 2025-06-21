from typing import Union
from inky import (auto, mock, InkyPHAT, InkyPHAT_SSD1608, Inky7Colour, Inky_Impressions_7, InkyWHAT, InkyWHAT_SSD1683,
                  InkyE673, InkyEL133UF1)

from backend.lib.logger_setup import logger
from backend.models.display_model import DisplaySettings, DisplayType, ColourPalette, DetectionError

InkyDisplay = (InkyPHAT | InkyPHAT_SSD1608 | InkyWHAT |
               Inky7Colour | InkyWHAT_SSD1683 | Inky_Impressions_7 |
               mock.InkyMockWHAT | mock.InkyMockPHAT | mock.InkyMockImpression |
               mock.InkyMockPHATSSD1608 | InkyE673 | InkyEL133UF1)


def detect_inky_display() -> InkyDisplay | DetectionError | None:
    display: InkyDisplay | DetectionError | None = None
    try:
        # Try to auto-detect the Inky display first
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
    elif display_settings.type == DisplayType.IMPRESSION_480:
        return Inky_Impressions_7()
    elif display_settings.type == DisplayType.SPECTRA_480:
        return InkyE673()
    elif display_settings.type == DisplayType.SPECTRA_1200:
        return InkyEL133UF1()
    else:
        logger.error(f"Unsupported display type: {display_settings.type}")
        raise ValueError(f"Unsupported display type: {display_settings.type}")


def resolve_display_type_from_inky_instance(inky_instance: InkyDisplay) -> DisplayType:
    if isinstance(inky_instance, InkyPHAT) and inky_instance.resolution == (212, 104):
        return DisplayType.PHAT_104
    elif isinstance(inky_instance, InkyPHAT_SSD1608) and inky_instance.resolution == (250, 122):
        return DisplayType.PHAT_122
    elif isinstance(inky_instance, Inky7Colour) and inky_instance.resolution == (640, 400):
        return DisplayType.IMPRESSION_400
    elif isinstance(inky_instance, Inky7Colour) and inky_instance.resolution == (600, 448):
        return DisplayType.IMPRESSION_448
    elif isinstance(inky_instance, Inky_Impressions_7):
        return DisplayType.IMPRESSION_480
    elif isinstance(inky_instance, InkyE673):
        return DisplayType.SPECTRA_480
    elif isinstance(inky_instance, InkyEL133UF1):
        return DisplayType.SPECTRA_1200
    else:
        logger.error(f"Unknown Inky display instance: {inky_instance}")
        raise ValueError(f"Unknown Inky display instance: {inky_instance}")


def resolve_supported_palette_from_inky_instance(inky_instance: InkyDisplay) -> ColourPalette:
    palette: ColourPalette
    if inky_instance.colour == "red":
        palette = ColourPalette.RED
    elif inky_instance.colour == "yellow":
        palette = ColourPalette.YELLOW
    elif inky_instance.colour == "black":
        palette = ColourPalette.BLACK
    elif isinstance(inky_instance, Inky7Colour) or isinstance(inky_instance, Inky_Impressions_7):
        palette = ColourPalette.SEVEN_COLOUR
    elif isinstance(inky_instance, InkyE673) or isinstance(inky_instance, InkyEL133UF1):
        palette = ColourPalette.SPECTRA
    return palette


def construct_palette_from_display_type(display_type: DisplayType,
                                        palette_source: Union[ColourPalette, InkyDisplay]) -> list[int]:
    # Resolve the palette type, which is needed to determine the palette for Inky pHAT
    palette_type: ColourPalette
    if isinstance(palette_source, ColourPalette):
        palette_type = palette_source
    elif isinstance(palette_source, InkyDisplay):
        palette_type = resolve_supported_palette_from_inky_instance(palette_source)

    # Construct a palette
    if display_type == DisplayType.PHAT_104 or display_type == DisplayType.PHAT_122:
        palette = construct_phat_palette(palette_type)
    elif display_type in (DisplayType.IMPRESSION_400, DisplayType.IMPRESSION_448, DisplayType.IMPRESSION_480):
        palette = construct_impression_palette()
    else:
        palette = construct_spectra_palette()

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


# Constructs a six colour palette for the Inky Impression Spectra displays by blending a saturated
# and desaturated palette.
# This function is borrows logic from the "palette_blend" function in the Inky Library
def construct_spectra_palette(saturation=0.5) -> list[int]:
    saturated_palette = [
        [0, 0, 0],
        [161, 164, 165],
        [208, 190, 71],
        [156, 72, 75],
        [61, 59, 94],
        [58, 91, 70],
        [255, 255, 255]]

    desaturated_palette = [
        [0, 0, 0],
        [255, 255, 255],
        [255, 255, 0],
        [255, 0, 0],
        [0, 0, 255],
        [0, 255, 0],
        [255, 255, 255]]

    saturation = float(saturation)
    palette = []
    for i in range(6):
        r_saturated, g_saturated, b_saturated = [colour * saturation for colour in saturated_palette[i]]
        r_desaturated, g_desaturated, b_desaturated = [colour * (1.0 - saturation) for colour in desaturated_palette[i]]
        palette += [int(r_saturated + r_desaturated),
                    int(g_saturated + g_desaturated),
                    int(b_saturated + b_desaturated)]

    return palette
