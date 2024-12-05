import '~/advanced-blend-modes/init';
import { OverlayBlend } from '~/advanced-blend-modes';
import { Container, Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';

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
