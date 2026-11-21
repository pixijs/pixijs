import { BufferImageSource } from '../../../shared/texture/sources/BufferImageSource';
import { Texture } from '../../../shared/texture/Texture';
import { getWebGLRenderer } from '@test-utils';
import { Sprite } from '~/scene';

import type { WebGLRenderer } from '../../WebGLRenderer';

// a 3x3 r8unorm texture: 3 bytes per row
const rows = [[40, 49, 58], [100, 109, 118], [160, 169, 178]];
const texels = rows.flat();

// tightly packed rows, or rows padded to 4 bytes as WebGL's default UNPACK_ALIGNMENT reads them
const layouts: [string, number[]][] = [
    ['tight', rows.flat()],
    ['tight with a byte after it', [...rows.flat(), 7]],
    ['padded except for the last row', [...rows[0], 7, ...rows[1], 7, ...rows[2]]],
    ['padded', rows.flatMap((row) => [...row, 7])],
    ['padded with a byte after it', [...rows.flatMap((row) => [...row, 7]), 7]],
];

describe('glUploadBufferImageResource', () =>
{
    let renderer: WebGLRenderer;

    afterEach(() =>
    {
        renderer?.destroy();
        renderer = null;
    });

    function createSource(bytes: number[]): BufferImageSource
    {
        return new BufferImageSource({
            resource: new Uint8Array(bytes), width: 3, height: 3, format: 'r8unorm', scaleMode: 'nearest',
        });
    }

    it.each(layouts)('should upload an r8unorm buffer whose rows are %s', async (_, bytes) =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });

        const gl = renderer.gl;

        gl.getError();

        const sprite = new Sprite(new Texture({ source: createSource(bytes) }));
        const pixels = renderer.extract.pixels(sprite).pixels;

        expect(gl.getError()).toBe(gl.NO_ERROR);
        expect(Array.from(pixels).filter((_, i) => i % 4 === 0)).toEqual(texels);

        sprite.destroy({ texture: true, textureSource: true });
    });

    it.each([1, 2, 8])('should leave an unpack alignment of %i set by other code as it was', async (alignment) =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });

        const gl = renderer.gl;

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);

        const sources = [
            ...layouts.map(([, bytes]) => createSource(bytes)),
            new BufferImageSource({ resource: new Uint8Array(16), width: 2, height: 2, format: 'rgba8unorm' }),
        ];

        for (const source of sources)
        {
            renderer.texture.initSource(source);

            expect(gl.getParameter(gl.UNPACK_ALIGNMENT)).toBe(alignment);

            source.destroy();
        }
    });

    it('should read rows padded to an unpack alignment of 2 set by other code', async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });

        const gl = renderer.gl;
        const paddedRows = [[10, 20, 30, 40, 50], [60, 70, 80, 90, 100], [110, 120, 130, 140, 150]];

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2);
        gl.getError();

        // 5 bytes per row, each padded to 6: too short for rows padded to 4
        const source = new BufferImageSource({
            resource: new Uint8Array(paddedRows.flatMap((row) => [...row, 7])),
            width: 5,
            height: 3,
            format: 'r8unorm',
            scaleMode: 'nearest',
        });
        const sprite = new Sprite(new Texture({ source }));
        const pixels = renderer.extract.pixels(sprite).pixels;

        expect(gl.getError()).toBe(gl.NO_ERROR);
        expect(Array.from(pixels).filter((_, i) => i % 4 === 0)).toEqual(paddedRows.flat());
        expect(gl.getParameter(gl.UNPACK_ALIGNMENT)).toBe(2);

        sprite.destroy({ texture: true, textureSource: true });
    });
});
