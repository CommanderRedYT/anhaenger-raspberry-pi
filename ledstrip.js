import { FillRainbowAnimation } from './animations/FillRainbow.js';
import { RainbowAnimation } from './animations/Rainbow.js';
import ws2812 from 'rpi-ws281x';

let config = {
    leds: 32,
    dma: 10,
    gpio: 18,
    brightness: 100,
    stripType: 'grb'
};

var leds = new Uint32Array(config.leds);

export const animations = {
    FillRainbow: new FillRainbowAnimation(leds),
    Rainbow: new RainbowAnimation(leds)
};

let currentAnimation = Object.keys(animations)[0];

export const setup = () => {
    ws2812.configure(config);
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
        config.brightness = brightness;
        ws2812.configure(config);
    },
    getBrightness: () => {
        return config.brightness;
    },
    getLength: () => {
        return config.leds;
    }
};
