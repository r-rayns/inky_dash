from pydantic import BaseModel, Field, field_validator, AnyUrl


class ImageFeedConfiguration(BaseModel):
  polling_interval: int = Field(...,
                                description="Interval between each request to the image feed URL in seconds", ge=60,
                                le=86400)
  image_feed_url: str = Field(..., description="Image feed URL")

  @field_validator('image_feed_url')
  @classmethod
  def validate_url(cls, url):
    try:
      # Validate the URL, it will throw an error if invalid
      AnyUrl(url)
    except:
      raise ValueError(f"Invalid URL: {url}")

    return url