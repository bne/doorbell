from flask import (
    current_app, Blueprint,
    render_template, flash,
    request, redirect, url_for)


admin = Blueprint('admin', __name__, url_prefix='/admin')

@admin.route('/')
def index():
    return render_template('admin/index.html')

@admin.route('/train', methods=['GET', 'POST'])
def train():
    if request.method == 'POST':
        if request.form['train']:
            current_app.face_recogniser.train()

            flash('Training complete')
            return redirect(url_for('admin.train'))

    return render_template('admin/train.html')
