import { Rectangle } from '~/maths';
import { RenderTexture, Texture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render to a mip level using a Texture frame (frame is mip-0 space)',
    renderers: {
        webgl2: true,
        webgpu: true,
        webgl1: false,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        // Base backing texture (empty), with mip storage.
        const rt = RenderTexture.create({
            width: 256,
            height: 256,
            resolution: 1,
            autoGenerateMipmaps: false,
            mipLevelCount: 6,
        });

        // Make a sub-texture (like an atlas entry) pointing at the bottom-right quarter of the base texture.
        const sub = new Texture({
            source: rt.source,
            frame: new Rectangle(128, 128, 128, 128),
        });

        // Render into mip 2 (256 -> 64). The frame should scale to a 32x32 region at mip 2.
        const g = new Graphics();

        g.rect(0, 0, 32, 32).fill('black');
        g.circle(16, 16, 12).fill('white');

        renderer.render({
            container: g,
            target: sub,
            mipLevel: 2,
            clear: true,
            clearColor: [0, 0, 0, 1],
        });

        // Display the base texture scaled down so sampling selects mip 2.
        rt.source.mipmapFilter = 'nearest';
        rt.source.scaleMode = 'linear';

        const sprite = new Sprite(rt);

        sprite.scale.set(0.25); // 256 -> 64 (mip 2)
        sprite.position.set(10, 10);

        scene.addChild(sprite);
    },
};

