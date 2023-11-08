// import { BaseTexture, BufferResource, FORMATS, Renderer, TYPES } from '@pixi/core';

import { BufferImageSource } from '../../src/rendering/renderers/shared/texture/sources/BufferSource';
import { Texture } from '../../src/rendering/renderers/shared/texture/Texture';
import { getRenderer } from '../utils/getRenderer';

import type { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

// note = BufferSource

describe('BufferImageSource', () =>
{
    it('should set UNPACK_ALIGNMENT on upload', async () =>
    {
        const renderer = await getRenderer({ width: 1, height: 1 }) as WebGLRenderer;
        const texture1 = new Texture(
            new BufferImageSource({
                resource: new Uint8Array(1 * 2),
                width: 1,
                height: 2,
                // unpackAlignment: 1, // todo: add this?
                // format: FORMATS.RED, // todo: v8 equivalent?
                // type: TYPES.UNSIGNED_BYTE
            })
        );

        renderer.gl.pixelStorei(renderer.gl.UNPACK_ALIGNMENT, 4);
        renderer.texture.bind(texture1);

        expect(renderer.gl.getError()).toBe(renderer.gl.NONE); // <- note: expecting 0 receiving 1282, setup issue?

        const texture2 = new Texture(
            new BufferImageSource({
                resource: new Uint8Array(1 * 2),
                width: 1,
                height: 2,
                // unpackAlignment: 1, // todo: add this?
                // format: FORMATS.RED, // todo: v8 equivalent?
                // type: TYPES.UNSIGNED_BYTE
            })
        );

        renderer.texture.bind(texture2);

        expect(renderer.gl.getError()).not.toBe(renderer.gl.NONE);

        texture1.destroy();
        texture2.destroy();
        renderer.destroy();
    });
});
