import { BufferImageSource, CompressedSource, Texture } from '~/rendering';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer, TEXTURE_FORMATS, TextureSource } from '~/rendering';
import type { Container } from '~/scene';

// red, green, blue and yellow texels, as R, G, B, A bytes
const rgba = [255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255];
// the same texels as B, G, R, A bytes
const bgra = [0, 0, 255, 255, 0, 255, 0, 255, 255, 0, 0, 255, 0, 255, 255, 255];

// the last column holds RGBA bytes labelled bgra8unorm, so it draws with red and blue swapped on every renderer
const columns: [TEXTURE_FORMATS | undefined, number[]][] = [
    [undefined, rgba],
    ['bgra8unorm', bgra],
    ['rgba8unorm', rgba],
    ['bgra8unorm', rgba],
];

export const scene: TestScene = {
    it: 'should read buffer and compressed texture bytes in the order their format gives on every renderer',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const rows: ((format: TEXTURE_FORMATS | undefined, bytes: number[]) => TextureSource)[] = [
            (format, bytes) => new BufferImageSource({
                resource: new Uint8Array(bytes), width: 2, height: 2, format, scaleMode: 'nearest',
            }),
        ];

        // the canvas renderer can't draw compressed sources
        if (renderer.name !== 'canvas')
        {
            rows.push((format, bytes) => new CompressedSource({
                resource: [new Uint8Array(bytes)], width: 2, height: 2, format, scaleMode: 'nearest',
            }));
        }

        rows.forEach((create, row) =>
        {
            columns.forEach(([format, bytes], column) =>
            {
                const sprite = new Sprite(new Texture({ source: create(format, bytes) }));

                sprite.position.set(4 + (column * 32), 4 + (row * 32));
                sprite.width = 24;
                sprite.height = 24;
                scene.addChild(sprite);
            });
        });
    },
};
