doorbell
========

::

	sudo su - pi

    sudo apt-get install motion

	git clone https://github.com/bne/doorbell.git
	cd doorbell

	cp config/home/pi/.config/lxsession/LXDE-pi/autostart /home/pi/.config/lxsession/LXDE-pi/autostart

	sudo cp config/etc/systemd/system/doorbell.service /etc/systemd/system/doorbell.service
	sudo enable doorbell.service
	sudo start doorbell.service

    mkdir ~/.motion
    cd ~/.motion
    cp ~/doorbell/config/home/pi/.motion/motion.conf .
	chown pi motion.conf
	sudo cp ~/doorbell/config/etc/default/motion /etc/default/motion

	sudo reboot
