from enum import Enum

from pydantic import BaseModel, Field


class DetectionError:
    UNSUPPORTED = "unsupported"


class DisplayType(str, Enum):
    PHAT_104 = "phat104"
    PHAT_122 = "phat122"
    # 4"
    IMPRESSION_400 = "impression400"
    # 5.7"
    IMPRESSION_448 = "impression448"
    # 7.3"
    IMPRESSION_480 = "impression480"
    # 7.3" 2025 ed.
    SPECTRA_480 = "spectra480"
    # 13.3"
    SPECTRA_1200 = "spectra1200"


class ColourPalette(str, Enum):
    RED = "red"
    YELLOW = "yellow"
    BLACK = "black"
    SEVEN_COLOUR = "7Colour"
    SPECTRA = "spectra"


class BorderColour(str, Enum):
    WHITE = "white"
    BLACK = "black"


class DisplayMode(str, Enum):
    SLIDESHOW = "slideshow"
    IMAGE_FEED = "image_feed"


class DisplaySettings(BaseModel):
    type: DisplayType = Field(
        ..., description=f"Display type options: {', '.join([display for display in DisplayType])}")
    colour_palette: ColourPalette = Field(
        ..., description=f"Colour palette options: {', '.join([palette for palette in ColourPalette])}")
    border_colour: BorderColour = Field(
        ..., description=f"Border colour options: {', '.join([colour for colour in BorderColour])}")
    mode: DisplayMode = Field(
        DisplayMode.SLIDESHOW, description=f"Display mode options: {', '.join([mode for mode in DisplayMode])}")


class DisplaySettingsUpdate(BaseModel):
    type: DisplayType = Field(
        None, description=f"Display type options: {', '.join([display for display in DisplayType])}")
    colour_palette: ColourPalette | None = Field(
        None, description=f"Colour palette options: {', '.join([palette for palette in ColourPalette])}")
    border_colour: BorderColour = Field(
        None, description=f"Border colour options: {', '.join([colour for colour in BorderColour])}")
    mode: DisplayMode = Field(None, description=f"Display mode options: {', '.join([mode for mode in DisplayMode])}")
