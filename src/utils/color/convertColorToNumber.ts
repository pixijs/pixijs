import { warn } from '../logging/warn';
import { ColorNames } from './ColorNames';

export function convertColorToNumber(color: string | number): number
{
    if (typeof color === 'number')
    {
        return color;
    }

    if (typeof color === 'string')
    {
        if (ColorNames[color as keyof typeof ColorNames] !== undefined)
        {
            return ColorNames[color as keyof typeof ColorNames];
        }

        let offset = 0;

        if (color[0] === '#')offset++;

        // parse 3 digit hex color

        if (color.length === 4)
        {
            const r = parseInt(color[offset] + color[offset], 16);
            const g = parseInt(color[offset + 1] + color[offset + 1], 16);
            const b = parseInt(color[offset + 2] + color[offset + 2], 16);

            return (r << 16) + (g << 8) + b;
        }

        return parseInt(color.substring(offset), 16);

        // #if _DEBUG
        warn(`Invalid color: ${color}`);
        // #endif
    }

    return 0;
}
