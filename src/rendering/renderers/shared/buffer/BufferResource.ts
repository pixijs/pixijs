import EventEmitter from 'eventemitter3';
import { generateUID } from '../texture/utils/generateUID';

import type { BindResource } from '../../gpu/shader/BindResource';
import type { Buffer } from './Buffer';

export class BufferResource extends EventEmitter<{
    'change': BindResource,
}> implements BindResource
{
    public readonly uid = generateUID();
    public touched = 0;

    public resourceType = 'bufferResource';

    // this really means ths the buffer resource cannot be updated!
    public resourceId = generateUID();

    public buffer: Buffer;
    public readonly offset: number;
    public readonly size: number;
    public readonly bufferResource = true;

    constructor({ buffer, offset, size }: { buffer: Buffer; offset: number; size: number; })
    {
        super();

        this.buffer = buffer;
        this.offset = offset;
        this.size = size;

        this.buffer.on('change', this.onBufferChange, this);
    }

    protected onBufferChange(): void
    {
        this.resourceId = generateUID();

        this.emit('change', this);
    }

    public destroy(destroyBuffer = false): void
    {
        if (destroyBuffer)
        {
            this.buffer.destroy();
        }

        this.buffer = null;
    }
}
