import { mixHexColors } from './mixHexColors';

const WHITE_BGR = 0xFFFFFF;

export function mixColors(localBGRColor: number, parentBGRColor: number)
{
    if (localBGRColor === WHITE_BGR || parentBGRColor === WHITE_BGR)
    {
        return localBGRColor + parentBGRColor - WHITE_BGR;
    }

    return mixHexColors(localBGRColor, parentBGRColor, 0.5);
}

export function mixStandardAnd32BitColors(localColorRGB: number, localAlpha: number, parentColor: number)
{
    const parentAlpha = ((parentColor >> 24) & 0xFF) / 255;

    const globalAlpha = ((localAlpha * parentAlpha) * 255);

    // flip rgb to bgr
    const localBGRColor = ((localColorRGB & 0xFF) << 16) + (localColorRGB & 0xFF00) + ((localColorRGB >> 16) & 0xFF);

    const parentBGRColor = parentColor & 0x00FFFFFF;

    let sharedBGRColor: number;

    if (localBGRColor === WHITE_BGR || parentBGRColor === WHITE_BGR)
    {
        sharedBGRColor = localBGRColor + parentBGRColor - WHITE_BGR;
    }
    else
    {
        sharedBGRColor = mixHexColors(localBGRColor, parentBGRColor, 0.5);
    }

    return sharedBGRColor + (globalAlpha << 24);
}

/**
 * Takes two hex colors, multiplies them together and returns the result.
 * @param color1 - the first color to multiply
 * @param color2 - the second color to multiply
 * @returns - the multiplied color
 */
export function multiplyHexColors(color1: number, color2: number): number
{
    const r1 = (color1 >> 16) & 0xFF;
    const g1 = (color1 >> 8) & 0xFF;
    const b1 = color1 & 0xFF;

    const r2 = (color2 >> 16) & 0xFF;
    const g2 = (color2 >> 8) & 0xFF;
    const b2 = color2 & 0xFF;

    const r = r1 * r2;
    const g = g1 * g2;
    const b = b1 * b2;

    return (r << 16) + (g << 8) + b;
}
