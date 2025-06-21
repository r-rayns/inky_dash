from typing import List, Union
from pydantic import ValidationError
from pydantic_core import ErrorDetails
from backend.lib.logger_setup import logger
from flask import jsonify


def error_response(message: str, errors:  Union[Exception, ValidationError],
                   response_code=400):
    if isinstance(errors, ValidationError):
        formatted_errors = formatValidationErrors(errors.errors())
        logger.error(f"Validation Errors: {formatted_errors}")
    elif isinstance(errors, Exception):
        formatted_errors = [str(errors)]
    else:
        formatted_errors = "Unexpected error"

    return jsonify(message=message, errors=formatted_errors, data=None), response_code


def formatValidationErrors(validationErrors: List[ErrorDetails]) -> List[str]:
    formatted_errors = []
    for error in validationErrors:
        formatted_error = f"\"{error['loc'][0]}\" {error['msg']}"
        formatted_errors.append(formatted_error)
    return formatted_errors
