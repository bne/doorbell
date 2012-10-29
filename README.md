doorbell
========

site
----

    sudo apt-get install python-pip python-dev build-essential libevent-dev
    sudo pip install --upgrade pip
    sudo pip install --upgrade virtualenv
    git clone https://github.com/bne/doorbell.git
    cd doorbell/
    virtualenv venv
    . venv/bin/activate
    pip install Flask gevent-websocket gunicorn

    . venv/bin/activate
    gunicorn doorbell:app

mjpg-streamer
-------------

    sudo apt-get install libjpeg-dev
    wget "http://mjpg-streamer.svn.sourceforge.net/viewvc/mjpg-streamer/mjpg-streamer/?view=tar" -O mjpg-streamer.tgz
    tar xzvf mjpg-streamer.tgz
    cd mjpg-streamer
    make clean all

    export LD_LIBRARY_PATH=.
    ./mjpg_streamer -i "input_uvc.so -d /dev/video0 -y" -o "output_http.so -p 8090"


GPIO
----

Doorbell
........

    GPIO.setup(22, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    while True:
      GPIO.input(22)


Reed Switch
...........

    GPIO.setup(7, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    
    while True:
      GPIO.input(7)




