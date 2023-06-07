import { Runner } from '../runner/Runner';
import { ensureIsBuffer } from './utils/ensureIsBuffer';

import type { Buffer, TypedArray } from '../buffer/Buffer';
import type { Topology, VertexFormat } from './const';

export interface Attribute
{
    buffer: Buffer;
    stride: number;
    offset: number;
    format: VertexFormat;
    instance?: boolean;
    shaderLocation: number; // TODO - auto assign this move this?? introspection??
    size?: number;
    type?: number;
    start?: number;
}

type AttributesOption = Omit<Attribute, 'buffer'> & { buffer: Buffer | TypedArray | number[]};

export interface GeometryDescriptor
{
    label?: string;
    attributes: Record<string, AttributesOption>;
    indexBuffer?: Buffer | TypedArray | number[];
    topology?: Topology;
}

let UID = 1;

export class Geometry
{
    topology: Topology;

    uid: number = UID++;
    attributes: Record<string, Attribute>;
    buffers: Buffer[];
    indexBuffer: Buffer;

    _layoutKey = 0;
    _bufferLayout: Record<number, Buffer>;

    onUpdate = new Runner('onGeometryUpdate');
    tick = 0;

    instanced: boolean;
    instanceCount: number;

    constructor({ attributes, indexBuffer, topology }: GeometryDescriptor)
    {
        this.attributes = attributes as Record<string, Attribute>;
        this.buffers = [];

        for (const i in attributes)
        {
            const attribute = attributes[i];

            attribute.buffer = ensureIsBuffer(attribute.buffer, false);

            const bufferIndex = this.buffers.indexOf(attribute.buffer);

            if (bufferIndex === -1)
            {
                this.buffers.push(attribute.buffer);

                attribute.buffer.onUpdate.add(this);
            }
        }

        this.indexBuffer = ensureIsBuffer(indexBuffer, true);

        this.buffers.push(this.indexBuffer);

        this.topology = topology || 'triangle-list';
    }

    setBufferAtIndex(buffer: Buffer, index: number): void
    {
        const previousBuffer = this.buffers[index];

        previousBuffer.onUpdate.remove(this);
        buffer.onUpdate.add(this);

        this.buffers[index] = buffer;

        for (const i in this.attributes)
        {
            const attribute = this.attributes[i];

            if (attribute.buffer === previousBuffer)
            {
                attribute.buffer = buffer;
            }
        }
    }

    onBufferUpdate(): void
    {
        this.tick = this.tick++;
        this.onUpdate.emit(this);
    }

    /**
     * Returns the requested attribute.
     * @param id - The name of the attribute required
     * @returns - The attribute requested.
     */
    getAttribute(id: string): Attribute
    {
        return this.attributes[id];
    }

    /**
     * Returns the index buffer
     * @returns - The index buffer.
     */
    getIndex(): Buffer
    {
        return this.indexBuffer;
    }

    /**
     * Returns the requested buffer.
     * @param id - The name of the buffer required.
     * @returns - The buffer requested.
     */
    getBuffer(id: string): Buffer
    {
        return this.getAttribute(id).buffer;
    }

    getSize(): number
    {
        for (const i in this.attributes)
        {
            const attribute = this.attributes[i];
            const buffer = this.getBuffer(i);

            // TODO use SIZE again like v7..
            return (buffer.data as any).length / ((attribute.stride / 4) || attribute.size);
        }

        return 0;
    }
}

