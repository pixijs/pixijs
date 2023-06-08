import { Container } from '../rendering/scene/Container';
import { TilingSpriteView } from './TilingSpriteView';

import type { ContainerOptions } from '../rendering/scene/Container';
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
}

