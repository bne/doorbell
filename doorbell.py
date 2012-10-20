import subprocess
import re
import os

from flask import Flask, render_template
app = Flask(__name__)

LD_LIBRARY_PATH = '/home/ben/Desktop/mjpg-streamer'



@app.route("/")
def doorbell():
    return render_template('index.html')
    
@app.route("/image/stream/start")
def start_stream():
    if not _process_exists('mjpg_streamer'):
        subprocess.Popen('%(path)s/mjpg_streamer -i "%(path)s/input_uvc.so -d /dev/video0 -y" -b -o "%(path)s/output_http.so -p 8090"' % { 'path': LD_LIBRARY_PATH }, shell=True, stdout=subprocess.PIPE)
    return 'started'
        
@app.route("/image/stream/stop")
def toggle_stream():
    if _process_exists('mjpg_streamer'):
        subprocess.Popen("kill -9 `pidof mjpg_streamer`", 
            shell=True, stdout=subprocess.PIPE)
    return 'stopped'
    
def _process_exists(proc_name):
    ps = subprocess.Popen("ps ax -o pid= -o args= ", 
        shell=True, stdout=subprocess.PIPE)
    ps_pid = ps.pid
    output = ps.stdout.read()
    ps.stdout.close()
    ps.wait()

    for line in output.split("\n"):
        res = re.findall("(\d+) (.*)", line)
        if res:
            pid = int(res[0][0])
            if proc_name in res[0][1] and pid != os.getpid() and pid != ps_pid:
                return True
    return False 
    
    
    
if __name__ == "__main__":
    app.run(debug = True)
