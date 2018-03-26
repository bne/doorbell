doorbell
========

Client
------

Build::
    docker build -t doorbell-client .

Run::
    docker run -it --rm --name doorbell-client -e FLASK_APP=/app/main.py -p 5000:5000 doorbell-client

