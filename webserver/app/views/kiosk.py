from flask import (
    current_app,
    Blueprint,
    jsonify,
    render_template,
    request
)
from webserver.app.models import UserManager

kiosk = Blueprint('kiosk', __name__)
user_manager = UserManager()

@kiosk.route('/')
def index():
    return render_template('kiosk.html')

@kiosk.route('/face-detector', methods=['POST'])
def face_detector():
    training_user = user_manager.get_training_user()
    _, image_data = request.form['image'].split(',')
    faces, subjects = current_app.face_recogniser.recognise(image_data)

    if len(faces):
        return jsonify(faces=faces.tolist(), subjects=subjects, training_user=training_user)

    return jsonify(training_user=training_user)
