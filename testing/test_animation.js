var ws281x = require('rpi-ws281x');

class Example {

    constructor() {
        // Current pixel position
        this.offset = 0;

        // Set my Neopixel configuration
        this.config = {
            leds: 300,
            dma: 10,
            gpio: 18,
            brightness: 100,
            stripType: 'grb'
        };

        // Configure ws281x
        ws281x.configure(this.config);
    }

    loop() {
        var pixels = new Uint32Array(this.config.leds);

        // Set a specific pixel
        pixels[this.offset] = 0xFF0000;

        // Move on to next
        this.offset = (this.offset + 1) % this.config.leds;

        // Render to strip
        ws281x.render(pixels);
    }

    run() {
        // Loop every 100 ms
        // setInterval(this.loop.bind(this), 2);
        let loops = 1000;
        let start = Date.now() / 1000;
        for (let i = 0; i < loops; i++) {
            this.loop();
        }
        let end = Date.now() / 1000;
        console.log(`${loops / (end - start)} loops per second`);
    }
};

var example = new Example();
example.run();
