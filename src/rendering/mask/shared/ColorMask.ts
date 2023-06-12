import { ExtensionType } from '../../../extensions/Extensions';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { Effect } from '../../scene/Effect';

export class ColorMask implements Effect, PoolItem
{
    static extension: ExtensionMetadata = ExtensionType.MaskEffect;

    priority = 0;
    mask: number;
    pipe = 'colorMask';

    constructor(options: {mask: number})
    {
        if (options?.mask)
        {
            this.init(options.mask);
        }
    }

    init(mask: number): void
    {
        this.mask = mask;
    }

    destroy(): void
    {
        // nothing to destroy
    }

    static test(mask: any): boolean
    {
        return typeof mask === 'number';
    }
}
