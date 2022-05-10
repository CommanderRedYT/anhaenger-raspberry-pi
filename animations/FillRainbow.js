import { Animation } from './BasicAnimation.js';
import * as fns from '@swiftcarrot/color-fns';

export class FillRainbowAnimation extends Animation {
    constructor(buffer) {
        super();
        this.hue = 0;
        this.buffer = buffer;
    }

    update() {
        this.hue += 1;
        if (this.hue > 360) {
            this.hue = 0;
        }
        const color = fns.hsv2rgb(this.hue, 100, 100);
        this.buffer.fill(color.r << 16 | color.g << 8 | color.b);
    }
}