import { mixHexColors } from './mixHexColors';

const WHITE_WHITE = 0xFFFFFF + (0xFFFFFF << 32);

export function mixColors(localColor: number, parentColor: number)
{
    const localAlpha = ((localColor >> 24) & 0xFF) / 255;
    const parentAlpha = ((parentColor >> 24) & 0xFF) / 255;

    const globalAlpha = ((localAlpha * parentAlpha) * 255);

    const localBGRColor = localColor & 0x00FFFFFF;
    const parentBGRColor = parentColor & 0x00FFFFFF;

    let sharedBGRColor = 0xFFFFFF;

    if (localBGRColor + (parentBGRColor << 32) !== WHITE_WHITE)
    {
        // color has changed!
        if (localBGRColor === 0xFFFFFF)
        {
            sharedBGRColor = parentBGRColor;
        }
        else if (parentBGRColor === 0xFFFFFF)
        {
            sharedBGRColor = localBGRColor;
        }

        else
        {
            sharedBGRColor = mixHexColors(localBGRColor, parentBGRColor, 0.5);
        }
    }

    return sharedBGRColor + (globalAlpha << 24);
}

export function mixStandardAnd32BitColors(localColorRGB: number, localAlpha: number, parentColor: number)
{
    const parentAlpha = ((parentColor >> 24) & 0xFF) / 255;

    const globalAlpha = ((localAlpha * parentAlpha) * 255);

    // flip rgb to bgr
    const localBGRColor = ((localColorRGB & 0xFF) << 16) + (localColorRGB & 0xFF00) + ((localColorRGB >> 16) & 0xFF);

    const parentBGRColor = parentColor & 0x00FFFFFF;

    let sharedBGRColor = 0xFFFFFF;

    if (localBGRColor + (parentBGRColor << 32) !== WHITE_WHITE)
    {
        // color has changed!
        if (localBGRColor === 0xFFFFFF)
        {
            sharedBGRColor = parentBGRColor;
        }
        else if (parentBGRColor === 0xFFFFFF)
        {
            sharedBGRColor = localBGRColor;
        }

        else
        {
            sharedBGRColor = mixHexColors(localBGRColor, parentBGRColor, 0.5);
        }
    }

    return sharedBGRColor + (globalAlpha << 24);
}

