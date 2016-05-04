from flask import current_app
from flask import Blueprint
from flask import render_template

admin = Blueprint('admin', __name__, url_prefix='/admin')

@admin.route('/')
def index():
    return render_template('admin/index.html')
