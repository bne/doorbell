from flask import (
    g, current_app, Blueprint,
    render_template, flash,
    request, redirect, url_for)


admin = Blueprint('admin', __name__, url_prefix='/admin')

@admin.route('/')
def index():
    return render_template('admin/index.html')

@admin.route('/train', methods=['GET', 'POST'])
def train():
    if request.method == 'POST':

        if request.form.get('start'):
            cur = g.db.execute('select id, name from users where id = ?', [request.form.get('user_id')])
            user = next((dict(id=row[0], name=row[1]) for row in cur.fetchall()), None)
            if not user:
                flash('Training user not found')
            else:
                g.db.execute('update users set training = 0')
                g.db.execute('update users set training = 1 where id = ?', [user['id']])
                g.db.commit()
                flash('Training started for {}'.format(user['name']))

        if request.form.get('stop'):
            cur = g.db.execute('select id, name from users where training = 1')
            user = next((dict(id=row[0], name=row[1]) for row in cur.fetchall()), None)
            if not user:
                flash('Training user not found')
            else:
                g.db.execute('update users set training = 0')
                g.db.commit()
                flash('Training stopped for {}'.format(user['name']))



        return redirect(url_for('admin.train'))

    cur = g.db.execute('select id, name, training from users order by name')
    users = [dict(id=row[0], name=row[1], training=row[2]) for row in cur.fetchall()]
    training_user = next((user for user in users if user['training']), None)

    return render_template('admin/train.html', users=users, training_user=training_user)


@admin.route('/users', methods=['GET', 'POST'])
def users():
    if request.method == 'POST':
        if request.form.get('add'):
            g.db.execute('insert into users (name) values (?)', [request.form.get('name')])
            g.db.commit()

            flash('User added')
            return redirect(url_for('admin.users'))

    cur = g.db.execute('select id, name, training from users order by name')
    users = [dict(id=row[0], name=row[1], training=row[2]) for row in cur.fetchall()]

    return render_template('admin/users.html', users=users)
