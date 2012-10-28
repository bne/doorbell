import logging
import os
from gevent.pywsgi import WSGIServer
import geventwebsocket
import time

try:
    import RPi.GPIO as GPIO
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(22, GPIO.IN, pull_up_down=GPIO.PUD_UP) # doorbell IO
    GPIO.setup(7, GPIO.IN, pull_up_down=GPIO.PUD_UP)  # reedswitch IO
except ImportError:
    pass

class SocketServer(object):

    def __init__(self):
        self.all = []
        self.broken = []
        server = WSGIServer(('', 8080), self.process, handler_class=geventwebsocket.WebSocketHandler)
        server.serve_forever()

    def process(self, environ, start_response):
        websocket = environ.get('wsgi.websocket')
        
        try:
            while True:
            
                message = websocket.receive()
                if message is None:
                    break
                message = '%s\nserver says %s' % (message, int(time.time()))
                    
                if websocket not in self.all:
                    self.all.append(websocket)
                    logging.debug(self.all)
                
                for sock in self.all:
                    try:
                        sock.send(message)
                    except Exception, exc:
                        logging.debug('broken socket: %s' % (exc,))
                        self.broken.append(sock)
                        continue
                        
                if self.broken:
                    for sock in self.broken:
                        logging.debug('trying to close socket')
                        sock.close()
                        if sock in self.all:
                            logging.debug('trying to remove socket')
                            self.all.remove(sock)
                    self.broken = []
                    logging.debug(self.broken)
                    
            websocket.close()
            
        except geventwebsocket.WebSocketError, exc:
            logging.error('%s: %s' % (exc.__class__.__name__, exc,))



