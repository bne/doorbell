
from flask import Flask
from flask import render_template

from webserver.app.views.admin import admin
from webserver.app.views.kiosk import kiosk

from face_recognition.recogniser import FaceRecogniser

app = Flask(__name__)
app.config.from_object('webserver.config')

app.face_recogniser = FaceRecogniser()

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(error):
    return render_template('500.html'), 500

app.register_blueprint(admin)
app.register_blueprint(kiosk)
