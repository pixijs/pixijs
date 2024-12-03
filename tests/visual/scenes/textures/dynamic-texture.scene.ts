import { Assets } from '@/assets/Assets';
import { Rectangle } from '@/maths/shapes/Rectangle';
import { Texture } from '@/rendering/renderers/shared/texture/Texture';
import { Sprite } from '@/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Renderer } from '@/rendering/renderers/types';
import type { Container } from '@/scene/container/Container';

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
