import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render a pixel line correctly',
    create: async (scene: Container, _renderer: Renderer) =>
    {
        const graphics = new Graphics();

        graphics
            .moveTo(8, 0).lineTo(0, 8).moveTo(12, 20).lineTo(20, 12)
            .stroke({ color: 0, pixelLine: true })
            .rect(128 / 4, 128 / 4, 128 / 2, 128 / 2)
            .fill({ color: 0xff0000, alpha: 0.8 })
            .stroke({ color: 0xFFFFFF, pixelLine: true, alpha: 1 })
            .circle(128 / 2, 128 / 2, 128 / 2)
            .stroke({ color: 0x0, pixelLine: true, alpha: 0.5 });

        scene.addChild(graphics);
    },
};
