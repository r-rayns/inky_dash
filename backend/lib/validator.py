from typing import Type
from flask import request
from pydantic import BaseModel, ValidationError
from backend.lib.error_response import error_response
from backend.lib.logger_setup import logger


# Type[BaseModel] annotates that argument model must be a subclass of BaseModel
def validate_request(model: Type[BaseModel]):
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                model.model_validate(request.json)
                # if valid execute the decorated function
                return func(*args, **kwargs)
            except ValidationError as validation:
                # invalid request
                logger.error("Invalid request")
                return error_response("Validation errors", validation)

        return wrapper

    return decorator
