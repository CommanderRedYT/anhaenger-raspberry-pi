import { Animation } from './BasicAnimation.js';
import * as fns from '@swiftcarrot/color-fns';

export class RainbowAnimation extends Animation {
    constructor(buffer) {
        super();
        this.index = 0;
        this.hue = 0;
        this.buffer = buffer;
    }

    update() {
        if (this.index++ > 360) {
            this.index = 0;
        }

        let hsv = {
            hue: this.index,
            saturation: 100,
            value: 100
        };

        for (let i = 0; i < this.buffer.length; i++) {
            const color = fns.hsv2rgb(hsv.hue, hsv.saturation, hsv.value);
            this.buffer[i] = color.r << 16 | color.g << 8 | color.b;
            hsv.hue += 360 / this.buffer.length;
            if (hsv.hue > 360) {
                hsv.hue -= 360;
            }
        }
    }
}