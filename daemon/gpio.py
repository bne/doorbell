"""
GPIO listener
=============

Mock events
-----------
'd' (32) maps to a doorbell press event
'r' (19) maps to a door open event
"""
from struct import unpack

try:
    import RPi.GPIO as GPIO
except ImportError:
    GPIO = None

EVT_DOORBELL = 1
EVT_DOOROPEN = 2

class GPIOListener(object):

    def __init__(self):
        if GPIO:
            GPIO.setmode(GPIO.BOARD)
            GPIO.setup(7, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            GPIO.setup(22, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        else:
            # event3 == laptop keyboard
            self.port = open('/dev/input/event3', 'rb') 		

    def listen(self):
        if GPIO:
            if not GPIO.input(22):
                return EVT_DOOROPEN                
            if not GPIO.input(7):
                return EVT_DOORBELL
        else:
            code = unpack('4B', self.port.read(4))[2]
            if code == 32:
                return EVT_DOORBELL
            if code == 19:
                return EVT_DOOROPEN

if __name__ == '__main__':
    gl = GPIOListener()
    while 1:
        evt = gl.listen()
        if evt:
            print evt