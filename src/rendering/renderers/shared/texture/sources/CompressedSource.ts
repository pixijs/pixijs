import { TextureSource } from './TextureSource';

import type { TextureSourceOptions } from './TextureSource';

const typeSymbol = Symbol.for('pixijs.CompressedSource');

/**
 * A texture source that uses a compressed resource, such as an array of Uint8Arrays.
 * It is used for compressed textures that can be uploaded to the GPU.
 * @category rendering
 * @advanced
 */
export class CompressedSource extends TextureSource<Uint8Array[]>
{
    /**
     * Type symbol used to identify instances of CompressedSource.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a CompressedSource.
     * @param obj - The object to check.
     * @returns True if the object is a CompressedSource, false otherwise.
     */
    public static isCompressedSource(obj: any): obj is CompressedSource
    {
        return !!obj && !!obj[typeSymbol];
    }

    public readonly uploadMethodId = 'compressed';

    constructor(options: TextureSourceOptions)
    {
        super(options);

        this.resource = options.resource;
        this.mipLevelCount = this.resource.length;
    }
}
