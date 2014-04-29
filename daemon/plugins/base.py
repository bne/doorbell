from threading import Thread

class Plugin(Thread):
	
    def __init__(self, command):
        self.command = command
        Thread.__init__(self)

    def run(self):
        while 1:
            data = self.command()
            if data == 1:
                self.bell_press()

    def bell_press(self):
        pass


