from flask import (
    current_app,
    Blueprint,
    flash,
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
    if request.method == 'POST':

        if request.form.get('start'):
            user = user_manager.get(request.form.get('user_id'))
            if not user:
                flash('Training user not found')
            else:
                user_manager.set_training_user(user['id'])
                flash('Training started for {}'.format(user['name']))

        if request.form.get('stop'):
            user = user_manager.get_training_user()
            if not user:
                flash('Training user not found')
            else:
                user_manager.cancel_training_user()
                flash('Training stopped for {}'.format(user['name']))

        return redirect(url_for('admin.train'))

    return render_template(
        'admin/train.html',
        users=user_manager.all(),
        training_user=user_manager.get_training_user())


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
