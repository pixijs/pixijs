import { RenderTexture } from '../../../../src/rendering/renderers/shared/texture/RenderTexture';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render renderTextures with mipmaps correctly',
    pixelMatch: 250,
    create: async (scene: Container, renderer: Renderer) =>
    {
        const target = RenderTexture.create({
            width: 128,
            height: 128,
            resolution: 1,
            autoGenerateMipmaps: true,
            antialias: true,
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
