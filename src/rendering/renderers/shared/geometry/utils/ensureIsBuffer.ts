import { Buffer } from '../../buffer/Buffer';
import { BufferUsage } from '../../buffer/const';

import type { TypedArray } from '../../buffer/Buffer';

/**
 * Converts something into a buffer. If it is already a buffer it will pass it through
 * if it is a number array it will convert it to a float32 array before being passed into a buffer
 * the buffer will be created with the correct usage flags for geometry attributes
 * @param buffer - number array
 * @param index - is this an index buffer?
 * @returns a buffer
 * @memberof rendering
 */
export function ensureIsBuffer(buffer: Buffer | TypedArray | number[], index: boolean): Buffer
{
    if (!(buffer instanceof Buffer))
    {
        let usage: number = index ? BufferUsage.INDEX : BufferUsage.VERTEX;

        // its an array!
        if (buffer instanceof Array)
        {
            if (index)
            {
                buffer = new Uint32Array(buffer);
                usage = BufferUsage.INDEX | BufferUsage.COPY_DST;
            }

            else
            {
                buffer = new Float32Array(buffer);
                usage = BufferUsage.VERTEX | BufferUsage.COPY_DST;
            }
        }

        buffer = new Buffer({
            data: buffer,
            label: index ? 'index-mesh-buffer' : 'vertex-mesh-buffer',
            usage
        });
    }

    return buffer;
}
