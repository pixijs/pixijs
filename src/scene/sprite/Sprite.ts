import { Cache } from '../../assets/cache/Cache';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { Container } from '../container/Container';
import { SpriteView } from './SpriteView';

import type { PointData } from '../../maths/point/PointData';
import type { PointLike } from '../../maths/point/PointLike';
import type { ContainerOptions } from '../container/Container';

export interface SpriteOptions extends ContainerOptions<SpriteView>
{
    texture?: Texture;
}

export class Sprite extends Container<SpriteView>
{
    public static from(id: Texture | string)
    {
        if (typeof id === 'string')
        {
            return new Sprite(Cache.get(id));
        }

        return new Sprite(id);
    }

    constructor(options: SpriteOptions | Texture = Texture.EMPTY)
    {
        if (options instanceof Texture)
        {
            options = { texture: options };
        }

        options.texture ??= Texture.EMPTY;

        super({
            view: new SpriteView(options.texture),
            label: 'Sprite',
            ...options
        });

        this.allowChildren = false;
    }

    get anchor(): PointLike
    {
        return this.view.anchor;
    }

    set anchor(value: PointData)
    {
        this.view.anchor.x = value.x;
        this.view.anchor.y = value.y;
    }

    get texture()
    {
        return this.view.texture;
    }

    set texture(value: Texture)
    {
        this.view.texture = value;
    }

    get roundPixels()
    {
        return !!this.view.roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this.view.roundPixels = value ? 1 : 0;
    }
}

