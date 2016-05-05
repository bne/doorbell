from setuptools import setup

version = '0.1'
long_description = open('README.rst').read()

setup(
    name='doorbell',
    version=version,
    long_description=long_description,
    install_requires=[
        'Flask',
        'gunicorn',
        'numpy',
    ],
    entry_points="""
    [console_scripts]
    webserver=webserver.run:main
    """,
)