export function unpremultiplyAlpha(pixels: Uint8Array | Uint8ClampedArray): void
{
    if (pixels instanceof Uint8ClampedArray)
    {
        pixels = new Uint8Array(pixels.buffer);
    }

    const n = pixels.length;

    for (let i = 0; i < n; i += 4)
    {
        const alpha = pixels[i + 3];

        if (alpha !== 0)
        {
            const a = 255.001 / alpha;

            pixels[i] = (pixels[i] * a) + 0.5;
            pixels[i + 1] = (pixels[i + 1] * a) + 0.5;
            pixels[i + 2] = (pixels[i + 2] * a) + 0.5;
        }
    }
}
