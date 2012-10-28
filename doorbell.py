import logging
import subprocess
import multiprocessing
from flask import Flask, request, render_template
from utility import *

LD_LIBRARY_PATH = '/home/ben/Desktop/mjpg-streamer'
VIDEO_PATH = '/dev/video0'
STREAM_PORT = '8090'

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')
    
@app.route('/image/stream/start')
def start_stream():
    if not process_exists('mjpg_streamer'):
        subprocess.Popen('%(path)s/mjpg_streamer -i "%(path)s/input_uvc.so -d %(video)s -y" -b -o "%(path)s/output_http.so -p %(port)s"' % { 
          'path': LD_LIBRARY_PATH, 'video': VIDEO_PATH, 'port': STREAM_PORT }, 
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
    app.run(debug = True)
    
    
