import logging
from logging.handlers import RotatingFileHandler

# setup the logger
logger = logging.getLogger('inky_dash')
logger.setLevel(logging.DEBUG)

file_handler = RotatingFileHandler('inky_dash.log', maxBytes=1024, backupCount=3)
file_handler.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# create formatter and add it to the handlers
formatter = logging.Formatter('[%(asctime)s +0000] [%(process)d] [%(name)s] [%(levelname)s] - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# add the handlers to the logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)