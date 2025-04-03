import pytest
from pydantic import ValidationError

from display_model import DisplaySettings, ColourPalette, BorderColour, DisplayType, DisplayMode


def test_valid_display_settings():
    try:
        validated_settings = DisplaySettings(type=DisplayType.PHAT_104,
                                             colour_palette=ColourPalette.RED,
                                             border_colour=BorderColour.BLACK,
                                             mode=DisplayMode.SLIDESHOW)
        assert validated_settings.type == DisplayType.PHAT_104
        assert validated_settings.colour_palette == ColourPalette.RED
        assert validated_settings.border_colour == BorderColour.BLACK
        assert validated_settings.mode == DisplayMode.SLIDESHOW
    except ValidationError:
        pytest.fail("DisplaySettings raised a ValidationError unexpectedly!")


def test_image_feed_mode():
    try:
        validated_settings = DisplaySettings(type=DisplayType.PHAT_104,
                                             colour_palette=ColourPalette.RED,
                                             border_colour=BorderColour.BLACK,
                                             mode=DisplayMode.IMAGE_FEED)
        assert validated_settings.type == DisplayType.PHAT_104
        assert validated_settings.colour_palette == ColourPalette.RED
        assert validated_settings.border_colour == BorderColour.BLACK
        assert validated_settings.mode == DisplayMode.IMAGE_FEED
    except ValidationError:
        pytest.fail("DisplaySettings raised a ValidationError unexpectedly! When setting mode to image feed.")


def test_invalid_palette():
    with pytest.raises(ValidationError):
        DisplaySettings(type=DisplayType.PHAT_122,
                        colour_palette="blue",  # type: ignore
                        border_colour=BorderColour.BLACK,
                        mode=DisplayMode.SLIDESHOW)


def test_invalid_border():
    with pytest.raises(ValidationError):
        DisplaySettings(type=DisplayType.IMPRESSION_400,
                        colour_palette=ColourPalette.SEVEN_COLOUR,
                        border_colour="blue",  # type: ignore
                        mode=DisplayMode.SLIDESHOW)


def test_invalid_mode():
    with pytest.raises(ValidationError):
        DisplaySettings(type=DisplayType.IMPRESSION_400,
                        colour_palette=ColourPalette.SEVEN_COLOUR,
                        mode="idle",  # type: ignore
                        border_colour=BorderColour.BLACK)
