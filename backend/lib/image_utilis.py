import base64
import io
from typing import Tuple

from PIL import Image

from backend.lib.logger_setup import logger


def pad_image(target_resolution: Tuple[int, int], image: Image.Image) -> Image.Image:
  logger.info("Image is below target resolution, padding image")
  target_width, target_height = target_resolution
  # Calculate the padding needed
  pad_left = (target_width - image.width) // 2
  pad_top = (target_height - image.height) // 2

  # Mode P for palette based images
  if image.mode == "P":
    # we must find the index of white in the palette to use as the padding colour
    white_index = find_white_index(image.getpalette())
    # Create a new white image with the target dimensions, use the mode of the original image
    padded_image = Image.new(
      image.mode, (target_width, target_height), white_index)
    padded_image.putpalette(image.getpalette())
  else:
    # non palette based default to RGB
    padded_image = Image.new(
      "RGB", (target_width, target_height), (255, 255, 255))

  # Paste the original image onto the new image
  padded_image.paste(image, (pad_left, pad_top))

  return padded_image


def crop_image_width(image: Image.Image, target_resolution: Tuple[int, int]) -> Image.Image:
  left_crop = (image.width - target_resolution[0]) // 2
  right_crop = left_crop + target_resolution[0]
  return image.crop((left_crop, 0, right_crop, image.height))


def crop_image_height(image: Image.Image, target_resolution: Tuple[int, int]) -> Image.Image:
  top_crop = (image.height - target_resolution[1]) // 2
  bottom_crop = top_crop + target_resolution[1]
  return image.crop((0, top_crop, image.width, bottom_crop))


def find_white_index(palette: list[int] or None) -> int:
  if palette is None:
    return 0

  for i in range(0, len(palette), 3):
    if palette[i] == 255 and palette[i + 1] == 255 and palette[i + 2] == 255:
      return i

  return 0

def base64_to_pil_image(base64_image) -> Image.Image:
    # convert the base64 to bytes
    byte_data = base64.b64decode(base64_image)
    # create a stream to provide a file like interface for our image
    image_stream = io.BytesIO(byte_data)
    # PIL can then open the stream as if it was an image on disk
    image = Image.open(image_stream)

    return image
