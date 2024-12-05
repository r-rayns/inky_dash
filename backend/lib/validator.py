import logging
from typing import List, Type
from flask import jsonify, request
from pydantic import BaseModel, ValidationError
from pydantic_core import ErrorDetails
from backend.lib.error_response import error_response

logger = logging.getLogger('inky_dash')


# Type[BaseModel] annotates that argument model must be a subclass of BaseModel


def validate_request(model: Type[BaseModel]):
  def decorator(func):
    def wrapper(*args, **kwargs):
      try:
        model.model_validate(request.json)
        # if valid execute the decorated function
        return func(*args, **kwargs)
      except ValidationError as validation:
        # invalid request, format errors
        formatted_errors = formatValidationErrors(validation.errors())
        logger.error(f"Invalid request: {formatted_errors}")
        return error_response("Validation errors", formatted_errors)

    return wrapper

  return decorator


def formatValidationErrors(validationErrors: List[ErrorDetails]) -> List[str]:
  formatted_errors = []
  for error in validationErrors:
    formatted_error = f"\"{error['loc'][0]}\" {error['msg']}"
    formatted_errors.append(formatted_error)
  return formatted_errors
