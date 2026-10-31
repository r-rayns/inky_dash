import logging
import os
from colorama import Fore, Style


def setup_inky_logger():
    # Setup the logger
    logger = logging.getLogger("inky_dash")
    logger.setLevel(logging.DEBUG)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    if os.getenv("DEV", "False").lower() == "true":
        console_handler.setLevel(logging.DEBUG)

    # Create formatters and add it to the handlers
    log_format = "[%(asctime)s +0000] [%(process)d] %(filename)s %(levelname)s - %(message)s"

    # Create formatter with color support for console output
    console_formatter = ColourFormatter(log_format)
    console_handler.setFormatter(console_formatter)

    # Add the handler to the logger
    logger.addHandler(console_handler)

    gunicorn_logger = logging.getLogger('gunicorn')
    gunicorn_logger.handlers.clear()
    gunicorn_logger.addHandler(console_handler)

    # Flask's request logs are picked up by Gunicorn's error logger
    gunicorn_error_logger = logging.getLogger('gunicorn.error')
    gunicorn_error_logger.handlers.clear()
    gunicorn_error_logger.addHandler(console_handler)


logger = logging.getLogger("inky_dash")


class ColourFormatter(logging.Formatter):
    FILENAME_COLOURS = {
        "app.py": Fore.GREEN,
        "slideshow_service.py": Fore.CYAN,
        "slideshow_worker.py": Fore.CYAN + Style.BRIGHT,
        "settings_service.py": Fore.YELLOW,
        "image_feed_service.py": Fore.MAGENTA,
        "image_feed_worker.py": Fore.MAGENTA + Style.BRIGHT,
        "display_worker_abstract.py": Fore.BLUE,
    }
    LEVEL_COLORS = {
        "DEBUG": Fore.BLUE,
        "INFO": Fore.WHITE,
        "WARNING": Fore.YELLOW,
        "ERROR": Fore.RED,
        "CRITICAL": Fore.RED + Style.BRIGHT,
    }

    def format(self, record):
        filename = record.filename
        filename_colour = self.FILENAME_COLOURS.get(filename, Fore.WHITE)
        record.filename = f"{filename_colour}{filename}{Style.RESET_ALL}"

        levelname = record.levelname
        level_colour = self.LEVEL_COLORS.get(levelname, Fore.WHITE)
        record.levelname = f"{level_colour}[{levelname}]{Style.RESET_ALL}"

        return super().format(record)
