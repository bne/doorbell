from flask_jsontools import jsonapi
from flask import (
    current_app,
    Blueprint,
    jsonify,
    render_template,
    request
)
from webserver.app.models import User

kiosk = Blueprint('kiosk', __name__)


@kiosk.route('/')
def index():
    return render_template('kiosk.html')

@jsonapi
@kiosk.route('/face-detector', methods=['POST'])
def face_detector():
    users = User.query.all()
    training_user = [user for user in users if user.training]
    _, image_data = request.form['image'].split(',')

    if len(training_user):
        faces, subjects = current_app.face_recogniser.recognise(
            image_data, train_as=training_user[0].id)
    else:
        faces, subjects = current_app.face_recogniser.recognise(image_data)

    if len(faces):
        recognised_users = [subject[0] for subject in subjects]

        return jsonify(
            users=[user for user in users if user.id in recognised_users],
            faces=faces.tolist(),
            subjects=subjects)

    return jsonify(users=users)
