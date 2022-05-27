#!/usr/bin/python3
# system is raspberry pi 3b+ ; serial port is /dev/ttyS0 ; just print everything received from serial port until ctrl c is pressed
import serial
import json
import threading
import falcon
from wsgiref.simple_server import make_server
import requests
import sys
import time

ipc_js_port = None
ipc_py_port = None

httpd = None

restart_script = False

messages = []

with open('../config.json') as f:
    config = json.load(f)
    print(config)
    ipc_js_port = config['ipc_js_port']
    ipc_py_port = config['ipc_py_port']

if not ipc_js_port or not ipc_py_port:
    print('config.json is not set up properly')
    sys.exit(1)

ser = serial.Serial('/dev/ttyS0', 115200)

class SendToESP:
    def on_post(self, req, resp):
        global restart_script, messages
        data = req.bounded_stream.read()
        encoded = None
        decoded = None
        resp.status = falcon.HTTP_200

        try:
            decoded = json.loads(data)
            encoded = json.dumps(decoded)

            if decoded and decoded["type"] == "restart":
                restart_script = time.time()
                return
            
            messages.append(encoded)
        except:
            pass
        return

api = falcon.App(media_type=falcon.MEDIA_JSON)
send_to_esp = SendToESP()
api.add_route('/', send_to_esp)

def main():
    # start thread
    while True:
        try:
            str_in = ser.readline().decode('utf-8')
            if not str_in:
                continue
            parsed = None
            try:
                parsed = json.loads(str_in)
            except:
                continue
            if not restart_script:
                requests.post(f'http://localhost:{ipc_js_port}/', json=parsed, timeout=1)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(e)
            continue

def restart_if_needed():
    global restart_script
    while True:
        if restart_script and (restart_script + 1 < time.time()):
            print('restarting')
            httpd.shutdown()
            sys.exit(0)
        time.sleep(0.5) # without, cpu usage is 100%

def send_thread(): # send messages to esp with enough delay
    global messages, ser
    while True:
        if len(messages) > 0:
            msg = messages.pop(0)
            print(f'sending {msg}')
            ser.write(msg.encode() + b'\n')
            time.sleep(0.8)
        time.sleep(0.1)

if __name__ == '__main__':

    # start main as separate thread
    main_thread = threading.Thread(target=main, daemon=True)
    main_thread.start()

    # start restart_if_needed as separate thread
    restart_thread = threading.Thread(target=restart_if_needed, daemon=True)
    restart_thread.start()

    # start send_thread as separate thread
    send_thread = threading.Thread(target=send_thread, daemon=True)
    send_thread.start()

    httpd = make_server('localhost', ipc_py_port, api)

    print(f'Listening on port {ipc_py_port}...')
    httpd.serve_forever()