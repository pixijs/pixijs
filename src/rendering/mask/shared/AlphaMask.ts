import { ExtensionType } from '../../../extensions/Extensions';
import { Sprite } from '../../sprite/shared/Sprite';
import { addMaskBounds } from './addMaskBounds';
import { addMaskLocalBounds } from './addMaskLocalBounds';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { PointData } from '../../../maths/PointData';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { Bounds } from '../../scene/bounds/Bounds';
import type { Container } from '../../scene/Container';
import type { Effect } from '../../scene/Effect';

export class AlphaMask implements Effect, PoolItem
{
    static extension: ExtensionMetadata = ExtensionType.MaskEffect;

    priority = 0;
    mask: Container;
    pipe = 'alphaMask';
    renderMaskToTexture: boolean;

    constructor(options?: {mask: Container})
    {
        if (options?.mask)
        {
            this.init(options.mask);
        }
    }

    init(mask: Container): void
    {
        this.mask = mask;

        // TODO - might want to change this to adjust on the fly
        // user may add children to the sprite..
        this.renderMaskToTexture = !(mask instanceof Sprite);

        this.mask.renderable = this.renderMaskToTexture;
        this.mask.includeInBuild = !this.renderMaskToTexture;

        this.mask.measurable = false;
    }

    reset()
    {
        this.mask.measurable = true;
        this.mask = null;
    }

    addBounds(bounds: Bounds, skipUpdateTransform?: boolean): void
    {
        addMaskBounds(this.mask, bounds, skipUpdateTransform);
    }

    addLocalBounds(bounds: Bounds, localRoot: Container): void
    {
        addMaskLocalBounds(this.mask, bounds, localRoot);
    }

    containsPoint(point: PointData): boolean
    {
        const mask = this.mask as any;

        if (mask.containsPoint)
        {
            return mask.containsPoint(point);
        }

        return false;
    }

    static test(mask: any): boolean
    {
        return mask instanceof Sprite;
    }
}
