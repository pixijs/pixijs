import { Assets } from '../../../../src/assets/Assets';
import { Rectangle } from '../../../../src/maths/shapes/Rectangle';
import { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render a dynamic texture',
    pixelMatch: 200,
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
