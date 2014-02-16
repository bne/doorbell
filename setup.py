from setuptools import setup, find_packages
import sys, os

version = '0.0.0'
long_description = open('README.md').read()

setup(
    name='pimped-doorbell',
    version=version,
    description='Pimped doorbell',
    long_description=long_description,
    keywords='pimped, doorbell',
    author='Ben Miller',
    author_email='ben@hyl.co.uk',
    url='https://twitter.com/pimpydoorbell',
    license='MIT',
    include_package_data=True,
    zip_safe=False,
    install_requires=[
      'Flask',
      'gevent-websocket',
      'gunicorn',
      'RPi.GPIO',
      'python-daemon',
    ]
)
