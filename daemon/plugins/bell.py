from subprocess import call
import threading

from base import Plugin

BELL_FILE = '/home/ben/projects/doorbell/daemon/plugins/baa.wav'

class BellPlugin(Plugin):

	def bell_press(self):
		call(['aplay', BELL_FILE])

if __name__ == '__main__':
	pl = BellPlugin()
	pl.bell_press()
