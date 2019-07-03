import { TYPES } from '@pixi/constants';

/**
 * Returns the size of any type in the `TYPES` enum.
 *
 * @param {number} glint - TYPES enum constant
 * @return size of `glint` in bytes
 */
export function sizeOfType(glint)
{
    switch (glint)
    {
        case TYPES.FLOAT:
            return 4;
        case TYPES.HALF_FLOAT:
        case TYPES.UNSIGNED_SHORT_5_5_5_1:
        case TYPES.UNSIGNED_SHORT_4_4_4_4:
        case TYPES.UNSIGNED_SHORT_5_6_5:
        case TYPES.UNSIGNED_SHORT:
            return 2;
        case TYPES.UNSIGNED_BYTE:
            return 1;
        default:
            throw new Error(`{$glint} isn't a TYPES enum!`);
    }
}
