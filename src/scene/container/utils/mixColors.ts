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
