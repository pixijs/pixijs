import { Assets } from '../../../../src/assets/Assets';
import { RenderContainer } from '../../../../src/scene/container/RenderContainer';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render a custom container GPU code',
    pixelMatch: 200,
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
