from flask import (
    Blueprint,
    current_app,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    url_for
)

from webserver.app.models import UserManager

admin = Blueprint('admin', __name__, url_prefix='/admin')
user_manager = UserManager()


@admin.route('/')
def index():
    return render_template('admin/index.html')


@admin.route('/train', methods=['GET', 'POST'])
def train():
    action = request.form.get('action')
    messages = []
    user = user_manager.get(request.form.get('user'))

    print action

    if not user:
        response = jsonify(message='Training user not found')
        response.status_code = 404
        return response

    training_user = user_manager.get_training_user()
    user_manager.cancel_training_user()

    if training_user:
        messages.append('Training stopped for {}'.format(training_user['name']))

    if action == 'start':
        user_manager.set_training_user(user['id'])
        messages.append('Training started for {}'.format(user['name']))

    return jsonify(messages=messages, action=action, user=user['id'])


@admin.route('/users', methods=['GET', 'POST'])
def users():
    if request.method == 'POST':
        if request.form.get('add'):
            user_manager.add(name=request.form.get('name'))
            flash('User added')

        return redirect(url_for('admin.users'))

    return render_template(
        'admin/users.html',
        users=user_manager.all())
