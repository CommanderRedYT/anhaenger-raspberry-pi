import fs from 'fs';
import * as tools from './tools.js';

// the config file is called config.js. If it doesn't exist, create it. If it does exist, import it.
// there should be a config object that gets updated via inotify.
// there should be a default object. on load, if keys don't exist in the config object, they should be set to values from the default object.
// set(key, value) should be used to set a key to a value.
// get(key) should be used to get a value.
// save() should be used to save the config object to the config file.
// load() should be used to load the config object from the config file.
// autosave(bool) should be used to set the autosave flag.

let __autosave = false;

let config = {};

const config_file = './config.json';

const defaultConfig = {
    web_port: 80,
    ipc_js_port: 3000,
    ipc_py_port: 3001,
    ledstrip_interval: 10,
    leds_ledstrip: 30,
};

export const set = (key, value) => {
    config[key] = value;
    if (__autosave) {
        save();
    }
}

export const get = (key) => {
    return config[key];
}

export const save = () => {
    fs.writeFileSync(config_file, JSON.stringify(config, null, 4));
    console.log('config saved');
}

export const load = () => {
    if (!fs.existsSync(config_file)) {
        fs.writeFileSync(config_file, JSON.stringify(defaultConfig, null, 4));
        console.log('Config file not found, creating new one.');
    }

    try {
        config = JSON.parse(fs.readFileSync(config_file));
    } catch (error) {
        fs.writeFileSync(config_file, JSON.stringify(defaultConfig, null, 4));
        config = JSON.parse(fs.readFileSync(config_file));
        console.log('config.js not found or invalid. Created new config.js.');
    }

    // check if keys are missing
    for (let key in defaultConfig) {
        if (!(key in config)) {
            config[key] = defaultConfig[key];
        }
    }
    save();
}

export const getConfig = () => {
    return config;
}

export const autosave = (bool) => {
    __autosave = bool;
}

load();

console.log(config);