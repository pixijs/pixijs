import { ExtensionType } from '../../../extensions/Extensions';
import { Container } from '../../scene/Container';
import { addMaskBounds } from './addMaskBounds';
import { addMaskLocalBounds } from './addMaskLocalBounds';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { PointData } from '../../../maths/PointData';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { Bounds } from '../../scene/bounds/Bounds';
import type { Effect } from '../../scene/Effect';

export class StencilMask implements Effect, PoolItem
{
    static extension: ExtensionMetadata = ExtensionType.MaskEffect;

    priority = 0;
    mask: Container;
    pipe = 'stencilMask';

    constructor(options: {mask: Container})
    {
        if (options?.mask)
        {
            this.init(options.mask);
        }
    }

    init(mask: Container): void
    {
        this.mask = mask;
        this.mask.includeInBuild = false;
        this.mask.measurable = false;
    }

    reset()
    {
        this.mask.measurable = true;
        this.mask.includeInBuild = true;
        this.mask = null;
    }

    addBounds(bounds: Bounds, skipUpdateTransform: boolean): void
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

        if (mask.view?.containsPoint)
        {
            return mask.view.containsPoint(point);
        }

        return false;
    }

    destroy(): void
    {
        this.reset();
    }

    static test(mask: any): boolean
    {
        return mask instanceof Container;
    }
}
