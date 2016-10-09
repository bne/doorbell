from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    training = db.Column(db.Boolean)
    messages = db.relationship('Message', backref='user')
    views = db.Column(db.Integer, default=0)

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<User {}>'.format(self.name)

    def __json__(self):
        return ['id', 'name', 'training', 'messages']


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    message = db.Column(db.Text)
    expires = db.Column(db.DateTime)

    def __init__(self, user_id, message, expires):
        self.user_id = user_id
        self.message = message
        self.expires = expires

    def __repr__(self):
        return '<Message for {}: {}>'.format(self.user.name, self.message[0, 25])

    def __json__(self):
        return ['id', 'user_id', 'message', 'expires']
