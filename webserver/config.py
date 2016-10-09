import os, sys
import logging

logger = logging.getLogger(__name__)

DEBUG = True
DEBUG_FACE = False

DATABASE = os.path.join(sys.prefix, 'data/doorbell.db')
SQLALCHEMY_DATABASE_URI = 'sqlite:///{}'.format(DATABASE)
SQLALCHEMY_TRACK_MODIFICATIONS = False

OPEN_WEATHER_MAP_API_URL = 'http://api.openweathermap.org/data/2.5/forecast'
SECRET_KEY = 'IamS00p3rSekRETk3yyy'

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
