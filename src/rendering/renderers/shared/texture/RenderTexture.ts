import { TextureSource } from './sources/TextureSource';
import { Texture } from './Texture';

import type { TextureSourceOptions } from './sources/TextureSource';

export class RenderTexture extends Texture
{
    public static create(options: TextureSourceOptions): Texture
    {
        return new Texture({
            source: new TextureSource(options)
        });
    }

    public resize(width: number, height: number, resolution?: number): this
    {
        this.source.resize(width, height, resolution);

        return this;
    }
}
