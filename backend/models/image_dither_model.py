from pydantic import BaseModel, Field, field_validator

from backend.lib.image_validation import is_valid_base64, is_valid_png, is_valid_jpg, is_valid_file_size


class ImageDither(BaseModel):
  image: str = Field(..., description="base64 string")

  @field_validator('image')
  @classmethod
  def validate_image(cls, base64_image: str):
    try:
      is_valid_base64(base64_image, True)
      if not is_valid_png(base64_image) and not is_valid_jpg(base64_image):
        raise ValueError("Image is not in PNG or JPG/JPEG format")
      is_valid_file_size(base64_image, 15100, True)
    except (TypeError, ValueError) as e:
      raise ValueError(f"Invalid base64 string: {str(e)}")
    return base64_image
