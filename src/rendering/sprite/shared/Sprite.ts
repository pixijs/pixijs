import { Cache } from '../../../assets/cache/Cache';
import { Texture } from '../../renderers/shared/texture/Texture';
import { Container } from '../../scene/Container';
import { SpriteView } from './SpriteView';

import type { ContainerOptions } from '../../scene/Container';
import type { DestroyOptions } from '../../scene/destroyTypes';

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

    /**
     * Destroys this sprite and optionally its texture and children.
     * Do not use a Sprite after calling `destroy`.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *  method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the sprite as well
     * @param {boolean} [options.context=false] - Only used for children with graphicsContexts e.g. Graphics.
     * If options.children is set to true it should destroy the context of the child graphics
     */
    public destroy(options: DestroyOptions = false): void
    {
        super.destroy(options);

        this.view.destroy(options);
    }
}
