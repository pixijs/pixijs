/**
 * Copies from one ArrayBuffer to another.
 * Uses Float64Array (8-byte), Float32Array (4-byte), or Uint8Array depending on alignment.
 * @param sourceBuffer - the array buffer to copy from
 * @param destinationBuffer - the array buffer to copy to
 * @param sourceOffset - the byte offset to start copying from (default 0)
 * @param byteLength - the number of bytes to copy (default: min of source available and destination size)
 * @category rendering
 * @advanced
 */
export function fastCopy(
    sourceBuffer: ArrayBuffer,
    destinationBuffer: ArrayBuffer,
    sourceOffset?: number,
    byteLength?: number
): void
{
    sourceOffset ??= 0;
    byteLength ??= Math.min(sourceBuffer.byteLength - sourceOffset, destinationBuffer.byteLength);

    if (!(sourceOffset & 7) && !(byteLength & 7))
    {
        // 8-byte aligned - use Float64Array (8x faster)
        const len = byteLength / 8;

        new Float64Array(destinationBuffer, 0, len).set(new Float64Array(sourceBuffer, sourceOffset, len));
    }
    else if (!(sourceOffset & 3) && !(byteLength & 3))
    {
        // 4-byte aligned - use Float32Array (4x faster)
        const len = byteLength / 4;

        new Float32Array(destinationBuffer, 0, len).set(new Float32Array(sourceBuffer, sourceOffset, len));
    }
    else
    {
        // Fall back to byte-by-byte copy
        new Uint8Array(destinationBuffer).set(new Uint8Array(sourceBuffer, sourceOffset, byteLength));
    }
}
