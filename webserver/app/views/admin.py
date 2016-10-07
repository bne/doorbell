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

from webserver.app.models import UserManager, MessageManager

admin = Blueprint('admin', __name__, url_prefix='/admin')
user_manager = UserManager()
message_manager = MessageManager()


@admin.route('/')
def index():
    return render_template('index.html')


@admin.route('/train', methods=['POST'])
def train():
    action = request.form.get('action')
    messages = []
    user = user_manager.get(request.form.get('user'))

    if not user:
        response = jsonify(message='User not found')
        response.status_code = 404
        return response

    training_user = user_manager.get_training_user()
    user_manager.cancel_training_user()

    if training_user:
        current_app.face_recogniser.save()
        messages.append(
            'Training stopped for {}'.format(training_user['name']))

    if action == 'start':
        user_manager.set_training_user(user['id'])
        messages.append('Training started for {}'.format(user['name']))

    return jsonify(messages=messages, action=action, user=user['id'])


@admin.route('/train/clear', methods=['POST'])
def train_clear():
    current_app.face_recogniser.clear()
    return jsonify(messages=['Training data cleared'])


@admin.route('/users', methods=['GET'])
def user_list():
    return render_template('users/list.html', users=user_manager.all())


@admin.route('/users/delete', methods=['GET', 'POST'])
def user_delete():
    user = user_manager.get(request.values.get('id'))
    if not user:
        flash('User not found')
        return redirect(url_for('admin.user_list'))

    if request.method == 'POST':
        user_manager.delete(user['id'])
        flash('Deleted {}'.format(user['name']))

        return redirect(url_for('admin.user_list'))

    return render_template('users/delete.html', user=user)


@admin.route('/users/add', methods=['GET', 'POST'])
def user_add():
    if request.method == 'POST':
        if request.form.get('name'):
            user_manager.add(name=request.form.get('name'))
            flash('Created {}'.format(request.form.get('name')))
            return redirect(url_for('admin.user_list'))
        else:
            flash('What\'s in a name!!!?!??!?')

    return render_template('users/add.html')


@admin.route('/settings', methods=['GET'])
def settings():
    return render_template('settings.html')


@admin.route('/messages/list', methods=['GET'])
def message_list():
    for m in message_manager.all():
        print m
    return render_template('messages/list.html', messages=message_manager.all())


@admin.route('/messages/add', methods=['GET', 'POST'])
def message_add():
    if request.method == 'POST':
        if request.form.get('message') and request.form.get('user_id'):
            message_manager.add(
                user_id=request.form.get('user_id'),
                message=request.form.get('message'),
                expires=request.form.get('expires'))
            flash('Message addedededed')
            return redirect(url_for('admin.message_list'))
        else:
            flash('You don\' want to talk')

    return render_template('messages/add.html', users=user_manager.all())

@admin.route('/messages/delete', methods=['GET'])
def message_delete():
    message = message_manager.get(request.values.get('id'))
    if not message:
        flash('Message not found')
    else:
        message_manager.delete(message['id'])
        flash('Deleted message')

    return redirect(url_for('admin.message_list'))


