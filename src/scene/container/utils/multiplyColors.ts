import { multiplyHexColors } from './multiplyHexColors';

const WHITE_BGR = 0xFFFFFF;

export function multiplyColors(localBGRColor: number, parentBGRColor: number)
{
    if (localBGRColor === WHITE_BGR)
    {
        return parentBGRColor;
    }

    if (parentBGRColor === WHITE_BGR)
    {
        return localBGRColor;
    }

    return multiplyHexColors(localBGRColor, parentBGRColor);
}
