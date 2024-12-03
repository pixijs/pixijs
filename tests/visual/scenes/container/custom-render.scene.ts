import { Assets } from '~/assets/Assets';
import { RenderContainer } from '~/scene/container/RenderContainer';
import { Sprite } from '~/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering/renderers/types';
import type { Container } from '~/scene/container/Container';

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
