from dependency_injector.wiring import inject, Provide
from flask import Blueprint, jsonify, request

from backend.lib.container import Container
from backend.lib.error_response import error_response
from backend.lib.logger_setup import logger
from backend.lib.validator import validate_request
from backend.models.image_feed_model import ImageFeedConfiguration
from backend.services.image_feed_service import ImageFeedService

image_feed_api = Blueprint('image-feed', __name__)


@image_feed_api.route('/image-feed', methods=['GET'])
@inject
def get_image_feed(image_feed_service: ImageFeedService = Provide[Container.image_feed_service]):
  try:
    current_image_feed_configuration = image_feed_service.image_feed_configuration
    if current_image_feed_configuration:
      return jsonify(data=current_image_feed_configuration.model_dump()), 200
    else:
      return jsonify(message='No existing image feed configuration found', data=None), 200
  except Exception as err:
    logger.exception(err)
    logger.error(f'Failed to get existing image feed configuration: {err}')
    return error_response('Error retrieving existing image feed configuration', [str(err)])


@image_feed_api.route('/image-feed', methods=['POST'])
@validate_request(ImageFeedConfiguration)
@inject
def set_image_feed(image_feed_service: ImageFeedService = Provide[Container.image_feed_service]):
  try:
    req = request.get_json()
    logger.debug(f'POST /image-feed: {req}')
    # Request is a valid image feed configuration
    image_feed_configuration = ImageFeedConfiguration(**req)
    image_feed_service.update_image_feed(image_feed_configuration)
    return jsonify(message='Image feed should now be updating', data=dict(success=True)), 200
  except Exception as err:
    logger.exception(err)
    logger.error(f'Failed to update image feed: {err}')
    return error_response('Failed to update image feed', [str(err)])
