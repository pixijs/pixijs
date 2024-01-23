export function colorToUniform(rgb: number, alpha: number, out: Float32Array, offset: number)
{
    // TODO replace with Color..
    out[offset++] = ((rgb >> 16) & 0xFF) / 255;
    out[offset++] = ((rgb >> 8) & 0xFF) / 255;
    out[offset++] = (rgb & 0xFF) / 255;
    out[offset++] = alpha;
}

export function color32BitToUniform(abgr: number, out: Float32Array, offset: number)
{
    const alpha = ((abgr >> 24) & 0xFF) / 255;

    out[offset++] = ((abgr & 0xFF) / 255) * alpha;
    out[offset++] = (((abgr >> 8) & 0xFF) / 255) * alpha;
    out[offset++] = (((abgr >> 16) & 0xFF) / 255) * alpha;
    out[offset++] = alpha;
}
