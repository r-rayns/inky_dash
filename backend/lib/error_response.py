from typing import List
from flask import jsonify


def error_response(message: str, errors: List[str], response_code=400):
    return jsonify(message=message, errors=errors), response_code
