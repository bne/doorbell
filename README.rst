doorbell
========

Install
-------

pip requirements
::
    virtualenv -p python2.7 .
    bin/pip install -r requirements.txt

symlink because Open CV doesn't play nicely with pip
::
    sudo apt-get install python-opencv
    ln -s /usr/lib/python2.7/dist-packages/cv.py lib/python2.7/site-packages/cv.py
    ln -s /usr/lib/python2.7/dist-packages/cv2.so lib/python2.7/site-packages/cv2.so


webserver
---------

run
::
    bin/webserver

- http://weathericons.io
- http://openweathermap.org
