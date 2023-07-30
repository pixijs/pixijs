import { Container } from '../rendering/scene/Container';
import { TilingSpriteView } from './TilingSpriteView';

import type { PointData } from '../maths/PointData';
import type { PointLike } from '../maths/PointLike';
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

    get anchor(): PointLike
    {
        return this.view.anchor;
    }

    set anchor(value: PointData)
    {
        this.view.anchor.x = value.x;
        this.view.anchor.y = value.y;
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
        return this.view._tileTransform.position;
    }

    set tilePosition(value)
    {
        this.view._tileTransform.position.copyFrom(value);
    }

    get tileScale()
    {
        return this.view._tileTransform.scale;
    }

    set tileScale(value)
    {
        this.view._tileTransform.scale.copyFrom(value);
    }

    set tileRotation(value)
    {
        this.view._tileTransform.rotation = value;
    }

    get tileRotation()
    {
        return this.view._tileTransform.rotation;
    }

    get tileTransform()
    {
        return this.view._tileTransform;
    }
}

