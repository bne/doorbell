from flask_jsontools import jsonapi
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

from webserver.app.models import User, Message, db

admin = Blueprint('admin', __name__, url_prefix='/admin')


@admin.route('/')
def index():
    return render_template('index.html')

@jsonapi
@admin.route('/train', methods=['POST'])
def train():
    action = request.form.get('action')
    messages = []
    user = User.query.get(request.form.get('user'))

    if not user:
        response = jsonify(message='User not found')
        response.status_code = 404
        return response

    for training_user in User.query.filter_by(training=True):
        training_user.training = False
        current_app.face_recogniser.save()
        messages.append(
            'Training stopped for {}'.format(training_user.name))

    if action == 'start':
        user.training = True
        messages.append('Training started for {}'.format(user.name))

    db.session.commit()

    return jsonify(messages=messages, action=action, user=user)

@jsonapi
@admin.route('/train/clear', methods=['POST'])
def train_clear():
    current_app.face_recogniser.clear()
    return jsonify(messages=['Training data cleared'])


@admin.route('/users', methods=['GET'])
def user_list():
    return render_template('users/list.html', users=User.query.all())


@admin.route('/users/delete', methods=['GET', 'POST'])
def user_delete():
    user = User.query.get(request.values.get('id'))
    if not user:
        flash('User not found')
        return redirect(url_for('admin.user_list'))

    if request.method == 'POST':
        db.session.delete(user)
        db.session.commit()
        flash('Deleted {}'.format(user['name']))

        return redirect(url_for('admin.user_list'))

    return render_template('users/delete.html', user=user)


@admin.route('/users/add', methods=['GET', 'POST'])
def user_add():
    if request.method == 'POST':
        if request.form.get('name'):
            db.session.add(User(name=request.form.get('name')))
            db.session.commit()
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
    return render_template('messages/list.html', messages=Message.query.all())


@admin.route('/messages/add', methods=['GET', 'POST'])
def message_add():
    if request.method == 'POST':
        if request.form.get('message') and request.form.get('user_id'):
            db.session.add(Message(
                user_id=request.form.get('user_id'),
                message=request.form.get('message'),
                expires=request.form.get('expires')))
            db.session.commit()
            flash('Message addedededed')
            return redirect(url_for('admin.message_list'))
        else:
            flash('You don\' want to talk')

    return render_template('messages/add.html', users=User.query.all())

@admin.route('/messages/delete', methods=['GET'])
def message_delete():
    message = Message.query.get(request.values.get('id'))
    if not message:
        flash('Message not found')
    else:
        db.session.delete(message)
        db.commit()
        flash('Deleted message')

    return redirect(url_for('admin.message_list'))


