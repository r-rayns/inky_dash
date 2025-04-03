from dependency_injector.wiring import inject, Provide
from flask import Blueprint, jsonify, request

from backend.lib.display_utilis import construct_phat_palette, construct_impression_palette
from backend.lib.error_response import error_response
from backend.lib.image_utilis import base64_to_pil_image, dither, pil_image_to_base64
from backend.lib.logger_setup import logger
from backend.lib.validator import validate_request
from backend.models.display_model import DisplayType
from backend.models.image_dither_model import ImageDither
from backend.services.settings_service import DisplaySettingsService

utils_api = Blueprint("utils", __name__)


@utils_api.route("/utils/dither", methods=["POST"])
@validate_request(ImageDither)
@inject
def dither_image(display_settings_service: DisplaySettingsService = Provide["display_settings_service"]):
    try:
        req = request.get_json()

        # Extract the display type and its supported palette from the display settings
        display_settings = display_settings_service.display_settings
        display_type, supported_palette = (display_settings.type, display_settings.colour_palette)
        palette: list[int]

        # Construct a palette to apply in the dithering process
        if display_type == DisplayType.PHAT_104 or display_type == DisplayType.PHAT_122:
            palette = construct_phat_palette(supported_palette)
        else:
            palette = construct_impression_palette()

        base64_image = ImageDither(**req).image
        image_to_dither = base64_to_pil_image(base64_image)
        logger.info(f"image_to_dither format {image_to_dither.format}")

        # Dither the image and return it as base64
        dithered_image = dither(image_to_dither, palette)
        logger.info(f"dithered_image format {dithered_image.format}")
        dithered_image_base64 = pil_image_to_base64(dithered_image)

        return jsonify(message="Dither done", data=dict(image=dithered_image_base64)), 200
    except Exception as err:
        logger.exception(err)
        logger.error(f"Failed to dither image: {err}")
        return error_response("Error dithering the image", [str(err)])
