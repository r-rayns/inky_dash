from pydantic import BaseModel, Field, field_validator

from backend.lib.image_validation import is_valid_base64, is_valid_png, is_valid_file_size, is_valid_jpg


class SlideshowConfiguration(BaseModel):
  change_delay: int = Field(...,
                            description="Delay between each image change in seconds", ge=300, le=86400)
  images: list[str] = Field(..., description="Array of base64 strings")

  @field_validator('images')
  @classmethod
  def validate_images(cls, png_images: list[str]):
    try:
      for pngBase64 in png_images:
        is_valid_base64(pngBase64, True)
        if not is_valid_png(pngBase64) and not is_valid_jpg(pngBase64):
          raise ValueError("Image is not in PNG or JPG/JPEG format")
        is_valid_file_size(pngBase64, 1100, True)
    except (TypeError, ValueError) as e:
      raise ValueError(f"Invalid base64 string: {str(e)}")
    return png_images
