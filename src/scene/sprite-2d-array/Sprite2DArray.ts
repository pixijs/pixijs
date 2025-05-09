import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { Sprite } from '../sprite/Sprite';

import type { TextureSourceLike } from '../../rendering/renderers/shared/texture/Texture';
import type { SpriteOptions } from '../sprite/Sprite';

export interface Sprite2DArrayOptions extends SpriteOptions
{
    layerId?: number;
}

export class Sprite2DArray extends Sprite
{
    public static from(source: Texture | TextureSourceLike, skipCache = false): Sprite2DArray
    {
        if (source instanceof Texture)
        {
            return new Sprite2DArray(source);
        }

        return new Sprite2DArray(Texture.from(source, skipCache));
    }

    public override readonly renderPipeId: string = 'sprite2darray';

    public _layerId: number;

    constructor(options: Sprite2DArrayOptions | Texture = Texture.EMPTY)
    {
        if (options instanceof Texture)
        {
            options = { texture: options };
        }

        // split out
        const { layerId, ...rest } = options;

        super({
            label: 'Sprite2dArray',
            ...rest
        });

        this._layerId = layerId ?? 0;
    }
}
