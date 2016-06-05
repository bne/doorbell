from flask import g

class BaseManager(object):
    def select(self, query=None, params=[], order_by=None):
        sql = 'select {} from {}'.format(', '.join(self.fields), self.table)
        if query:
            sql += ' where {}'.format(query)
        if order_by:
            sql += ' order by {}'.format(order_by)

        cur = g.db.execute(sql, params)
        return (dict(zip(self.fields, row)) for row in cur.fetchall())

    def get(self, id):
        return next(self.select('id = ?', [id]), None)

    def delete(self, id, commit=True):
        g.db.execute('delete from users where id = ?', [id])
        if commit:
            g.db.commit()


class UserManager(BaseManager):
    fields = ('id', 'name', 'training',)
    table = 'users'

    def get_training_user(self):
        return next(self.select('training = 1', []), None)

    def set_training_user(self, id, commit=True):
        self.cancel_training_user(commit=False)
        g.db.execute('update {} set training = 1 where id = ?'.format(self.table), [id])
        if commit:
            g.db.commit()

    def cancel_training_user(self, commit=True):
        g.db.execute('update users set training = 0')
        if commit:
            g.db.commit()

    def add(self, name=None, commit=True):
        g.db.execute('insert into {} (name, training) values (?, 0)'.format(self.table), [name])
        if commit:
            g.db.commit()

    def all(self):
        return self.select(order_by='name')
