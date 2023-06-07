import { generateUID } from '../texture/utils/generateUID';

import type { BindResource } from '../../gpu/shader/BindResource';
import type { Buffer } from './Buffer';

export class BufferResource implements BindResource
{
    readonly uid = generateUID();

    resourceType = 'bufferResource';

    // this really means ths the buffer resource cannot be updated!
    resourceId = this.uid;

    readonly buffer: Buffer;
    readonly offset: number;
    readonly size: number;
    readonly bufferResource = true;

    constructor({ buffer, offset, size }: { buffer: Buffer; offset: number; size: number; })
    {
        this.buffer = buffer;
        this.offset = offset;
        this.size = size;
    }
}
