import telnetlib
import urllib
from time import sleep

SB_TELNET_PORT = 9090
SB_TELNET_HOST = '192.168.1.13'
SB_PLAYERS = ['kitchen']

class Plugin(object):

	def run(self):

		tn = telnetlib.Telnet(SB_TELNET_HOST, port=SB_TELNET_PORT)

		for player in SB_PLAYERS:
			playlist = '{0}_doorbell-tmp.m3u'.format(player)

			tn.write('{0} pause'.format(player))
			tn.write('{0} save playlist {1}\r\n'.format(player, playlist))
			tn.write('{0} playlist play http://content.mysqueezebox.com/static/sounds/effects/sub_alert.mp3\r\n'.format(player))
			tn.write('{0} playlist resume {1}\r\n'.format(player, playlist))

		# get list of players
		# loop through each player 
		# chaeck the play state
		# get the track and time
		# insert the doorbell mp3
		# play the doorbell mp3
		# if the play state was playing
		# play the track at the time it was


if __name__ == '__main__':
	pl = Plugin()
	pl.run()



