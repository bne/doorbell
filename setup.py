from setuptools import setup

version = '0.1'
long_description = open('README.rst').read()

setup(
    name='doorbell',
    version=version,
    long_description=long_description,
    install_requires=[
        'Flask',
        'Flask-SQLAlchemy',
        'flask-jsontools',
        'gunicorn',
        'numpy',
        'Pillow',
    ],
    entry_points="""
    [console_scripts]
    webserver=webserver.run:main
    create_db=webserver.run:create_db
    """,
)
