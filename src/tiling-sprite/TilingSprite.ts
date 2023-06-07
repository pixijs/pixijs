import { Container } from '../rendering/scene/Container';
import { TilingSpriteView } from './TilingSpriteView';

import type { ContainerOptions } from '../rendering/scene/Container';
import type { DestroyOptions } from '../rendering/scene/destroyTypes';
import type { TilingSpriteViewOptions } from './TilingSpriteView';

export type TilingSpriteOptions = TilingSpriteViewOptions & ContainerOptions<TilingSpriteView>;

export class TilingSprite extends Container<TilingSpriteView>
{
    constructor(options?: TilingSpriteOptions)
    {
        super({
            view: new TilingSpriteView(options),
            label: 'TilingSprite',
            ...options
        });
    }

    set texture(value)
    {
        this.view.texture = value;
    }

    get texture()
    {
        return this.view.texture;
    }

    get anchor()
    {
        return this.view.anchor;
    }

    get width(): number
    {
        return this.view.width;
    }

    set width(value: number)
    {
        this.view.width = value;
    }

    get height(): number
    {
        return this.view.height;
    }

    set height(value: number)
    {
        this.view.height = value;
    }

    get tilePosition()
    {
        return this.view.tileTransform.position;
    }

    set tilePosition(value)
    {
        this.view.tileTransform.position.copyFrom(value);
    }

    get tileScale()
    {
        return this.view.tileTransform.scale;
    }

    set tileScale(value)
    {
        this.view.tileTransform.scale.copyFrom(value);
    }

    set tileRotation(value)
    {
        this.view.tileTransform.rotation = value;
    }

    get tileRotation()
    {
        return this.view.tileTransform.rotation;
    }

    get tileTransform()
    {
        return this.view.tileTransform;
    }

    /**
     * Destroys this sprite and optionally its texture and children.
     * Do not use a TilingSprite after calling `destroy`.
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

