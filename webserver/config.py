import os, sys
import logging

logger = logging.getLogger(__name__)

DEBUG = True
CASCADES_PATH = os.path.join(sys.prefix, 'motion/cascades')

OPEN_WEATHER_MAP_API_URL = 'http://api.openweathermap.org/data/2.5/weather'

try:
    from webserver.local_config import *
except ImportError:
    logger.warning("""
# local config required
OPEN_WEATHER_MAP_KEY = ''
OPEN_WEATHER_MAP_LOC = ''
GOOGLE_CLIENT_ID = ''
GOOGLE_CALENDAR_ID = ''
""")
