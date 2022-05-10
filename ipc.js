import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';
import * as config from './config.js';
import * as esp32 from './esp32.js';

const app = express();
app.use(bodyParser.json());

app.use('/', async (req, res) => {
    const { body } = req;

    // handle all python requests here
    if (!body.hasOwnProperty('type')) {
        res.sendStatus(400);
        return;
    }

    const { type, content } = body;

    switch (type) {
        case 'heartbeat':
            esp32.setStat('millis', content);
            if (esp32.esp.online === false && parseInt(content) > 10000) {
                await send_data({
                    type: 'restart',
                    content: '',
                });
            }
            if (typeof(esp32.esp.config) === 'undefined' || esp32.esp.config === null) {
                await send_data({
                    type: 'getConfig',
                    content: '',
                });
            }
            break;
        case 'T':
        case 'boot_info_response':
        case 'setConfig':
            // ignore
            break;
        case 'boot_info':
            await send_data({
                type: 'boot_info_response',
                content: 'ok',
            });

            for (const key in content) {
                esp32.setStat(key, content[key]);
            }

            break;
        case 'config':
            esp32.setStat('config', content);
            break;
        default:
            console.log('body', body)
            console.log('Unknown request type:', type, content);
            break;
    }

    res.sendStatus(200);
});

app.listen(config.get('ipc_js_port'), 'localhost', () => {
    console.log(`IPC Server started on port ${config.get('ipc_js_port')}`);
});

export async function send_data(data, old_py_port) { // true/false
    const port = (old_py_port) ? old_py_port : config.get('ipc_py_port');
    const url = `http://localhost:${port}/`;
    try {
        await axios.post(url, data, { timeout: 1000 });
    } catch {}
}

export async function set_config(key, value) {
    let splitted = key.includes('__') ? key.split('__') : [value];
    let data = {
        type: 'setConfig',
        k: key.split('__')[0],
        v: value,
    };
    if (splitted.length > 1) {
        data.i = parseInt(splitted[1]);
    }
    await send_data(data);
}