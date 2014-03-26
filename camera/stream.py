import os
import re
import subprocess

from flask.config import Config

config = Config({})
config.from_envvar('DOORBELL_SETTINGS')

def process_exists(proc_name):
    ps = subprocess.Popen('ps ax -o pid= -o args= ', 
        shell=True, stdout=subprocess.PIPE)
    ps_pid = ps.pid
    output = ps.stdout.read()
    ps.stdout.close()
    ps.wait()

    for line in output.split('\n'):
        res = re.findall('(\d+) (.*)', line)
        if res:
            pid = int(res[0][0])
            if proc_name in res[0][1] and pid != os.getpid() and pid != ps_pid:
                return True
    return False 

def start():
    if not process_exists('mjpg_streamer'):
        subprocess.Popen('%(path)s/mjpg_streamer -i "%(path)s/input_uvc.so -d %(video)s -y" -b -o "%(path)s/output_http.so -p %(port)s"' % {
          'path': config['LD_LIBRARY_PATH'],
          'video': config['VIDEO_PATH'],
          'port': config['STREAM_PORT'] },
          shell=True, stdout=subprocess.PIPE)

def stop():
    if process_exists('mjpg_streamer'):
        subprocess.Popen('kill -9 `pidof mjpg_streamer`',
            shell=True, stdout=subprocess.PIPE)
