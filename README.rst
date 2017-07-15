doorbell
========

Install
-------

system
::
    sudo apt-get install virtualenv sqlite3 python-opencv python-dev libjpeg-dev

pip
::
    virtualenv -p python2.7 .
    bin/pip install -r requirements.txt

symlink Open CV because it doesn't play nicely with pip
::
    ln -s /usr/lib/python2.7/dist-packages/cv.py lib/python2.7/site-packages/cv.py
    ln -s /usr/lib/python2.7/dist-packages/cv2.so lib/python2.7/site-packages/cv2.so


webserver
---------

setup db
::
    bin/create_db

run
::
    bin/webserver

- http://weathericons.io
- http://openweathermap.org
