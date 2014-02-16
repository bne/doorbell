#!/usr/bin/python

"""
Flask website
"""

import os
import re
import socket
import subprocess

from flask import Flask, render_template
from werkzeug.contrib.fixers import ProxyFix

import gevent
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler

def process_exists(proc_name):
    ps = subprocess.Popen('ps ax -o pid= -o args= ', 
        shell=True, stdout=subprocess.PIPE)
    ps_pid = ps.pid
    output = ps.stdout.read()
    ps.stdout.close()
    ps.wait()

    for line in output.split('\n'):
        res = re.findall('(\d+) (.*)', line)
        if res:
            pid = int(res[0][0])
            if proc_name in res[0][1] and pid != os.getpid() and pid != ps_pid:
                return True
    return False 

app = Flask(__name__)
app.config.from_envvar('DOORBELL_SETTINGS')
app.wsgi_app = ProxyFix(app.wsgi_app)
app.debug = app.config['DEBUG']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/camera/stream/start')
def start_stream():
    if not process_exists('mjpg_streamer'):
        subprocess.Popen('%(path)s/mjpg_streamer -i "%(path)s/input_uvc.so -d %(video)s -y" -b -o "%(path)s/output_http.so -p %(port)s"' % {
          'path': app.config['LD_LIBRARY_PATH'],
          'video': app.config['VIDEO_PATH'],
          'port': app.config['STREAM_PORT'] },
          shell=True, stdout=subprocess.PIPE)
    return 'started'

@app.route('/camera/stream/stop')
def toggle_stream():
    if process_exists('mjpg_streamer'):
        subprocess.Popen('kill -9 `pidof mjpg_streamer`',
            shell=True, stdout=subprocess.PIPE)
    return 'stopped'

def main():
    http_server = WSGIServer(('0.0.0.0', app.config['HTTP_SERVER_PORT']), app)
    http_server.serve_forever()

if __name__ == '__main__':
    main()


