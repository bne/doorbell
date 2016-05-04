import base64

from flask import request
from flask import Blueprint
from flask import render_template

kiosk = Blueprint('kiosk', __name__)

@kiosk.route('/')
def index():
    return render_template('kiosk.html')

@kiosk.route('/face-detector', methods=['POST'])
def face_detector():

    _, imgdata = request.form['image'].split(',');

    with open('face.png', 'wb') as _file:
        _file.write(base64.b64decode(imgdata))

    return 'foo'
