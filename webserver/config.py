import os
import logging

logger = logging.getLogger(__name__)

DEBUG = True
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

OPEN_WEATHER_MAP_API_URL = 'http://api.openweathermap.org/data/2.5/weather'

try:
    from webserver.local_config import *
except ImportError:
    logger.warning("""
# local config
OPEN_WEATHER_MAP_KEY = ''
OPEN_WEATHER_MAP_LOC = ''
""")
