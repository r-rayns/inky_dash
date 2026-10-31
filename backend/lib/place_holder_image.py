import os
from typing import Tuple
from PIL import Image, ImageDraw, ImageFont
from backend.lib.image_utilis import pil_image_to_base64
from backend.lib.logger_setup import logger
from backend.lib.display_utilis import (
    InkyDisplay,
    is_small_display,
    construct_palette,
    resolve_display_from_settings,
)
from backend.models.display_model import DisplaySettings


place_holder_image = (
    "iVBORw0KGgoAAAANSUhEUgAAANQAAABoCAYAAACJ1t4WAAAFyklEQVR4Ae3BC5LiAHYAwSoF979yeWQH6xkWuvkIAd0v0/5gj"
    "LGJhTHGZhbGGJtZGGNsZmGMsZmFMcZmFsYYm1kYY2xmYYyxmYUxxmYW3pjKKZVTKmO8gwNvRuVvKqdUxnhHC2OMzSyMMTazMM"
    "bYzIEx3oDKLSre0YE3U3GJyhjvbOGDVIzxzg6M8SIqRxXnqFScUjmqeBcLY4zNLIwxNnNgjB2pHFV8p+KciiOVo4pXOvAglQq"
    "VVYVKxadTqVA5VbEHlXMqVCq2oHJUoVLxKipHFZ/iwJVULlE5UlmpHFV8ApVTKueo/K1iCyrXUFmpHFXcQuUclZXKUcX43oEd"
    "qKwqfiqVVcU9VPaiciuVVcWtVI4qtlZxpHJUsbeFHam8s4pXUNmLyiNUxmULO1P5yVRuobIXlfFcCy+g8kkqVhXXULmGylYqv"
    "qJyjYrvqIzzDjyo4hyVT1RxTsWqYqWyh4rvqDyi4m8VK5VLVCrGvw48ScVK5RyVik9VoXIvla9UXKviKyqXVFxSobIllaOKLa"
    "i8iwPjbhUqW6vYQ8V3KlS2UrG1iiOVVzrwZBUq4/+pXFIxoOJI5ajinS28kMp4LpVHVZyjMv51YFyksqeKvalUqFSoVKhUqFS"
    "M6xwY/1D5LVRWKiuVlcpKZaXyShVHKkcV72Zh/IfKGI84sIMKlXemMp6j4kjlqGILKkcVr7SwA5V3pvKdilVFxapi7KuiouId"
    "HRhfqjiqOKrYmkrFXirenUrFpzgwLqoY26o4UjmquIXKUcW7WHihivFcFWM/B55MZfyrQuUclYo9qFS8A5VLVD7Fwg+h8lOo7"
    "EXlVSoqKm5VUVHxThYepKJySkVlTyqnVFRUbqWi8gwVX1FRUblEZaWicknFV1RUViqnVFYqKirjPPuDK6hsqeJeKveoOEdlax"
    "XfUdlSxSUqW6oY/21hUPEKFXupGM+38AIVj6i4h8olFa9QsZeK8VwLO6vYQsXWKl6houJRKt+pqBjPYX9wBZVzKlS+U/EMKte"
    "ouIXKPSpUKu6lcquKe6jcomJcZn9wBZVzKs5RqdibSsUzqFS8ikrFHlQqxm3sD66gck7FGOP/LIwxNrPwgVR+EpVTKqdU3onK"
    "+NeBN6fyE6n8TeWUyrtQGd9bGOMbKuM6C2OMzSyMMTazMMbYzIErVYztVFyiMj7Twng7FeMzLYwxNrMwxtjMwhhjMwtjjM0sf"
    "DiVlcpK5VlUVioqKj+FykplpbIHFRWVlcoeVFYqK5Ut2B+8MZVHVDxK5VoVW1A5p2IrKo+quJXKtSoepfKIimsd+OFUKu6hci"
    "uVinensjeVW6msKm6h8goLv4DKrVTupfLOVPam8giVa6m8ysIvoXItlUepvCOVvan8FgvjHypbUfntVK5R8R2Vd3fgg1WcUrl"
    "EpeJeFeeoXKJS8Q5UvlJxSuVZKv5WsVK5RKViKxUqFSqnKm5x4ENVnFOhcg+VSyouqVD5ZBXnVKjcQ+WSiksqVJ6h4lTFquJR"
    "C2MTFe9M5ZKKPVV8p+ITLfxAFbdSuaTiESrjd1gY4wlUHlVxjsq7Whibqfg0Fa+gslJZqaxUViqfaGF8qWJsS2WlslJZqaxUV"
    "iqfZmGMsZmFMcZmFsYYmzkwvqRScQ2VT6NSsaeKn2phjLGZhTGeoOI3Whj/q+ISle+oXFLxahWXqOxJ5adaGB9F5SdQ+YkWxn"
    "9UXKKickpF5ZKKramcUlFRuYeKypYqvqKislI5pbJSUVF5dwfGTVT2UKFyicqtKlS+orI3lZXKKZVPsjD+UbGVindTsaeK32R"
    "h/JeKR1U8quIeKl+p2FPFb7Ewzqq4V8VWKp6hYk8VFT/dgXFRxUrlGhXPUKFyjYprVaxUblVxj4qVyi0qPoH9wbiaSoVKxauo"
    "VDyLSsXeVCo+lf3BGGMTC2OMzSyMMTazMMbYzMIYYzMLY4zNLIwxNrMwxtjMwhhjMwtjjM0sjDE2szDG2Mz/AMxevsRxwVPWA"
    "AAAAElFTkSuQmCC"
)

