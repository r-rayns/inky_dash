from dependency_injector.wiring import inject, Provide
from flask import Blueprint, jsonify, request

from backend.lib.container import Container
from backend.lib.error_response import error_response
from backend.lib.logger_setup import logger
from backend.lib.validator import validate_request
from backend.models.slideshow_model import SlideshowConfiguration
from backend.services.slideshow_service import SlideshowService

slideshow_api = Blueprint("slideshow", __name__)


@slideshow_api.route("/slideshow", methods=["GET"])
@inject
def get_slideshow(slideshow_service: SlideshowService = Provide[Container.slideshow_service]):
    try:
        current_slideshow_configuration = slideshow_service.slideshow_configuration
        if current_slideshow_configuration:
            return jsonify(data=current_slideshow_configuration.model_dump()), 200
        else:
            return jsonify(message="No existing slideshow configuration found", data=None), 200
    except Exception as err:
        logger.exception(err)
        logger.error(f"Failed to get existing slideshow configuration: {err}")
        return error_response("Error retrieving existing slideshow configuration", [str(err)])


@slideshow_api.route("/slideshow", methods=["POST"])
@validate_request(SlideshowConfiguration)
@inject
def set_slideshow(slideshow_service: SlideshowService = Provide[Container.slideshow_service]):
    try:
        req = request.get_json()
        logger.debug(f"POST /slideshow: {req}")
        # req is a valid slideshow configuration
        slideshow_configuration = SlideshowConfiguration(**req)
        slideshow_service.update_slideshow(slideshow_configuration)
        return jsonify(message="Slideshow should now be updating", data=dict(success=True)), 200
    except Exception as err:
        logger.exception(err)
        logger.error(f"Failed to update slideshow: {err}")
        return error_response("Failed to update slideshow", [str(err)])
