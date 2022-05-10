export const default_esp = {
    millis: 0,
    online: false,
    config: null,
}

export const esp = {};

export function setStat(name, value) {
    esp[name] = value;
}

var last_millis = 0;

export function get_millis_as_timestamp() {
    // millis = milliseconds since boot
    // timestamp = now - millis
    return Date.now() - esp.millis;
}

function reset_esp_object() {
    for (const key in default_esp) {
        esp[key] = default_esp[key];
    }
}

function clear_esp_object() {
    for (const key in esp) {
        delete esp[key];
    }
}

setInterval(() => {
    const now_millis = esp.hasOwnProperty('millis') ? esp.millis : 0;
    if (now_millis === last_millis) {
        clear_esp_object();
        reset_esp_object();
    } else {
        esp.online = true;
    }
    last_millis = now_millis;
}, 5000);

reset_esp_object();
