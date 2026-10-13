import type { TEXTURE_FORMATS } from '../const';

/**
 * Whether a texture format holds integer texels (`*uint` / `*sint`)
 * @param format - The texture format to check.
 * @returns True for integer formats.
 * @internal
 */
export function isIntegerFormat(format: TEXTURE_FORMATS): boolean
{
    return format.endsWith('int');
}
