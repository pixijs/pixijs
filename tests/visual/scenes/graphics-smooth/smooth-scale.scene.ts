import { SmoothGraphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should scale strokes with the transform, unless they are pixel lines',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const draw = (pixelLine: boolean, color: number) => new SmoothGraphics()
            .circle(10, 10, 8)
            .moveTo(2, 26)
            .lineTo(18, 26)
            .stroke({ color, width: 2, pixelLine });

        const columns = [{ x: 4, sx: 1, sy: 1 }, { x: 32, sx: 2, sy: 2 }, { x: 84, sx: 2, sy: 0.8 }];

        columns.forEach(({ x, sx, sy }) =>
        {
            const scaled = draw(false, 0xff0000);
            const pixel = draw(true, 0xffffff);

            scaled.scale.set(sx, sy);
            pixel.scale.set(sx, sy);
            scaled.position.set(x, 4);
            pixel.position.set(x, 68);

            scene.addChild(scaled, pixel);
        });
    },
};
