import { TextureSource } from './TextureSource';

import type { TextureSourceOptions } from './TextureSource';

/**
 * A texture source that uses a compressed resource, such as an array of Uint8Arrays.
 * It is used for compressed textures that can be uploaded to the GPU.
 *
 * Each entry of `resource` is one mip level. `format` describes the bytes of every level, and every renderer
 * reads them that way: `bgra8unorm` levels hold B, G, R, A bytes. Without a `format`, the levels are read as
 * `rgba8unorm`, R, G, B, A bytes.
 * @category rendering
 * @advanced
 */
export class CompressedSource extends TextureSource<Uint8Array[]>
{
    public readonly uploadMethodId = 'compressed';

    constructor(options: TextureSourceOptions)
    {
        super({
            ...options,
            format: options.format ?? 'rgba8unorm',
            mipLevelCount: options.resource.length,
        });
    }
}
