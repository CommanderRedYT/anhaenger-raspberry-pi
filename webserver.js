import express from 'express';
import bodyParser from 'body-parser';
import * as ipc from './ipc.js';
import fs from 'fs';
import { helpers } from './ledstrip.js';
import * as raspi_config from './config.js';
import * as esp32 from './esp32.js';
import * as tools from './tools.js';

const app = express();
const api = express.Router();
const esp = express.Router();
const raspberry = express.Router();

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));

api.use('/esp', esp);
api.use('/raspberry', raspberry);

app.set('view engine', 'ejs');
app.set('views', './public');

// api
api.get('/restart', async (req, res) => {
    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="refresh" content="5;url=/">
            <title>Redirecting...</title>
        </head>
        <body>
            <h1>Restarting server...</h1>
            <p>You will be redirected in 5 seconds.</p>
            <a href="/">Click here if you are not redirected.</a>
        </body>
        </html>
    `);
    await ipc.send_data({
        type: 'restart',
        content: '',
    });
    process.exit(0);
});

// esp32 api
esp.get('/info', (req, res) => {
    res.json(esp32.esp);
});

esp.get('/calibrate/:state', async (req, res) => {
    const state = (req.params.state === 'true') ? 'true' : 'false';
    await ipc.send_data({
        type: 'led_test',
        content: state,
    });
    res.sendStatus(200);
});

esp.post('/config', async (req, res) => {

    console.log(req.body)

    for (let key in req.body) {
        if (typeof req.body[key] === 'object') {
            continue;
        } else {
            let value = req.body[key];
            try {
                value = JSON.parse(value);
            } catch {}
            await ipc.set_config(key, value);
        }
    }

    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="refresh" content="5;url=/config#esp">
            <title>Redirecting...</title>
        </head>
        <body>
            <h1>Restarting server...</h1>
            <p>You will be redirected in 5 seconds.</p>
            <a href="/config#esp">Click here if you are not redirected.</a>
        </body>
        </html>
    `);

    /*
    await ipc.send_data({
        type: 'restart',
        content: '',
    });
    */
});

// raspi api
raspberry.get('/animations', (req, res) => {
    res.json(helpers.getAnimations());
});

raspberry.post('/config', async (req, res) => {
    const old_py_port = raspi_config.get('ipc_py_port');
    
    for (let key in req.body) {
        const value = JSON.parse(req.body[key]);
        raspi_config.set(key, value);
    }

    raspi_config.save();

    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="refresh" content="3;url=/config#raspi">
            <title>Redirecting...</title>
        </head>
        <body>
            <h1>Restarting server...</h1>
            <p>You will be redirected in 5 seconds.</p>
            <a href="/config#raspi">Click here if you are not redirected.</a>
        </body>
        </html>
    `);

    await ipc.send_data({
        type: 'restart',
        content: '',
    }, old_py_port);
    process.exit(0);
});

app.use('/api', api);

// normal pages
app.use('/', (req, res, next) => {
    let path = req.path === '/' ? 'index' : req.path;

    // try to find the file in the public folder (also with .ejs extension)
    let file = `${path}.ejs`;
    file = file.startsWith('/') ? file.substring(1) : file;

    const file_path = `./public/${file}`;
    if (fs.existsSync(file_path)) {
        res.render(file, { toHTML: tools.toHTML, raspi_config: raspi_config.getConfig(), esp32: esp32.esp });
    } else {
        next();
    }
});

app.use(express.static('public'));

app.listen(raspi_config.get('web_port'), () => {
    console.log(`Webserver started on port ${raspi_config.get('web_port')}`);
});