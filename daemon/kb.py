from struct import unpack
port = open("/dev/input/event5","rb")    

while 1:    
    a,b,c,d = unpack("4B",port.read(4))    
    print a,b,c,d
