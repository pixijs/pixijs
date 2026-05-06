import { Assets } from '~/assets';
import { Matrix } from '~/maths';
import { Graphics } from '~/scene';
import { FillPattern } from '~/scene/graphics/shared/fill/FillPattern';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render pattern with local textureSpace, fitting tiles to each shape',
    options: {
        width: 280,
        height: 220,
    },
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');

        // Top row: local space, no transform — one tile stretched to each shape's bounds.
        // The big rect and the small rect each show exactly one bunny.
        const stretched = new FillPattern({ texture, repetition: 'repeat', textureSpace: 'local' });

        const g1 = new Graphics();

        g1.rect(0, 0, 192, 60).fill({ fill: stretched });
        g1.rect(208, 0, 48, 60).fill({ fill: stretched });
        scene.addChild(g1);

        // Middle row: local space with a scaling transform — subdivides each shape into a tile grid.
        // Both rects show a 4-wide grid of bunnies regardless of their actual width.
        const subdivided = new FillPattern({ texture, repetition: 'repeat', textureSpace: 'local' });

        subdivided.setTransform(new Matrix().scale(0.25, 0.25));

        const g2 = new Graphics();

        g2.rect(0, 70, 192, 60).fill({ fill: subdivided });
        g2.rect(208, 70, 48, 60).fill({ fill: subdivided });
        scene.addChild(g2);

        // Bottom row: same setup with global textureSpace for comparison —
        // tiles are world-space sized, so the small rect just shows whatever
        // happens to land under it.
        const global = new FillPattern({ texture, repetition: 'repeat', textureSpace: 'global' });

        const g3 = new Graphics();

        g3.rect(0, 140, 192, 60).fill({ fill: global });
        g3.rect(208, 140, 48, 60).fill({ fill: global });
        scene.addChild(g3);
    },
};
