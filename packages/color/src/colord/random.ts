import { Colord } from './colord';

export const random = (): Colord =>
    new Colord({
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255,
    });
