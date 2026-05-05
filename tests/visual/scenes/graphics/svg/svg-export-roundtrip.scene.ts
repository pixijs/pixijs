import { Graphics, graphicsContextToSvg } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should roundtrip graphics → SVG → graphics and look the same',
    create: async (scene: Container) =>
    {
        // --- Build a semi-complex graphic ---
        const original = new Graphics();

        // Filled rect
        original.rect(0, 0, 60, 40);
        original.fill({ color: 0xde3249 });

        // Stroked rounded rect
        original.roundRect(5, 50, 50, 30, 8);
        original.fill({ color: 0x650a5a });
        original.stroke({ color: 0xfeeb77, width: 2 });

        // Circle
        original.circle(30, 110, 20);
        original.fill({ color: 0x4fc3f7 });

        // Ellipse
        original.ellipse(30, 155, 25, 12);
        original.fill({ color: 0x66bb6a });

        // Polygon (triangle)
        original.poly([10, 185, 30, 175, 50, 185], true);
        original.fill({ color: 0xff9800 });

        // Bezier curve
        original.moveTo(5, 200);
        original.bezierCurveTo(15, 190, 45, 210, 55, 200);
        original.stroke({ color: 0x7e57c2, width: 2 });

        // Rect with circular hole
        original.rect(5, 220, 50, 40);
        original.fill({ color: 0xef5350 });
        original.circle(30, 240, 10);
        original.cut();

        // --- Export to SVG and re-import ---
        const svgString = graphicsContextToSvg(original.context);
        const reimported = new Graphics().svg(svgString);

        // Scale both to fit the 128x128 test canvas side by side
        const scale = 0.45;

        original.scale.set(scale);
        original.position.set(2, 2);

        reimported.scale.set(scale);
        reimported.position.set(66, 2);

        scene.addChild(original);
        scene.addChild(reimported);
    },
};
