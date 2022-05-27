import { FillRainbowAnimation } from './animations/FillRainbow.js';
import { RainbowAnimation } from './animations/Rainbow.js';
import ws2812 from 'rpi-ws281x';
import * as config from './config.js';

let { leds_ledstrip, ledstrip_brightness } = config.getConfig();

let led_config = {
    leds: leds_ledstrip,
    dma: 10,
    gpio: 18,
    brightness: ledstrip_brightness,
    stripType: 'grb'
};

var leds = new Uint32Array(leds_ledstrip);

export const animations = {
    FillRainbow: new FillRainbowAnimation(leds),
    Rainbow: new RainbowAnimation(leds)
};

let currentAnimation = Object.keys(animations)[0];

export const setup = () => {
    ws2812.configure(led_config);
    ws2812.render(leds);
};

export const loop = () => {
    animations[currentAnimation].update();
    ws2812.render(leds);
};

export const helpers = {
    setPixel: (index, color) => {
        leds[index] = color;
    },
    setAll: (color) => {
        leds.fill(color);
    },
    getAllPixels: () => {
        return leds;
    },
    getAllPixelsAsHexCode: () => {
        return leds.map(color => {
            return `#${color.toString(16)}`;
        });
    },
    getAnimations: () => {
        return animations;
    },
    getCurrentAnimation: () => {
        return currentAnimation;
    },
    setCurrentAnimation: (animation) => {
        if (Object.keys(animations).includes(animation)) {
            currentAnimation = animation;
        }
    },
    setBrightness: (brightness) => {
        led_config.brightness = brightness;
        ws2812.configure(led_config);
    },
    getBrightness: () => {
        return led_config.brightness;
    },
    getLength: () => {
        return led_config.leds;
    }
};
