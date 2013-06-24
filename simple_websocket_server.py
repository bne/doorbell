#!/usr/bin/env python

import socket, struct, hashlib, threading, cgi, base64

WEBSOCKET_MAGIC_HANDSHAKE_STRING = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

def create_hash (key):
	return base64.encodestring(
		hashlib.sha1(key + WEBSOCKET_MAGIC_HANDSHAKE_STRING).digest())

def recv_data (client, length):
	data = client.recv(length)
	if not data: return data
	return data.decode('utf-8', 'ignore')



    
# Create the frame to sent to the client for sending a string message "data"
# It uses the final flag each time and always the "text" opcode. You can customize the function if you need...
# It may or may not work with non-ascii chars... up to you to test
def composeTxtFrame(data):
    bytes = bytearray()
    bytes.append(0b10000001)
    header = 0b100000010 # final message + 000 + opcode Text + non masked
    payloadLength = len(data)
    # print 'Length of data is', payloadLength
    payloadLengthNOfBits = 4
    if payloadLength > 65535: # 2^16-1
        NBYTESOFPLLENGTH = 8
        payloadLengthNOfBits += NBYTESOFPLLENGTH
        bytes.append(127 + 0)
        i = 0
        while i < NBYTESOFPLLENGTH:
            bytes.append((payloadLength >> (8*(NBYTESOFPLLENGTH-i-1))) & 255)
            i += 1
        
    elif payloadLength > 125:
        print 'Coding payloadLength on 16 bits'
        NBYTESOFPLLENGTH = 2
        payloadLengthNOfBits += 16
        bytes.append(126 + 0)
        i = 0
        dbgarr = bytearray()
        while i < NBYTESOFPLLENGTH:
            shift = (8*(NBYTESOFPLLENGTH-i-1))
            print 'Shifting of', shift
            b = (payloadLength >> shift) & 255
            dbgarr.append(b)
            bytes.append(b)
            i += 1
        print 'payloadLength coded as: '
        printAsBinary2(dbgarr)
        
    else:
        bytes.append(payloadLength + 0)
    
    for c in data:
        bytes.append(c)
    
    return bytes






def send_data (client, data):
	print data
	message = composeTxtFrame('WOOO' + '\r\n\r\n')
	print message
	return client.send(message)

def parse_headers (data):
	headers = {}
	lines = data.splitlines()
	for l in lines:
		parts = l.split(": ", 1)
		if len(parts) == 2:
			headers[parts[0]] = parts[1]
	headers['code'] = lines[len(lines) - 1]
	return headers

def handshake (client):
	print 'Handshaking...'
	data = client.recv(1024)
	headers = parse_headers(data)
	print 'Got headers:'
	for k, v in headers.iteritems():
		print k, ':', v

	shake = "HTTP/1.1 101 Switching Protocols\r\n"
	shake += "Upgrade: %s\r\n" % headers["Upgrade"]
	shake += "Connection: Upgrade\r\n"
	shake += "Sec-WebSocket-Accept: %s\r\n" % create_hash(headers['Sec-WebSocket-Key'])

	return client.send(shake)

def handle (client, addr):
	handshake(client)
	lock = threading.Lock()
	while 1:
		data = recv_data(client, 1024)
		if not data: break
		lock.acquire()
		[send_data(c, data) for c in clients]
		lock.release()
	print 'Client closed:', addr
	lock.acquire()
	clients.remove(client)
	lock.release()
	client.close()
	
def start_server ():
	s = socket.socket()
	s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
	s.bind(('', 9876))
	s.listen(5)
	while 1:
		conn, addr = s.accept()
		print 'Connection from:', addr
		clients.append(conn)
		threading.Thread(target = handle, args = (conn, addr)).start()

clients = []
start_server()