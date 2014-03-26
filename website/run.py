#!/usr/bin/python

"""
Flask website
"""

import os, sys

from flask import Flask, render_template
from werkzeug.contrib.fixers import ProxyFix

from camera import stream as camera_stream

app = Flask(__name__)
app.config.from_envvar('DOORBELL_SETTINGS')
app.wsgi_app = ProxyFix(app.wsgi_app)
app.debug = app.config['DEBUG']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/camera/stream/start')
def start_stream():
    camera_stream.start()
    return 'started'

@app.route('/camera/stream/stop')
def stop_stream():
    camera_stream.stop()
    return 'stopped'
