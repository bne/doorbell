from flask import current_app, request, Blueprint, render_template, jsonify

kiosk = Blueprint('kiosk', __name__)

@kiosk.route('/')
def index():
    return render_template('kiosk.html')

@kiosk.route('/face-detector', methods=['POST'])
def face_detector():
    _, image_data = request.form['image'].split(',')
    faces, subjects = current_app.face_recogniser.recognise(image_data)

    if len(faces):
        print subjects
        return jsonify(faces=faces.tolist(), subjects=subjects)

    return jsonify(faces=[])
