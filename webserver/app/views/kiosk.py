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
    return render_template('kiosk.html', users=user_manager.all())


@kiosk.route('/face-detector', methods=['POST'])
def face_detector():
    users = [user for user in user_manager.all()]
    _, image_data = request.form['image'].split(',')
    faces, subjects = current_app.face_recogniser.recognise(image_data)

    if len(faces):
        training_user = user_manager.get_training_user()
        if training_user:
            print training_user
            print subjects

            # {'training': 1, 'id': 7, 'name': u'iona'}
            # [[2, 71.1609126984127]]

        return jsonify(
            users=users,
            faces=faces.tolist(),
            subjects=subjects)

    return jsonify(users=users)
