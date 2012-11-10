"""
GPIO listener
=============

Mock events
-----------
'd' (32) maps to a doorbell press event
'r' (19) maps to a door open event
"""
from struct import unpack

EVT_DOORBELL = 1
EVT_DOOROPEN = 2

class GPIOListener(object):

    def __init__(self):
        # event3 == laptop keyboard
        self.port = open('/dev/input/event3', 'rb') 		

    def listen(self):
        evt = unpack('4B', self.port.read(4))
        if evt[2] == 32:
            return EVT_DOORBELL
        if evt[2] == 19:
            return EVT_DOOROPEN

if __name__ == '__main__':
    gl = GPIOListener()
    while 1:
        evt = gl.listen()
        if evt:
            print evt