import telnetlib
from base import Plugin

SB_TELNET_PORT = 9090
SB_TELNET_HOST = '192.168.1.10'
SB_PLAYERS = ['kitchen', 'bedroom']
SB_ALERT_FILE = '/volume1/music/een_kurug_kagban-na_men.mp3'

class SqueezeboxPlugin(Plugin):

	def run(self):

		tn = telnetlib.Telnet(SB_TELNET_HOST, port=SB_TELNET_PORT)

		for player in SB_PLAYERS:
			playlist = '{0}-doorbell'.format(player)
			tn.write('{0} playlist save {1}\r\n'.format(player, playlist))
			tn.write('{0} playlist play {1}\r\n'.format(player, SB_ALERT_FILE))
			tn.write('{0} playlist insert {1}\r\n'.format(player, playlist))

if __name__ == '__main__':
	pl = SqueezeboxPlugin()
	pl.run()
