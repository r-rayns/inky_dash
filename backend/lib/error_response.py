
from flask import jsonify
from pydantic import ValidationError
from pydantic_core import ErrorDetails

from backend.lib.logger_setup import logger


def error_response(message: str, errors: Exception | ValidationError, response_code=400):
    if isinstance(errors, ValidationError):
        formatted_errors = formatValidationErrors(errors.errors())
        logger.error(f"Validation Errors: {formatted_errors}")
    elif isinstance(errors, Exception):
        formatted_errors = [str(errors)]
    else:
        formatted_errors = "Unexpected error"

    return jsonify(message=message, errors=formatted_errors, data=None), response_code


def formatValidationErrors(validationErrors: list[ErrorDetails]) -> list[str]:
    formatted_errors = []
    # Loop over the errors and put them into the format <field_name> <error_message>
    for error in validationErrors:
        formatted_error = f'"{error["loc"][0]}" {error["msg"]}'
        formatted_errors.append(formatted_error)
    return formatted_errors
