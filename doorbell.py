import subprocess
import json, time, math

from flask import Flask, render_template
from werkzeug.contrib.fixers import ProxyFix 

import gevent
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler

try:
    import RPi.GPIO as GPIO
except ImportError:
    GPIO = False
    pass

from utility import *

app = Flask(__name__)
app.config.from_object('default_settings')
app.config.from_object('local_settings')
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
    
class WebSocketApp(object):
    """Stream sine values"""
    def __call__(self, environ, start_response):
        ws = environ['wsgi.websocket']
        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(7, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.setup(22, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        
        while True:
            message = None
            
            if GPIO:
                if not GPIO.input(22):
                    message = 'reed switch'
                    
                if not GPIO.input(7):
                    message = 'doorbell'
                    
            if message:
                ws.send(message)
                
            gevent.sleep(0.1)
 
def main():    
    http_server = WSGIServer(('0.0.0.0', app.config['HTTP_SERVER_PORT']), app)

    ws_server = WSGIServer(('0.0.0.0', app.config['WS_SERVER_PORT']), 
        WebSocketApp(),
        handler_class=WebSocketHandler
    )

    gevent.joinall([
        gevent.spawn(http_server.serve_forever),
        gevent.spawn(ws_server.serve_forever)
    ])    
        
if __name__ == '__main__':
    main()
    
    
