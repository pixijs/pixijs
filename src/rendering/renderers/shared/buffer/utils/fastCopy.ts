/**
 * Copies from one buffer to another.
 * This is an optimised function that will use `Float64Array` window.
 * This means it can copy twice as fast!
 * @param sourceBuffer - the array buffer to copy from
 * @param destinationBuffer - the array buffer to copy to
 * @private
 */
export function fastCopy(sourceBuffer: ArrayBuffer, destinationBuffer: ArrayBuffer): void
{
    const lengthDouble = (sourceBuffer.byteLength / 8) | 0;

    const sourceFloat64View = new Float64Array(sourceBuffer, 0, lengthDouble);
    const destinationFloat64View = new Float64Array(destinationBuffer, 0, lengthDouble);

    // Use set for faster copying
    destinationFloat64View.set(sourceFloat64View);

    // copying over the remaining bytes
    const remainingBytes = sourceBuffer.byteLength - (lengthDouble * 8);

    if (remainingBytes > 0)
    {
        const sourceUint8View = new Uint8Array(sourceBuffer, lengthDouble * 8, remainingBytes);
        const destinationUint8View = new Uint8Array(destinationBuffer, lengthDouble * 8, remainingBytes);

        // Direct copy for remaining bytes
        destinationUint8View.set(sourceUint8View);
    }
}
