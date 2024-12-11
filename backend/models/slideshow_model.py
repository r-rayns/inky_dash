import base64
import io
from PIL import Image
from pydantic import BaseModel, Field, field_validator

class SlideshowConfiguration(BaseModel):
  change_delay: int = Field(...,
                            description="Delay between each image change in seconds", ge=30, le=3600)
  images: list[str] = Field(..., description="Array of base64 strings")

  @field_validator('images')
  @classmethod
  def validate_images(cls, png_images: list[str]):
    try:
      for pngBase64 in png_images:
        SlideshowConfiguration.validate_as_base64(pngBase64)
        SlideshowConfiguration.validate_as_png(pngBase64)
        SlideshowConfiguration.validate_file_size(pngBase64)
    except (TypeError, ValueError) as e:
      raise ValueError(f"Invalid base64 string: {str(e)}")
    return png_images

  # Check if the image string is a valid base64 string
  @staticmethod
  def validate_as_base64(base64_image: str) -> bool:
    try:
      base64.b64decode(base64_image, validate=True)
    except (TypeError, ValueError) as e:
      raise e
    return True

  # Check the base64 is a PNG by looking for the PNG header (https://stackoverflow.com/a/60188667)
  @staticmethod
  def validate_as_png(base64_image: str) -> bool:
    header = base64_image[0:10]
    if header != 'iVBORw0KGg':
      raise ValueError("Image is not in PNG format")
    return True

  # Check image is less than 1000KB + an extra 100KB allowance
  @staticmethod
  def validate_file_size(base64_image: str) -> bool:
    byte_estimate = (len(base64_image) * (3 / 4)) - 2
    if byte_estimate > (1100 * 1024):
      raise ValueError("Image is greater than 1000KB")
    return True

  @staticmethod
  def validate_image_mode(base64_image: str) -> bool:
    byte_data = base64.b64decode(base64_image)
    image_stream = io.BytesIO(byte_data)
    image = Image.open(image_stream)
    if image.mode != 'P':
      raise ValueError("Image must be palette based")
    return True
