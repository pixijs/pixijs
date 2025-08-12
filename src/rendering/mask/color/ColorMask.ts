import { ExtensionType } from '../../../extensions/Extensions';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Effect } from '../../../scene/container/Effect';
import type { PoolItem } from '../../../utils/pool/Pool';

const typeSymbol = Symbol.for('pixijs.ColorMask');

/**
 * The ColorMask effect allows you to apply a color mask to the rendering process.
 * This can be useful for selectively rendering certain colors or for creating
 * effects based on color values.
 * @category rendering
 * @advanced
 */
export class ColorMask implements Effect, PoolItem
{
    /**
     * Type symbol used to identify instances of ColorMask.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a ColorMask.
     * @param obj - The object to check.
     * @returns True if the object is a ColorMask, false otherwise.
     */
    public static isColorMask(obj: any): obj is ColorMask
    {
        return !!obj && !!obj[typeSymbol];
    }

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
