doorbell
========

daemon
------
    sudo pip install python-daemon RPi.GPIO

    sudo ./ddoorbell start
    sudo ./ddoorbell stop

site
----

    sudo apt-get install python-pip python-dev libevent-dev build-essential
    sudo pip install --upgrade pip
    sudo pip install --upgrade virtualenv
    git clone https://github.com/bne/doorbell.git
    cd doorbell/
    virtualenv venv --setuptools
    . venv/bin/activate
    pip install -r requirements.txt .

    sudo su
    . venv/bin/activate
    export DOORBELL_SETTINGS=`pwd`/settings.py
    python site/runwebsite.py

mjpg-streamer
-------------

    http://blog.miguelgrinberg.com/post/how-to-build-and-run-mjpg-streamer-on-the-raspberry-pi

    sudo apt-get install libjpeg-dev
    wget "http://mjpg-streamer.svn.sourceforge.net/viewvc/mjpg-streamer/mjpg-streamer/?view=tar" -O mjpg-streamer.tgz
    tar xzvf mjpg-streamer.tgz
    rm mjpg-streamer.tgz
    cd mjpg-streamer
    make clean all

    export LD_LIBRARY_PATH=.

Start:

    ./mjpg_streamer -i "/home/ben/projects/doorbell/mjpg-streamer/input_uvc.so -d /dev/video0 -y" -b -o "/home/ben/projects/doorbell/mjpg-streamer/output_http.so -p 8070"

Stop:

    pkill mjpg_streamer

plugins
-------

    pip install pyglet
