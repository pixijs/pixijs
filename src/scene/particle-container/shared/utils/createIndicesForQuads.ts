/**
 * Generic Mask Stack data structure
 * @function createIndicesForQuads
 * @param {number} size - Number of quads
 * @param {Uint16Array|Uint32Array} [outBuffer] - Buffer for output, length has to be `6 * size`
 * @returns {Uint16Array|Uint32Array} - Resulting index buffer
 * @internal
 */
export function createIndicesForQuads(
    size: number,
    outBuffer: Uint16Array | Uint32Array | null = null
): Uint16Array | Uint32Array
{
    // the total number of indices in our array, there are 6 points per quad.
    const totalIndices = size * 6;

    // Check if we need to use Uint32Array
    if (totalIndices > 65535)
    {
        outBuffer ||= new Uint32Array(totalIndices); // Use Uint32Array if needed
    }
    else
    {
        outBuffer ||= new Uint16Array(totalIndices);
    }

    if (outBuffer.length !== totalIndices)
    {
        throw new Error(`Out buffer length is incorrect, got ${outBuffer.length} and expected ${totalIndices}`);
    }

    // fill the indices with the quads to draw
    for (let i = 0, j = 0; i < totalIndices; i += 6, j += 4)
    {
        outBuffer[i + 0] = j + 0;
        outBuffer[i + 1] = j + 1;
        outBuffer[i + 2] = j + 2;
        outBuffer[i + 3] = j + 0;
        outBuffer[i + 4] = j + 2;
        outBuffer[i + 5] = j + 3;
    }

    return outBuffer;
}
