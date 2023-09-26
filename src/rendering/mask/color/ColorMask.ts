import { ExtensionType } from '../../../extensions/Extensions';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Effect } from '../../../scene/container/Effect';
import type { PoolItem } from '../../../utils/pool/Pool';

export class ColorMask implements Effect, PoolItem
{
    public static extension: ExtensionMetadata = ExtensionType.MaskEffect;

    public priority = 0;
    public mask: number;
    public pipe = 'colorMask';

    constructor(options: {mask: number})
    {
        if (options?.mask)
        {
            this.init(options.mask);
        }
    }

    public init(mask: number): void
    {
        this.mask = mask;
    }

    public destroy(): void
    {
        // nothing to destroy
    }

    public static test(mask: any): boolean
    {
        return typeof mask === 'number';
    }
}
