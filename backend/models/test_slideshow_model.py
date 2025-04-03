import base64

import pytest
from pydantic import ValidationError

from slideshow_model import SlideshowConfiguration

valid_base64_jpeg = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6AP/9k="  # noqa: E501
valid_base64_png = "iVBORw0KGgoAAAANSUhEUgAAANQAAABoAgMAAAD0uDaFAAACgnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHja7ZZJshshDIb3nCJHQBMSx6GhqcoNcvz8YLv9BleqMiyyeOA2tCwkoQ9RTueP7zN9QyOOnNQ8Si0lo2nVyg2TyM923sea81xzxUN3GV1alN798JgR+hu5j/uvDIlglNvr5U+WIXljqFwjvZKTfZDL5Z7fRRTl8szvIpL99mzxfOYcMbHntLS1aUF+yn1Tjy3uGRQPJEb2soLueAxz372iR265J9I8cs8HeqdKTJInKQ1qNOncY6eOEJVPdozMnWXLQpwrd8lCoklUlCa7VBkSwtL5FIGUr1ho+63bXaeA40HQZIIxword02Pyt/2loTn7ShGtZAI93QAzLwy0sijrG1pAQPNxjmwn+NE/NoDNi5ntNAc22PJxM3EYPc+WpA1aoGgYb5BpR8H7lCh8G4IhAYFcSIwKZWd2IuQxwKchcpakfAABmfFAlKwiBXCCl2+scdq6bHwTo4QAwqSIA02VBlaqpiWpa+AMNRNTMyvmFlatFSlarJTiZdVic3F18+Lu4dVbSGhYlPCIqNFS5SqoVauleo1aa2tw2mC5YXWLBsHBhxx62FEOP+KoR+s4Pl279dK9R6+9pcFDhg4bZfiIUUc76cRROvW0s5x+xlnPNnHUpkydNsv0GbPOdlHbVNM7Zp/J/Zoa3akBWNrMFEoPahC7P0zQuk5sMQMxVgJxXwRwoHkxy0GqvMilxSxXRlUYI0pbcAYtYiCoJ7FNutg9yX3illD3f8qN35JLC92/IJcWuhfkPnN7QW2s+72vOsy42FYZrqRmQflBqXHgk/Nvjin/4cIvQ1+Gvgz9p4Zk4rrA3770E9H3Xin5RhhBAAABg2lDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TpSItDnZQcchQnSyIijhqFYpQIdQKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxdnBSdJES/5cUWsR4cNyPd/ced+8AoVFhmtU1Dmi6baaTCTGbWxVDrxAwiAhEBGRmGXOSlILv+LpHgK93cZ7lf+7PEVHzFgMCIvEsM0ybeIN4etM2OO8TR1lJVonPicdMuiDxI9cVj984F10WeGbUzKTniaPEYrGDlQ5mJVMjniKOqZpO+ULWY5XzFmetUmOte/IXhvP6yjLXaQ4jiUUsQaKOFNRQRgU24rTqpFhI037Cxz/k+iVyKeQqg5FjAVVokF0/+B/87tYqTE54SeEE0P3iOB8jQGgXaNYd5/vYcZonQPAZuNLb/moDmPkkvd7WYkdA3zZwcd3WlD3gcgcYeDJkU3alIE2hUADez+ibckD/LdC75vXW2sfpA5ChrlI3wMEhMFqk7HWfd/d09vbvmVZ/Pyr6copB3BQrAAAACVBMVEX///8AAADGmyvVeuk+AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAHElEQVRYw+3BAQ0AAADCoPdPbQ8HFAAAAAAADwYV8AABWi4J4AAAAABJRU5ErkJggg=="  # noqa: E501


def test_valid_slideshow_settings():
    try:
        validated_slideshow = SlideshowConfiguration(images=[valid_base64_png],
                                                     change_delay=300)
        assert validated_slideshow.images == [valid_base64_png]
        assert validated_slideshow.change_delay == 300
    except ValidationError:
        pytest.fail("SlideshowConfiguration raised a ValidationError unexpectedly!")


def test_jpeg_in_slideshow():
    try:
        validated_slideshow = SlideshowConfiguration(images=[valid_base64_jpeg],
                                                     change_delay=3600)
        assert validated_slideshow.images == [valid_base64_jpeg]
        assert validated_slideshow.change_delay == 3600
    except ValidationError:
        pytest.fail("SlideshowConfiguration raised a ValidationError unexpectedly! When setting a jpeg image.")


def test_multiple_images_in_slideshow():
    try:
        validated_slideshow = SlideshowConfiguration(images=[valid_base64_png, valid_base64_png, valid_base64_jpeg],
                                                     change_delay=3600)
        assert validated_slideshow.images == [valid_base64_png, valid_base64_png, valid_base64_jpeg]
        assert validated_slideshow.change_delay == 3600
    except ValidationError:
        pytest.fail("SlideshowConfiguration raised a ValidationError unexpectedly! When setting multiple images.")


def test_change_delay_too_short():
    with pytest.raises(ValidationError):
        SlideshowConfiguration(images=[valid_base64_png],
                               change_delay=120)


def test_change_delay_too_long():
    with pytest.raises(ValidationError):
        SlideshowConfiguration(images=[valid_base64_png],
                               change_delay=86401)


def test_png_too_large():
    # png header in hexadecimal
    png_header = b"\x89PNG\r\n\x1a\n"
    # large byte array representing an image over 1000KB
    large_data = png_header + bytearray(1500 * 1024)  # 1500KB+
    # encode to base64
    large_png_base64 = base64.b64encode(large_data).decode("utf-8")
    with pytest.raises(ValidationError):
        SlideshowConfiguration(change_delay=300,
                               images=[large_png_base64])
