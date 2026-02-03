import { Assets } from '~/assets';
import { type Container, Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Texture } from '~/rendering';

export const scene: TestScene = {
    it: 'should render SVGs with decimal resolutions without trimming (issue #11625)',
    create: async (scene: Container) =>
    {
        // Create two identical SVG circles with different IDs to avoid caching
        const svgString1 = `
            <svg id="circle1" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
                <circle cx="40" cy="40" r="39" fill="#ffffff" stroke="#ff0000" stroke-width="2"/>
            </svg>`;

        const svgString2 = `
            <svg id="circle2" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
                <circle cx="40" cy="40" r="39" fill="#ffffff" stroke="#ff0000" stroke-width="2"/>
            </svg>`;

        // Load with different resolutions - this should show the difference
        const texture1 = await Assets.load<Texture>({
            alias: 'circle-res-1-visual',
            src: `data:image/svg+xml;utf8,${encodeURIComponent(svgString1)}`,
            data: { resolution: 1.0 }
        });

        const texture2 = await Assets.load<Texture>({
            alias: 'circle-res-decimal-visual',
            src: `data:image/svg+xml;utf8,${encodeURIComponent(svgString2)}`,
            data: { resolution: 1.0125 }
        });

        // Create sprites
        const sprite1 = new Sprite(texture1);

        sprite1.x = 50;
        sprite1.y = 100;

        const sprite2 = new Sprite(texture2);

        sprite2.x = 200;
        sprite2.y = 100;

        // Create background rectangles to make any trimming visible
        const background1 = new Graphics()
            .rect(48, 98, 84, 84)
            .fill(0x444444);

        const background2 = new Graphics()
            .rect(198, 98, 84, 84)
            .fill(0x444444);

        // Create labels using graphics
        const labelBg1 = new Graphics()
            .rect(50, 50, 100, 25)
            .fill(0x333333)
            .stroke({ color: 0xffffff, width: 1 });

        const labelBg2 = new Graphics()
            .rect(200, 50, 100, 25)
            .fill(0x333333)
            .stroke({ color: 0xffffff, width: 1 });

        // Add everything to scene
        scene.addChild(background1);
        scene.addChild(background2);
        scene.addChild(sprite1);
        scene.addChild(sprite2);
        scene.addChild(labelBg1);
        scene.addChild(labelBg2);
    },
};
