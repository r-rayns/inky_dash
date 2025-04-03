import base64
import io

from PIL import Image


# Check if the image string is a valid base64 string
def is_valid_base64(base64_image: str, throw_exception: bool = False) -> bool:
    is_base64 = False
    try:
        base64.b64decode(base64_image, validate=True)
        is_base64 = True
    except (TypeError, ValueError) as e:
        if throw_exception:
            raise e

    return is_base64


# Check the base64 is a PNG by looking for the PNG header (https://stackoverflow.com/a/60188667)
def is_valid_png(base64_image: str, throw_exception: bool = False) -> bool:
    is_png = False
    header = base64_image[0:10]
    if header == "iVBORw0KGg":
        is_png = True

    if not is_png and throw_exception:
        raise ValueError("Image is not in PNG format")

    return is_png


# Check the base64 is a JPG by looking for the JPG header
def is_valid_jpg(base64_image: str, throw_exception: bool = False) -> bool:
    is_jpg = False
    header = base64_image[:4]
    if header == "/9j/":
        is_jpg = True

    if not is_jpg and throw_exception:
        raise ValueError("Image is not in JPG/JPEG format")

    return is_jpg


# Check image is less than 1000KB + an extra 100KB allowance
def is_valid_file_size(base64_image: str, kb_allowance: int, throw_exception: bool = False) -> bool:
    is_within_size = False
    byte_estimate = (len(base64_image) * (3 / 4)) - 2
    if byte_estimate < (kb_allowance * 1024):
        is_within_size = True

    if not is_within_size and throw_exception:
        raise ValueError("Image is greater than 1000KB")

    return is_within_size


# Check the image is palette based
def is_palette_based_image(base64_image: str, throw_exception: bool = False) -> bool:
    is_palette_based = False
    byte_data = base64.b64decode(base64_image)
    image_stream = io.BytesIO(byte_data)
    image = Image.open(image_stream)
    if image.mode == "P":
        is_palette_based = True
    if not is_palette_based and throw_exception:
        raise ValueError("Image must be palette based")

    return is_palette_based
