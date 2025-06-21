from dependency_injector.wiring import inject, Provide
from flask import Blueprint, jsonify, request

from backend.lib.container import Container
from backend.lib.display_utilis import detect_inky_display, resolve_display_type_from_inky_instance
from backend.lib.error_response import error_response
from backend.lib.logger_setup import logger
from backend.lib.validator import validate_request
from backend.models.display_model import DetectionError, DisplaySettingsUpdate
from backend.services.settings_service import DisplaySettingsService
from backend.workers.display_worker_abstract import DisplayWorkerAbstract

settings_api = Blueprint("settings", __name__)


@settings_api.route("/settings", methods=["GET"])
@inject
def get_settings(display_settings_service: DisplaySettingsService = Provide[Container.display_settings_service]):
    try:
        current_settings = display_settings_service.display_settings
        if current_settings:
            return jsonify(data=current_settings.model_dump()), 200
        else:
            return jsonify(message="No existing settings found", data=None), 200
    except Exception as err:
        logger.error(f"Failed to get existing display: {err}")
        return error_response("Error retrieving existing display", [str(err)])


@settings_api.route("/settings", methods=["PATCH"])
@validate_request(DisplaySettingsUpdate)
@inject
def apply_settings(display_settings_service: DisplaySettingsService = Provide[Container.display_settings_service]):
    try:
        req = request.get_json()
        logger.debug(f"POST /display: {req}")
        # req is a valid set of settings for setting the display
        # unpack and pass to SetDisplay constructor
        display_settings_update = DisplaySettingsUpdate(**req)
        display_settings_service.update_settings(display_settings_update)
        return jsonify(message="Display settings updated", data=dict(success=True)), 200
    except Exception as err:
        logger.exception(err)
        logger.error(f"Failed to update display: {err}")
        return error_response("Failed to update display", err)


@settings_api.route("/detect-display", methods=["GET"])
def detect_display():
    try:
        display = detect_inky_display()
        if display:
            display_type = resolve_display_type_from_inky_instance(display)
            return jsonify(data=dict(type=display_type)), 200
        elif display == DetectionError.UNSUPPORTED:
            return jsonify(message="Your display is not supported", data=dict(type=DetectionError.UNSUPPORTED)), 200
        else:
            return jsonify(message="No display detected", data=dict(type=None)), 200
    except Exception as err:
        logger.exception(err)
        logger.error(f"Failed to detect display: {err}")
        return error_response("Failed to detect a valid display", [str(err)])


@settings_api.route("/current-image", methods=["GET"])
@inject
def get_current_image(display_settings_service: DisplaySettingsService = Provide[Container.display_settings_service]):
    try:
        active_worker: DisplayWorkerAbstract = display_settings_service.active_worker
        if active_worker:
            current_image = active_worker.get_current_image_in_base64()
            return jsonify(data=dict(current_image=current_image)), 200
        else:
            return jsonify(message="Unable to get currently displayed image", data=dict(current_image=None)), 200
    except Exception as err:
        logger.exception(err)
        logger.error(f"Error attempting to get currently displayed image: {err}")
        return error_response("Error attempting to get currently displayed image", [str(err)])
