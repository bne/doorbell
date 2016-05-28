import sqlite3

from flask import Flask, g, render_template

from webserver.app.views.admin import admin
from webserver.app.views.kiosk import kiosk

from face_recognition.recogniser import FaceRecogniser

app = Flask(__name__)
app.config.from_object('webserver.config')

def connect_db():
    return sqlite3.connect(app.config['DATABASE'])

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()

app.face_recogniser = FaceRecogniser()

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(error):
    return render_template('500.html'), 500

app.register_blueprint(admin)
app.register_blueprint(kiosk)
