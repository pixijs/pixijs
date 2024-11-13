export function multiplyHexColors(color1: number, color2: number): number
{
    if (color1 === 0xFFFFFF || !color2) return color2;
    if (color2 === 0xFFFFFF || !color1) return color1;

    const r1 = (color1 >> 16) & 0xFF;
    const g1 = (color1 >> 8) & 0xFF;
    const b1 = color1 & 0xFF;

    const r2 = (color2 >> 16) & 0xFF;
    const g2 = (color2 >> 8) & 0xFF;
    const b2 = color2 & 0xFF;

    const r = ((r1 * r2) / 255) | 0;
    const g = ((g1 * g2) / 255) | 0;
    const b = ((b1 * b2) / 255) | 0;

    return (r << 16) + (g << 8) + b;
}
