import os, cv2, base64, cStringIO, json
import numpy as np
from PIL import Image

from flask import current_app, request, Blueprint, render_template

kiosk = Blueprint('kiosk', __name__)

@kiosk.route('/')
def index():
    return render_template('kiosk.html')

def base64_to_np_array(data):
    """
    Takes a base64 encoded image,
    converts to a greyscale PIL image object
    then finally into a numpy array
    """
    return np.array(
        Image.open(
            cStringIO.StringIO(
                base64.b64decode(data))
            ).convert('L'),
        'uint8')

@kiosk.route('/face-detector', methods=['POST'])
def face_detector():
    _, image_data = request.form['image'].split(',')
    image = base64_to_np_array(image_data)

    cascadePath = os.path.join(
        current_app.config['CASCADES_PATH'],
        'haarcascade_frontalface_default.xml')
    faceCascade = cv2.CascadeClassifier(cascadePath)
    faces = faceCascade.detectMultiScale(image)

    if len(faces):
        return json.dumps(faces.tolist())

    return ''
