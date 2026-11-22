import type { TEXTURE_FORMATS } from '../../../shared/texture/const';

/**
 * The largest swap that goes into the shared buffer. That buffer grows to the biggest such swap and is reused, so a
 * small texture updated every frame allocates only a few typed-array views per upload. A bigger swap goes into the
 * caller's buffer, or into a new one that GC reclaims, so one large upload doesn't hold its size for the life of the
 * app.
 * @internal
 */
export const MAX_SHARED_SWAP_BYTES = 1024 * 1024;

let scratch = new ArrayBuffer(0);

/**
 * Whether a format stores its texels as B, G, R, A bytes, which WebGL can't upload as they are
 * @param format - the texture format
 * @internal
 */
export function isBgraFormat(format: TEXTURE_FORMATS): boolean
{
    return format === 'bgra8unorm' || format === 'bgra8unorm-srgb';
}

/**
 * Returns a copy of BGRA texels with red and blue swapped, for WebGL, which only uploads RGBA
 *
 * Up to 1 MiB, the copy is a view of the shared buffer, which the next call overwrites. Above that it is a view of
 * `destination` when that holds enough bytes, or of a new buffer. Pass it straight to `texImage2D`, `texSubImage2D`,
 * `texImage3D` or `texSubImage3D`, which copy it before returning.
 * @param texels - 4-byte BGRA texels
 * @param destination - the buffer to swap texels over 1 MiB into, such as one a texture keeps for its updates
 * @returns the texels as R, G, B, A bytes
 * @internal
 */
export function bgraToRgba(texels: ArrayBufferView | ArrayBuffer, destination?: ArrayBuffer | null): Uint8Array
{
    const bytes = ArrayBuffer.isView(texels)
        ? new Uint8Array(texels.buffer, texels.byteOffset, texels.byteLength)
        : new Uint8Array(texels);
    const byteLength = bytes.byteLength;
    let buffer: ArrayBuffer;

    if (byteLength > MAX_SHARED_SWAP_BYTES)
    {
        buffer = destination && destination.byteLength >= byteLength ? destination : new ArrayBuffer(byteLength);
    }
    else
    {
        if (scratch.byteLength < byteLength) scratch = new ArrayBuffer(byteLength);

        buffer = scratch;
    }

    const rgba = new Uint8Array(buffer, 0, byteLength);
    const texelCount = byteLength >> 2;
    const rgbaTexels = new Uint32Array(buffer, 0, texelCount);
    let bgraTexels: Uint32Array = rgbaTexels;

    // a Uint32Array can't start at an unaligned offset, so unaligned texels are copied first and swapped in place
    if ((bytes.byteOffset & 3) === 0)
    {
        bgraTexels = new Uint32Array(bytes.buffer, bytes.byteOffset, texelCount);
    }
    else
    {
        rgba.set(bytes);
    }

    for (let i = 0; i < texelCount; i++)
    {
        const texel = bgraTexels[i];

        // little-endian, like every platform WebGL runs on: blue is the low byte and red the third
        rgbaTexels[i] = (texel & 0xff00ff00) | ((texel >>> 16) & 0xff) | ((texel & 0xff) << 16);
    }

    // bytes past the last whole texel are copied as they are
    for (let i = texelCount * 4; i < byteLength; i++)
    {
        rgba[i] = bytes[i];
    }

    return rgba;
}
