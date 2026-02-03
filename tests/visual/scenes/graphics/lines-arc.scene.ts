import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should continue drawing from next point of path',
    create: async (scene: Container) =>
    {
        const lines = new Graphics();

        let segment = 50;
        const origin = { x: 10, y: 10 };

        // white stroke only
        lines
            .moveTo(origin.x, origin.y)
            .lineTo(origin.x + segment, origin.y + segment)
            .stroke({ width: 1.0, color: 0xffffff })
            .lineTo(origin.x + (segment * 2), origin.y)
            .stroke({ width: 1.0, color: 0xffffff });

        segment = 20;
        origin.x = 20;
        origin.y = 12;

        // red and cyan triangles, continuing from last point (white stroke shape)
        lines
            .moveTo(origin.x, origin.y)
            .lineTo(origin.x + segment, origin.y + segment)
            .lineTo(origin.x + (segment * 2), origin.y)
            .fill({ color: 0xff0000 })
            .lineTo(origin.x + (segment * 3), origin.y + segment)
            .lineTo(origin.x + (segment * 2), origin.y + segment)
            .fill({ color: 0x00ffff });

        scene.addChild(lines);

        // draw arc
        const arc = new Graphics();

        arc
            .moveTo(64, 64)
            .arcTo(64, 128, 128, 128, 20)
            .moveTo(64, 64)
            .arc(64, 64, 32, 0, Math.PI)
            .stroke({ width: 1, color: 0x00ffff });

        scene.addChild(arc);
    },
};
