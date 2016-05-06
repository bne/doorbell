from flask import (
    current_app, Blueprint,
    render_template, flash,
    request, redirect, url_for)


admin = Blueprint('admin', __name__, url_prefix='/admin')

@admin.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if request.form['train']:
            current_app.face_recogniser.train()

            flash('Training complete')
            return redirect(url_for('admin.index'))

    return render_template('admin/index.html')
