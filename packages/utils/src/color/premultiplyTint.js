/**
 * premultiplies tint
 *
 * @param {number} tint integet RGB
 * @param {number} alpha floating point alpha (0.0-1.0)
 * @returns {number} tint multiplied by alpha
 */
export function premultiplyTint(tint, alpha)
{
    if (alpha === 1.0)
    {
        return (alpha * 255 << 24) + tint;
    }
    if (alpha === 0.0)
    {
        return 0;
    }
    let R = ((tint >> 16) & 0xFF);
    let G = ((tint >> 8) & 0xFF);
    let B = (tint & 0xFF);

    R = ((R * alpha) + 0.5) | 0;
    G = ((G * alpha) + 0.5) | 0;
    B = ((B * alpha) + 0.5) | 0;

    return (alpha * 255 << 24) + (R << 16) + (G << 8) + B;
}
