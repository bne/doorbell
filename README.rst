doorbell
========

Install::
    sudo apt-get install docker.io motion
    sudo usermod -aG docker $USER


Client
------

Build::
    docker build -t doorbell-client .

Run dev::
    docker run -it --rm -p 5000:5000 -v $(pwd)/app:/app -e FLASK_APP=main.py -e FLASK_DEBUG=1 doorbell-client

Run::
    docker run -d --restart=always -p 80:80 -e FLASK_APP=main.py doorbell-client

Motion
------

Install::
    mkdir ~/.motion
    cd ~/.motion
    sudo cp /etc/motion/motion.conf .
    sudo chown pi motion.conf
