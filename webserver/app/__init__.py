from flask import Flask
from flask import render_template

app = Flask(__name__)
app.config.from_object('webserver.config')

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.route('/')
def kiosk():
    return render_template('index.html')

@app.route('/admin')
def admin_index():
    return render_template('admin/index.html')
