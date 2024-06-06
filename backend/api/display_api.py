import logging
from flask import Blueprint, jsonify, request
from backend.lib.container import Container
from backend.lib.error_response import error_response
from backend.lib.validator import validate_request
from backend.models.display_model import DisplaySettings
from backend.services.display_service import DisplayService
from dependency_injector.wiring import inject, Provide

logger = logging.getLogger('inky_dash')

display_api = Blueprint('display', __name__)


@display_api.route('/display', methods=['GET'])
@inject
def get_display(display_service: DisplayService = Provide[Container.display_service]):
    try:
        current_settings = display_service.retrieve_settings()
        if current_settings:
            return current_settings, 200
        else:
            return jsonify(message='No existing settings found'), 200
    except Exception as err:
        logger.error(f'Failed to get existing display: {err}')
        return error_response('Error retrieving existing display', [str(err)])


@display_api.route('/display', methods=['POST'])
@validate_request(DisplaySettings)
@inject
def set_display(display_service: DisplayService = Provide[Container.display_service]):
    try:
        req = request.get_json()
        logger.debug(f'POST /display: {req}')
        # req is a valid set of settings for setting the display
        # unpack and pass to SetDisplay constructor
        display_settings = DisplaySettings(**req)
        display_service.set_display(display_settings, True)
        return jsonify(message='Display should now be updating'), 200
    except Exception as err:
        logger.error(f'Failed to update display: {err}')
        return error_response('Failed to update display', [str(err)])
