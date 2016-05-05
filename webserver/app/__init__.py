import os, cv2, sys

from flask import Flask
from flask import render_template

from webserver.app.views.admin import admin
from webserver.app.views.kiosk import kiosk

app = Flask(__name__)
app.config.from_object('webserver.config')

cascadePath = os.path.join(app.config['CASCADES_PATH'], 'haarcascade_frontalface_default.xml')
app.faceCascade = cv2.CascadeClassifier(cascadePath)

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(error):
    return render_template('500.html'), 500

app.register_blueprint(admin)
app.register_blueprint(kiosk)
