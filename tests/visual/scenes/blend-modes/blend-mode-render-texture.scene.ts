import { OverlayBlend } from '../../../../src/advanced-blend-modes/OverlayBlend';
import { Container } from '../../../../src/scene/container/Container';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';
import { Sprite } from '../../../../src/scene/sprite/Sprite';
import '../../../../src/advanced-blend-modes/init';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should have correct alpha when blending on a transparent texture',
    options: {
        useBackBuffer: true,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        const red = new Graphics().circle(128 / 2, 128 / 2, 128 / 2).fill('red');
        const yellow = new Graphics().circle(128 / 2, 128 / 2, 128 / 2).fill('yellow');

        yellow.filters = [new OverlayBlend()];

        const container = new Container();

        container.addChild(red, yellow);

        const renderTexture = renderer.generateTexture(container);

        const sprite = new Sprite(renderTexture);

        scene.addChild(sprite);
    },
};
