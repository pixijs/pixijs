import { BaseTexture, BufferResource, FORMATS, Renderer, TYPES } from '@pixi/core';

describe('BufferResource', () =>
{
    it('should set UNPACK_ALIGNMENT on upload', () =>
    {
        const renderer = new Renderer();
        const texture1 = new BaseTexture(
            new BufferResource(new Uint8Array(1 * 2), { width: 1, height: 2, unpackAlignment: 1 }),
            {
                format: FORMATS.RED,
                type: TYPES.UNSIGNED_BYTE
            }
        );

        renderer.gl.pixelStorei(renderer.gl.UNPACK_ALIGNMENT, 4);
        renderer.texture.bind(texture1);

        expect(renderer.gl.getError()).toBe(renderer.gl.NONE);

        const texture2 = new BaseTexture(
            new BufferResource(new Uint8Array(1 * 2), { width: 1, height: 2 }),
            {
                format: FORMATS.RED,
                type: TYPES.UNSIGNED_BYTE
            }
        );

        renderer.texture.bind(texture2);

        expect(renderer.gl.getError()).not.toBe(renderer.gl.NONE);

        texture1.destroy();
        texture2.destroy();
        renderer.destroy();
    });
});
