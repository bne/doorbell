import logging

logger = logging.getLogger(__name__)

OPEN_WEATHER_MAP_API_URL = 'http://api.openweathermap.org/data/2.5/forecast'

try:
    from local_config import *
except ImportError:
    logger.warning("""
# local config required
OPEN_WEATHER_MAP_KEY = ''
OPEN_WEATHER_MAP_LOC = ''
""")
