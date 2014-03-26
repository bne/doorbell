import pyglet
from time import sleep

from base import Plugin

BELL_FILE = 'baa.wav'

class BellPlugin(Plugin):

	def run(self):
		stream = pyglet.resource.media(BELL_FILE)
		stream.play()
		pyglet.clock.schedule_once(pyglet.app.exit(), stream.duration)
		pyglet.app.run()

if __name__ == '__main__':
	pl = BellPlugin()
	pl.run()
