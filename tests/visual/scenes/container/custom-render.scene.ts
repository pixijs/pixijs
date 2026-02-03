import { Assets } from '~/assets';
import { RenderContainer, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a custom container GPU code',
    create: async (scene: Container) =>
    {
        const container = new RenderContainer({
            render: (renderer: Renderer) =>
            {
                renderer.clear({
                    clearColor: 'green',
                });
            }
        });

        const bunnyTexture = await Assets.load('bunny.png');
        const bunny = Sprite.from(bunnyTexture);

        bunny.position.set(128 / 2);
        bunny.anchor.set(0.5);

        scene.addChild(container);
        scene.addChild(bunny);
    },
};
