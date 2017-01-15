export default function getBufferType(array)
{
    if (array.BYTES_PER_ELEMENT === 4)
    {
        if (array instanceof Float32Array)
        {
            return 'Float32Array';
        }
        else if (array instanceof Uint32Array)
        {
            return 'Uint32Array';
        }

        return 'Int32Array';
    }
    else if (array.BYTES_PER_ELEMENT === 2)
    {
        if (array instanceof Uint16Array)
        {
            return 'Uint16Array';
        }
    }

    // TODO map out the rest of the array elements!
    return null;
}