silkscreen_pixel = os.path.abspath(os.path.join(os.path.dirname(__file__), "../assets/Silkscreen-Bold.ttf"))
noto_emoji = os.path.abspath(os.path.join(os.path.dirname(__file__), "../assets/NotoEmoji-Regular.ttf"))

"""
# Returns a base64 encoded placeholder image.
# This image is used when no other image is available.
"""


PLACEHOLDER_TEXT = "Inky Dash"
PLACEHOLDER_EMOJI = "🐙"


def generate_place_holder_image(display_settings: DisplaySettings) -> str:
    logger.info("Generating a placeholder image")
    display = resolve_display_from_settings(display_settings)

    logger.info(f"width: {display.width} height: {display.height}")
    placeholder_image = Image.new("P", (display.width, display.height), display.WHITE)
    palette = construct_palette(display)
    logger.info(f"palette {palette}")
    placeholder_image.putpalette(palette)

    draw = ImageDraw.Draw(placeholder_image)
    draw_placeholder_content(draw, display)

    placeholder_image.save(os.path.join(os.getenv("DATA_DIR", ""), "placeholder_image.png"), "PNG")

    return pil_image_to_base64(placeholder_image)


def draw_placeholder_content(draw: ImageDraw.ImageDraw, display: InkyDisplay):
    small = is_small_display(display)

    text_font_size = 24 if small else 64
    text_font = ImageFont.truetype(silkscreen_pixel, text_font_size)

    emoji_font_size = 48 if small else 120
    emoji_font = ImageFont.truetype(noto_emoji, emoji_font_size)

    gap = 15 if small else 30

    text_width, text_height = text_dimensions(PLACEHOLDER_TEXT, text_font, draw)
    emoji_width, emoji_height = text_dimensions(PLACEHOLDER_EMOJI, emoji_font, draw)

    # Calculate x and y positions to center content on the display
    total_height = text_height + gap + emoji_height
    text_x = (display.width - text_width) / 2
    text_y = (display.height - total_height) / 2
    emoji_x = (display.width - emoji_width) / 2
    emoji_y = text_y + text_height + gap

    draw.text((text_x, text_y), PLACEHOLDER_TEXT, fill=display.BLACK, font=text_font)

    emoji_fill = getattr(display, "BLACK" if small else "RED", 1)
    draw.text((emoji_x, emoji_y), PLACEHOLDER_EMOJI, fill=emoji_fill, font=emoji_font)


def text_dimensions(text: str, text_font: ImageFont.FreeTypeFont, draw: ImageDraw.ImageDraw) -> Tuple[float, float]:
    text_bbox = draw.textbbox((0, 0), text, font=text_font)
    text_width = text_bbox[2] - text_bbox[0]  # right minus left
    text_height = text_bbox[3] - text_bbox[1]  # bottom minus top

    return text_width, text_height
