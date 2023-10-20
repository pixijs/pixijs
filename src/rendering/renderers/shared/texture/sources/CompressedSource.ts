import { TextureSource } from './TextureSource';

import type { TextureSourceOptions } from './TextureSource';

export class CompressedSource extends TextureSource<Uint8Array[]>
{
    public readonly uploadMethodId = 'compressed';

    constructor(options: TextureSourceOptions)
    {
        super(options);

        this.resource = options.resource;
        this.mipLevelCount = this.resource.length;
    }
}
