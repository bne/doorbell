import logging
import subprocess
import multiprocessing
from flask import Flask, request, render_template
from werkzeug.contrib.fixers import ProxyFix 
from utility import *

app = Flask(__name__)
app.config.from_object('default_settings')
app.config.from_object('local_settings')

app.wsgi_app = ProxyFix(app.wsgi_app)

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
      
def init_socket_listener(self):
    import socket_listener
    socket_listener.SocketServer()

multiprocessing.Process(target=init_socket_listener, args=('1',)).start()    
        
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    
    
