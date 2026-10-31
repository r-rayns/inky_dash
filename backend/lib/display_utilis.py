from inky import (
    auto,
    InkyPHAT,
    InkyPHAT_SSD1608,
    Inky7Colour,
    Inky_Impressions_7,
    InkyWHAT,
    InkyWHAT_SSD1683,
    InkyE673,
    InkyEL133UF1,
)

from inky.inky_e640 import Inky as InkyE640
from inky.inky_jd79661 import Inky as InkyPHAT_JD79661  # red/yellow wHAT
from inky.inky_jd79668 import Inky as InkyWHAT_JD79668  # red/yellow wHAT
from backend.lib.logger_setup import logger
from backend.models.display_model import DisplaySettings, DisplayType, ColourPalette, DetectionError

InkyDisplay = (
    InkyPHAT  # Original pHAT (212 x 104)
    | InkyPHAT_SSD1608  # pHAT v2 (250 x 122)
    | InkyPHAT_JD79661  # pHAT v3 (red/yellow)
    | InkyWHAT  # Original wHAT
    | InkyWHAT_SSD1683  # wHAT v2
    | InkyWHAT_JD79668  # wHAT v3 (red/yellow)
    | Inky7Colour  # Inky Impression 4" & 5.7" v1
    | Inky_Impressions_7  # Inky Impressions 7.3" v1
    | InkyE640  # Inky Impression 4" v2 (Spectra)
    | InkyE673  # Inky Impression 7.3" v2 (Spectra)
    | InkyEL133UF1  # Inky Impression 13.3" (Spectra)
)


def detect_inky_display() -> InkyDisplay | DetectionError | None:
    display: InkyDisplay | DetectionError | None = None
    try:
        # Try to auto-detect the Inky display first
        display = auto(ask_user=False)
    except Exception as e:
        logger.error(f"Could not auto detect Inky Device: {e}")

    return display


def resolve_display_from_settings(display_settings: DisplaySettings) -> InkyDisplay:
    if display_settings.type == DisplayType.PHAT_104:
        return InkyPHAT(display_settings.colour_palette)
    elif display_settings.type == DisplayType.PHAT_122:
        return InkyPHAT_SSD1608(display_settings.colour_palette)
    elif display_settings.type == DisplayType.PHAT_RED_YELLOW_122:
        return InkyPHAT_JD79661()
    elif display_settings.type == DisplayType.WHAT_300:
        return InkyWHAT(display_settings.colour_palette)
    elif display_settings.type == DisplayType.WHAT_V2_300:
        return InkyWHAT_SSD1683(display_settings.colour_palette)
    elif display_settings.type == DisplayType.WHAT_RED_YELLOW_300:
        return InkyWHAT_JD79668()
    elif display_settings.type == DisplayType.IMPRESSION_400:
        return Inky7Colour(resolution=(640, 400))
    elif display_settings.type == DisplayType.IMPRESSION_448:
        return Inky7Colour(resolution=(600, 448))
    elif display_settings.type == DisplayType.IMPRESSION_480:
        return Inky_Impressions_7()
    elif display_settings.type == DisplayType.SPECTRA_400:
        return InkyE640()
    elif display_settings.type == DisplayType.SPECTRA_480:
        return InkyE673()
    elif display_settings.type == DisplayType.SPECTRA_1200:
        return InkyEL133UF1()
    else:
        logger.error(f"Unsupported display type: {display_settings.type}")
        raise ValueError(f"Unsupported display type: {display_settings.type}")


def resolve_display_type_from_inky_instance(inky_instance: InkyDisplay | DetectionError) -> DisplayType:
    if isinstance(inky_instance, InkyPHAT) and inky_instance.resolution == (212, 104):
        return DisplayType.PHAT_104
    elif isinstance(inky_instance, InkyPHAT_SSD1608) and inky_instance.resolution == (250, 122):
        return DisplayType.PHAT_122
    elif isinstance(inky_instance, InkyPHAT_JD79661) and inky_instance.resolution == (250, 122):
        return DisplayType.PHAT_RED_YELLOW_122
    elif isinstance(inky_instance, InkyWHAT):
        return DisplayType.WHAT_300
    elif isinstance(inky_instance, InkyWHAT_SSD1683):
        return DisplayType.WHAT_V2_300
    elif isinstance(inky_instance, InkyWHAT_JD79668):
        return DisplayType.WHAT_RED_YELLOW_300
    elif isinstance(inky_instance, Inky7Colour) and inky_instance.resolution == (640, 400):
        return DisplayType.IMPRESSION_400
    elif isinstance(inky_instance, Inky7Colour) and inky_instance.resolution == (600, 448):
        return DisplayType.IMPRESSION_448
    elif isinstance(inky_instance, Inky_Impressions_7):
        return DisplayType.IMPRESSION_480
    elif isinstance(inky_instance, InkyE640):
        return DisplayType.SPECTRA_400
    elif isinstance(inky_instance, InkyE673):
        return DisplayType.SPECTRA_480
    elif isinstance(inky_instance, InkyEL133UF1):
        return DisplayType.SPECTRA_1200
    elif inky_instance == DetectionError.UNSUPPORTED:
        logger.error("Unsupported Inky display instance")
        raise ValueError("Unsupported Inky display instance")
    else:
        logger.error(f"Unknown Inky display instance: {inky_instance}")
        raise ValueError(f"Unknown Inky display instance: {inky_instance}")


def resolve_supported_palette_from_inky_instance(inky_instance: InkyDisplay) -> ColourPalette:
    if inky_instance.colour == "red":
        palette = ColourPalette.RED
    elif inky_instance.colour == "yellow":
        palette = ColourPalette.YELLOW
    elif inky_instance.colour == "black":
        palette = ColourPalette.BLACK
    elif inky_instance.colour == "red/yellow":
        palette = ColourPalette.RED_YELLOW
    elif isinstance(inky_instance, Inky7Colour) or isinstance(inky_instance, Inky_Impressions_7):
        palette = ColourPalette.SEVEN_COLOUR
    elif isinstance(inky_instance, InkyE673 | InkyEL133UF1 | InkyE640):
        palette = ColourPalette.SPECTRA
    else:
        logger.error(f"Could not determine palette from Inky instance: {inky_instance}")
        raise ValueError(f"Could not determine palette from Inky instance: {inky_instance}")
    return palette


def is_small_display(inky_instance: InkyDisplay) -> bool:
    return isinstance(inky_instance, InkyPHAT | InkyPHAT_SSD1608 | InkyPHAT_JD79661)


def construct_palette(inky_instance: InkyDisplay) -> list[int]:
    # Construct a palette
    if isinstance(inky_instance, InkyPHAT | InkyPHAT_SSD1608 | InkyWHAT | InkyWHAT_SSD1683):
        # Resolve the palette type, which is needed to determine the palette for 3 colour Inky pHAT/wHAT (red or yellow)
        palette_type: ColourPalette = resolve_supported_palette_from_inky_instance(inky_instance)
        palette = construct_phat_palette(palette_type)
    else:
        palette = inky_instance._palette_blend(saturation=0.5)

    return palette


# Constructs a two or three colour palette for the Inky Phat displays.
def construct_phat_palette(supported_palette: ColourPalette) -> list[int]:
    # Palette must be ordered white, black, colour
    palette = [
        255,
        255,
        255,
        0,
        0,
        0,
    ]

    if supported_palette == ColourPalette.RED:
        palette.extend([255, 0, 0])
    if supported_palette == ColourPalette.YELLOW:
        palette.extend([255, 255, 0])

    return palette
