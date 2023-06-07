export function fastCopy(sourceBuffer: ArrayBuffer, destinationBuffer: ArrayBuffer): void
{
    const lengthDouble = (sourceBuffer.byteLength / 8) | 0;

    const sourceFloat64View = new Float64Array(sourceBuffer, 0, lengthDouble);
    const destinationFloat64View = new Float64Array(destinationBuffer, 0, lengthDouble);

    for (let i = 0; i < lengthDouble; i++)
    {
        destinationFloat64View[i] = sourceFloat64View[i];
    }

    // copying over the remaining bytes
    const sourceUint8View = new Uint8Array(sourceBuffer, lengthDouble * 8);
    const destinationUint8View = new Uint8Array(destinationBuffer, lengthDouble * 8);

    for (let i = 0; i < sourceUint8View.length; i++)
    {
        destinationUint8View[i] = sourceUint8View[i];
    }
}
