import { ExtensionType } from '../../../extensions/Extensions';
import { Sprite } from '../../../scene/sprite/Sprite';
import { addMaskBounds } from '../utils/addMaskBounds';
import { addMaskLocalBounds } from '../utils/addMaskLocalBounds';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Point } from '../../../maths/point/Point';
import type { Bounds } from '../../../scene/container/bounds/Bounds';
import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { PoolItem } from '../../../utils/pool/Pool';

export class AlphaMask implements Effect, PoolItem
{
    public static extension: ExtensionMetadata = ExtensionType.MaskEffect;

    public priority = 0;
    public mask: Container;
    public inverse: boolean = false;
    public pipe = 'alphaMask';
    public renderMaskToTexture: boolean;

    constructor(options?: {mask: Container})
    {
        if (options?.mask)
        {
            this.init(options.mask);
        }
    }

    public init(mask: Container): void
    {
        this.mask = mask;

        // TODO - might want to change this to adjust on the fly
        // user may add children to the sprite..
        this.renderMaskToTexture = !(mask instanceof Sprite);

        this.mask.renderable = this.renderMaskToTexture;
        this.mask.includeInBuild = !this.renderMaskToTexture;

        this.mask.measurable = false;
    }

    public reset()
    {
        this.mask.measurable = true;
        this.mask = null;
    }

    public addBounds(bounds: Bounds, skipUpdateTransform?: boolean): void
    {
        if (!this.inverse)
        {
            addMaskBounds(this.mask, bounds, skipUpdateTransform);
        }
    }

    public addLocalBounds(bounds: Bounds, localRoot: Container): void
    {
        addMaskLocalBounds(this.mask, bounds, localRoot);
    }

    public containsPoint(point: Point, hitTestFn: (container: Container, point: Point) => boolean): boolean
    {
        const mask = this.mask as any;

        // if the point is in the mask, yay!
        return hitTestFn(mask, point);
    }

    public destroy(): void
    {
        this.reset();
    }

    public static test(mask: any): boolean
    {
        return mask instanceof Sprite;
    }
}
