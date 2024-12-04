import { Graphics } from '~/scene/graphics/shared/Graphics';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering/renderers/types';
import type { Container } from '~/scene/container/Container';

export const scene: TestScene = {
    it: 'should tile a texture correctly',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const target = new Graphics();

        target.moveTo(8, 0).lineTo(0, 8).moveTo(12, 20).lineTo(20, 12)
            .stroke({ width: 4, color: 0, cap: 'round' });

        const texture = renderer.generateTexture({ target });

        texture.source.label = 'text';

        const graphics = new Graphics();

        graphics.rect(0, 0, 128, 128);
        graphics.fill({ texture });

        scene.addChild(graphics);
    },
};
