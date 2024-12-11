import { Assets } from '~/assets';
import { Rectangle } from '~/maths';
import { Texture } from '~/rendering';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a dynamic texture',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const bunnyTexture = await Assets.load<Texture>(`bunny.png`);

        const texture = new Texture({
            source: bunnyTexture.source,
            dynamic: true,
            frame: new Rectangle(0, 0, 16, 16)
        });

        texture.source.addressMode = 'repeat';

        const sprite = new Sprite(texture);

        scene.addChild(sprite);

        renderer.render(scene);

        texture.frame.width = 128;
        texture.frame.height = 128;
        texture.update();
    },
};
