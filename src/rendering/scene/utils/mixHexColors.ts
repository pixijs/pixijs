export function mixHexColors(color1: number, color2: number, ratio: number): number
{
    const r1 = (color1 >> 16) & 0xFF;
    const g1 = (color1 >> 8) & 0xFF;
    const b1 = color1 & 0xFF;

    const r2 = (color2 >> 16) & 0xFF;
    const g2 = (color2 >> 8) & 0xFF;
    const b2 = color2 & 0xFF;

    const r = r1 + ((r2 - r1) * ratio);
    const g = g1 + ((g2 - g1) * ratio);
    const b = b1 + ((b2 - b1) * ratio);

    return (r << 16) + (g << 8) + b;
}

