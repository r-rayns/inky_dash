import base64
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field, PositiveInt, field_validator


class ColourPalette(str, Enum):
    red = "red"
    yellow = "yellow"


class BorderColour(str, Enum):
    white = "white"
    black = "black"

# Subclass of the Pydantic BaseModel


class DisplaySettings(BaseModel):
    colour_palette: ColourPalette = Field(
        ..., description=f"Colour palette options: {', '.join([palette.value for palette in ColourPalette])}")
    border_colour: BorderColour = Field(
        ..., description=f"Border colour options: {', '.join([colour.value for colour in BorderColour])}")
    change_delay: int = Field(...,
                              description="Delay between each image change in seconds", ge=30, le=3600)
    images: list[str] = Field(..., description="Array of base64 strings")

    @field_validator('images')
    @classmethod
    def must_be_base64(cls, pngImages: list[str]):
        # Check if the string is a valid base64 string
        try:
            for pngBase64 in pngImages:
                base64.b64decode(pngBase64, validate=True)
                # check the base64 is a PNG by looking for the PNG header (https://stackoverflow.com/a/60188667)
                header = pngBase64[0:10]
                if header != 'iVBORw0KGg':
                    raise ValueError("Image is not in PNG format")
                print(f'base64Length {len(pngBase64)} {type(pngBase64)}')
                byte_estimate = (len(pngBase64) * (3/4)) - 2
                print(f'bytess {bytes}')
                # check image is less than 100KB + an extra 10KB allowance
                if byte_estimate > (110 * 1024):
                    raise ValueError("Image is greater than 100KB")
                # TODO check image is below 5MB
        except (TypeError, ValueError) as e:
            raise ValueError(f"Invalid base64 string: {str(e)}")
        return pngImages
