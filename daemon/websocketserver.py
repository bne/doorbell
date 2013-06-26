#!/usr/bin/env python

import socket
import threading
import base64
import hashlib

from gpiolistener import GPIOListener

MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
HANDSHAKE = 'HTTP/1.1 101 Switching Protocols\r\n\
Upgrade: %(upgrade)s\r\n\
Connection: Upgrade\r\n\
Sec-WebSocket-Accept: %(hash)s\r\n\
'

class WebSocketServer(object):

    def __init__(self):
        self.clients = []
        self.gpio_listener = GPIOListener()

    def start(self):
        sock = socket.socket()
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(('', 9876))
        sock.listen(5)
        while 1:
            client, addr = sock.accept()
            self.clients.append(client)
            thread = threading.Thread(
                target=self.handle, args=(client, addr))
            thread.daemon = True
            thread.start()

    def handle(self, client, addr):
        self.handshake(client)
        lock = threading.Lock()
        while 1:
            evt = self.gpio_listener.listen()
            lock.acquire()
            if evt:
                for c in self.clients:
                    c.send(self.text_frame(str(evt) + '\r\n\r\n'))
            lock.release()

        lock.acquire()
        self.clients.remove(client)
        lock.release()
        client.close()

    def handshake(self, client):
        headers = self.parse_headers(client.recv(1024))
        return client.send(HANDSHAKE % {
            'upgrade': headers['Upgrade'],
            'hash': self.create_hash(headers['Sec-WebSocket-Key'])
        })

    def parse_headers(self, data):
        headers = {}
        lines = data.splitlines()
        for line in lines:
            parts = line.split(':', 1)
            if len(parts) == 2:
                headers[parts[0]] = parts[1].lstrip()
        return headers

    def create_hash (self, key):
        return base64.encodestring(hashlib.sha1(key + MAGIC_STRING).digest())

    def text_frame(self, data):
        bytes = bytearray()
        bytes.append(0b10000001)

        bytes.append(len(data) + 0)

        for c in data:
            bytes.append(c)

        return bytes
