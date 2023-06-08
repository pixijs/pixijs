import { Cache } from '../../../assets/cache/Cache';
import { Texture } from '../../renderers/shared/texture/Texture';
import { Container } from '../../scene/Container';
import { SpriteView } from './SpriteView';

import type { ContainerOptions } from '../../scene/Container';

export interface SpriteOptions extends ContainerOptions<SpriteView>
{
    texture?: Texture;
}

export class Sprite extends Container<SpriteView>
{
    static from(id: Texture | string)
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
    }

    get anchor()
    {
        return this.view.anchor;
    }

    get texture()
    {
        return this.view.texture;
    }

    set texture(value: Texture)
    {
        this.view.texture = value;
    }
}
