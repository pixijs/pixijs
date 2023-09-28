import { Container } from '../container/Container';
import { definedProps } from '../container/utils/definedProps';
import { TilingSpriteView } from './TilingSpriteView';

import type { PointData } from '../../maths/point/PointData';
import type { PointLike } from '../../maths/point/PointLike';
import type { ContainerOptions } from '../container/Container';
import type { TilingSpriteViewOptions } from './TilingSpriteView';

export interface TilingSpriteOptions extends TilingSpriteViewOptions, Partial<ContainerOptions<TilingSpriteView>>
{
    anchor?: PointData
    tilePosition?: PointData
    tileScale?: PointData
    tileRotation?: number
}

export class TilingSprite extends Container<TilingSpriteView>
{
    constructor(options?: TilingSpriteOptions)
    {
        const { texture, width, height, applyAnchorToTexture, ...rest } = options ?? {};

        super({
            view: new TilingSpriteView(definedProps({
                texture,
                width,
                height,
                applyAnchorToTexture,
            })),
            label: 'TilingSprite',
            ...rest
        });

        this.allowChildren = false;
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

    set tilePosition(value: PointData)
    {
        this.view._tileTransform.position.copyFrom(value);
    }

    get tileScale()
    {
        return this.view._tileTransform.scale;
    }

    set tileScale(value: PointData)
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

