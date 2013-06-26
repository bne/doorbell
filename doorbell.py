import subprocess
import socket

from flask import Flask, render_template
from werkzeug.contrib.fixers import ProxyFix

import gevent
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler

from utility import *

app = Flask(__name__)
app.config.from_object('default_settings')
app.wsgi_app = ProxyFix(app.wsgi_app)
app.debug = app.config['DEBUG']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/image/stream/start')
def start_stream():
    if not process_exists('mjpg_streamer'):
        subprocess.Popen('%(path)s/mjpg_streamer -i "%(path)s/input_uvc.so -d %(video)s -y" -b -o "%(path)s/output_http.so -p %(port)s"' % {
          'path': app.config['LD_LIBRARY_PATH'],
          'video': app.config['VIDEO_PATH'],
          'port': app.config['STREAM_PORT'] },
          shell=True, stdout=subprocess.PIPE)
    return 'started'

@app.route('/image/stream/stop')
def toggle_stream():
    if process_exists('mjpg_streamer'):
        subprocess.Popen('kill -9 `pidof mjpg_streamer`',
            shell=True, stdout=subprocess.PIPE)
    return 'stopped'

def main():
    http_server = WSGIServer(('localhost', app.config['HTTP_SERVER_PORT']), app)
    http_server.serve_forever()

if __name__ == '__main__':
    main()


