module.exports = {
    apps: [
        {
            name: 'NodeJS Webserver and REST API',
            script: '/home/pi/nodejs-leds/main.js',
            watch: true,
            cwd: '/home/pi/nodejs-leds',
            ignore_watch: ['config.json'],
        },
        {
            name: 'Python ESP32 Modem Interface',
            script: '/home/pi/nodejs-leds/python/modem_receiver.py',
            watch: true,
            cwd: '/home/pi/nodejs-leds/python',
            interpreter: '/usr/bin/python3',
        }
    ]
}
