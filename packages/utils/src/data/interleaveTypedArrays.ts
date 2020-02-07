import { getBufferType } from './getBufferType';

/* eslint-disable object-shorthand */
const map = { Float32Array: Float32Array, Uint32Array: Uint32Array, Int32Array: Int32Array, Uint8Array: Uint8Array };

type PackedArray = Float32Array|Uint32Array|Int32Array|Uint8Array;

export function interleaveTypedArrays(arrays: PackedArray[], sizes: number[]): Float32Array
{
    let outSize = 0;
    let stride = 0;
    const views: {[key: string]: PackedArray} = {};

    for (let i = 0; i < arrays.length; i++)
    {
        stride += sizes[i];
        outSize += arrays[i].length;
    }

    const buffer = new ArrayBuffer(outSize * 4);

    let out = null;
    let littleOffset = 0;

    for (let i = 0; i < arrays.length; i++)
    {
        const size = sizes[i];
        const array = arrays[i];

        /*
        @todo This is unsafe casting but consistent with how the code worked previously. Should it stay this way
              or should and `getBufferTypeUnsafe` function be exposed that throws an Error if unsupported type is passed?
         */
        const type = getBufferType(array) as keyof typeof map;

        if (!views[type])
        {
            views[type] = new map[type](buffer);
        }

        out = views[type];

        for (let j = 0; j < array.length; j++)
        {
            const indexStart = ((j / size | 0) * stride) + littleOffset;
            const index = j % size;

            out[indexStart + index] = array[j];
        }

        littleOffset += size;
    }

    return new Float32Array(buffer);
}
