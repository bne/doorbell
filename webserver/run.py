from webserver.app import app
from webserver.app import db

def main():
    app.run()

def create_db():
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    main()
