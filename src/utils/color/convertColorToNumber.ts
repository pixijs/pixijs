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
        else if (color[0] === '#')
        {
            // parse 3 digit hex color

            if (color.length === 4)
            {
                const r = parseInt(color[1] + color[1], 16);
                const g = parseInt(color[2] + color[2], 16);
                const b = parseInt(color[3] + color[3], 16);

                return (r << 16) + (g << 8) + b;
            }

            return parseInt(color.substring(1), 16);
        }

        console.warn(`[pixi.js] Invalid color: ${color}`);
    }

    return 0;
}
