import { RenderTexture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render renderTextures with mipmaps correctly',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const target = RenderTexture.create({
            width: 128,
            height: 128,
            resolution: 1,
            autoGenerateMipmaps: true,
            //  antialias: true,
        });

        const g = new Graphics();

        g.context
            .translate(40, 40)
            .star(0, 0, 6, 40, 25, 0)
            .fill('red')
            .star(40, 0, 6, 40, 25, 0)
            .fill('green')
            .star(20, 40, 6, 40, 25, 0)
            .fill('blue');

        renderer.render({
            container: g,
            target,
        });

        // this sprite below will end up using a smaller mipmap...
        // without updating the source, this would make it render as invisible
        // as mipmaps won't be generated updateMipmaps is called.
        target.source.updateMipmaps();

        const sprite = new Sprite(target);

        sprite.scale.set(0.5);

        sprite.position.set(35, 35);

        scene.addChild(sprite);
    },
};
