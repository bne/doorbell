#!/usr/bin/env python

"""
'd' (32) maps to a doorbell press event
'r' (19) maps to a door open event
'b' (202) maps to both doorbell press and dooropn events
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
            self.port = open('/dev/input/event4', 'rb')

    def listen(self):
        evt_code = 0

        if GPIO:
            if not GPIO.input(22):
                evt_code = evt_code | EVT_DOOROPEN
            if not GPIO.input(7):
                evt_code = evt_code | EVT_DOORBELL
        else:
            code = unpack('4B', self.port.read(4))[2]
            if code == 32: # 'd'
                evt_code = EVT_DOORBELL
            if code == 19: # 'r'
                evt_code = EVT_DOOROPEN
            if code == 48: # 'b'
                evt_code = EVT_DOORBELL | EVT_DOOROPEN

        if evt_code > 0:
            return evt_code

if __name__ == '__main__':
    gp = GPIOListener()
    while 1:
        evt = gp.listen()
        if evt:
            print evt