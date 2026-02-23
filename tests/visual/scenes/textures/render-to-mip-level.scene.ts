import { RenderTexture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render to a specific mip level of a renderTexture',
    excludeRenderers: ['webgl1'],
    create: async (scene: Container, renderer: Renderer) =>
    {
        const target = RenderTexture.create({
            width: 128,
            height: 128,
            resolution: 1,
            autoGenerateMipmaps: false,
            mipLevelCount: 8,
        });

        // Initialize mip 0 so sampling/blending between mip 0/1 never hits undefined data.
        const g0 = new Graphics();

        g0.rect(0, 0, 128, 128).fill('black');

        renderer.render({
            container: g0,
            target,
            mipLevel: 0,
            clear: true,
            clearColor: [0, 0, 0, 1],
        });

        // Render into mip 1 (64x64)
        const g = new Graphics();

        g.rect(0, 0, 64, 64).fill('black');
        g.circle(32, 32, 24).fill('white');

        renderer.render({
            container: g,
            target,
            mipLevel: 1,
            clear: true,
            clearColor: [0, 0, 0, 1],
        });

        // Display the full texture; if mip-1 rendering works, you'll see a smaller/lower-res result
        // once the sprite scales down and sampling chooses higher mip levels.
        target.source.mipmapFilter = 'linear';
        target.source.scaleMode = 'linear';

        const sprite = new Sprite(target);

        // 128 -> 64 on screen should select mip 1.
        sprite.scale.set(0.5);
        sprite.position.set(10, 10);
        scene.addChild(sprite);
    },
};

