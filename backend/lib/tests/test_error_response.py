import pytest
from flask import Flask
from pydantic import BaseModel, ValidationError, Field

from backend.lib.error_response import error_response


class SampleModel(BaseModel):
    name: str
    age: int = Field(gt=20)


@pytest.fixture
def flask_app():
    """Create a Flask app for testing"""
    flask_app = Flask(__name__)
    return flask_app


def test_error_response_with_exception(flask_app):
    """Test that error_response correctly handles Exception objects"""
    test_exception = Exception("I raise an exception!")

    with flask_app.app_context():
        response, status_code = error_response("Exception error message", test_exception)

        assert status_code == 400
        assert response.json is not None
        assert response.json["message"] == "Exception error message"
        assert response.json["errors"] == ["I raise an exception!"]
        assert response.json["data"] is None


def test_error_response_with_value_error(flask_app):
    """Test that error_response correctly handles ValueError"""
    test_value_error = ValueError("Something went wrong")

    with flask_app.app_context():
        response, status_code = error_response("Value error message", test_value_error)

        assert status_code == 400
        assert response.json is not None
        assert response.json["message"] == "Value error message"
        assert response.json["errors"] == ["Something went wrong"]
        assert response.json["data"] is None


def test_error_response_with_custom_status(flask_app):
    """Test error_response with a runtime error and a custom status code"""
    test_exception = RuntimeError("Server error")

    with flask_app.app_context():
        response, status_code = error_response("Server issue", test_exception, response_code=500)

        assert status_code == 500
        assert response.json is not None
        assert response.json["message"] == "Server issue"
        assert response.json["errors"] == ["Server error"]


def test_error_response_with_validation_error(flask_app):
    """Test that error_response correctly handles a ValidationError"""
    try:
        SampleModel(name="Bob", age=19)
    except ValidationError as e:
        with flask_app.app_context():
            response, status_code = error_response("Validation failed", e)

            assert status_code == 400
            assert response.json is not None
            assert response.json["message"] == "Validation failed"
            assert isinstance(response.json["errors"], list)
            assert len(response.json["errors"]) > 0
            # Should contain formatted validation error
            assert '"age" Input should be greater than 20' in response.json["errors"][0]
