import { Attribute } from './Attribute';
import { Buffer } from './Buffer';
import { interleaveTypedArrays } from './utils/interleaveTypedArrays';
import { getBufferType } from '@pixi/utils';
import { Runner } from '@pixi/runner';

import type { TYPES } from '@pixi/constants';
import { BUFFER_TYPE } from '@pixi/constants';
import type { IArrayBuffer } from './Buffer';
import type { Dict } from '@pixi/utils';

const byteSizeMap: {[key: number]: number} = { 5126: 4, 5123: 2, 5121: 1 };
let UID = 0;

/* eslint-disable object-shorthand */
const map: Dict<any> = {
    Float32Array: Float32Array,
    Uint32Array: Uint32Array,
    Int32Array: Int32Array,
    Uint8Array: Uint8Array,
    Uint16Array: Uint16Array,
};

/* eslint-disable max-len */

/**
 * The Geometry represents a model. It consists of two components:
 * - GeometryStyle - The structure of the model such as the attributes layout
 * - GeometryData - the data of the model - this consists of buffers.
 * This can include anything from positions, uvs, normals, colors etc.
 *
 * Geometry can be defined without passing in a style or data if required (thats how I prefer!)
 * @example
 * import { Geometry } from 'pixi.js';
 *
 * const geometry = new Geometry();
 *
 * geometry.addAttribute('positions', [0, 0, 100, 0, 100, 100, 0, 100], 2);
 * geometry.addAttribute('uvs', [0, 0, 1, 0, 1, 1, 0, 1], 2);
 * geometry.addIndex([0, 1, 2, 1, 3, 2]);
 * @memberof PIXI
 */
export class Geometry
{
    public buffers: Array<Buffer>;
    public indexBuffer: Buffer;
    public attributes: {[key: string]: Attribute};
    public id: number;

    /** Whether the geometry is instanced. */
    public instanced: boolean;

    /**
     * Number of instances in this geometry, pass it to `GeometrySystem.draw()`.
     * @default 1
     */
    public instanceCount: number;

    /**
     * A map of renderer IDs to webgl VAOs
     * @type {object}
     */
    glVertexArrayObjects: {[key: number]: {[key: string]: WebGLVertexArrayObject}};
    disposeRunner: Runner;

    /** Count of existing (not destroyed) meshes that reference this geometry. */
    refCount: number;

    /**
     * @param buffers - An array of buffers. optional.
     * @param attributes - Of the geometry, optional structure of the attributes layout
     */
    constructor(buffers: Array<Buffer> = [], attributes: {[key: string]: Attribute} = {})
    {
        this.buffers = buffers;

        this.indexBuffer = null;

        this.attributes = attributes;

        this.glVertexArrayObjects = {};

        this.id = UID++;

        this.instanced = false;
        this.instanceCount = 1;

        this.disposeRunner = new Runner('disposeGeometry');
        this.refCount = 0;
    }

    /**
     *
     * Adds an attribute to the geometry
     * Note: `stride` and `start` should be `undefined` if you dont know them, not 0!
     * @param id - the name of the attribute (matching up to a shader)
     * @param {PIXI.Buffer|number[]} buffer - the buffer that holds the data of the attribute . You can also provide an Array and a buffer will be created from it.
     * @param size - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
     * @param normalized - should the data be normalized.
     * @param [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {PIXI.TYPES} to see the ones available
     * @param [stride=0] - How far apart, in bytes, the start of each value is. (used for interleaving data)
     * @param [start=0] - How far into the array to start reading values (used for interleaving data)
     * @param instance - Instancing flag
     * @returns - Returns self, useful for chaining.
     */
    addAttribute(id: string, buffer: Buffer | Float32Array | Uint32Array | Array<number>, size = 0, normalized = false,
        type?: TYPES, stride?: number, start?: number, instance = false): this
    {
        if (!buffer)
        {
            throw new Error('You must pass a buffer when creating an attribute');
        }

        // check if this is a buffer!
        if (!(buffer instanceof Buffer))
        {
            // its an array!
            if (buffer instanceof Array)
            {
                buffer = new Float32Array(buffer);
            }

            buffer = new Buffer(buffer);
        }

        const ids = id.split('|');

        if (ids.length > 1)
        {
            for (let i = 0; i < ids.length; i++)
            {
                this.addAttribute(ids[i], buffer, size, normalized, type);
            }

            return this;
        }

        let bufferIndex = this.buffers.indexOf(buffer);

        if (bufferIndex === -1)
        {
            this.buffers.push(buffer);
            bufferIndex = this.buffers.length - 1;
        }

        this.attributes[id] = new Attribute(bufferIndex, size, normalized, type, stride, start, instance);

        // assuming that if there is instanced data then this will be drawn with instancing!
        this.instanced = this.instanced || instance;

        return this;
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
     * Returns the requested buffer.
     * @param id - The name of the buffer required.
     * @returns - The buffer requested.
     */
    getBuffer(id: string): Buffer
    {
        return this.buffers[this.getAttribute(id).buffer];
    }

    /**
     *
     * Adds an index buffer to the geometry
     * The index buffer contains integers, three for each triangle in the geometry, which reference the various attribute buffers (position, colour, UV coordinates, other UV coordinates, normal, …). There is only ONE index buffer.
     * @param {PIXI.Buffer|number[]} [buffer] - The buffer that holds the data of the index buffer. You can also provide an Array and a buffer will be created from it.
     * @returns - Returns self, useful for chaining.
     */
    addIndex(buffer?: Buffer | IArrayBuffer | number[]): Geometry
    {
        if (!(buffer instanceof Buffer))
        {
            // its an array!
            if (buffer instanceof Array)
            {
                buffer = new Uint16Array(buffer);
            }

            buffer = new Buffer(buffer);
        }

        buffer.type = BUFFER_TYPE.ELEMENT_ARRAY_BUFFER;

        this.indexBuffer = buffer;

        if (!this.buffers.includes(buffer))
        {
            this.buffers.push(buffer);
        }

        return this;
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
     * This function modifies the structure so that all current attributes become interleaved into a single buffer
     * This can be useful if your model remains static as it offers a little performance boost
     * @returns - Returns self, useful for chaining.
     */
    interleave(): Geometry
    {
        // a simple check to see if buffers are already interleaved..
        if (this.buffers.length === 1 || (this.buffers.length === 2 && this.indexBuffer)) return this;

        // assume already that no buffers are interleaved
        const arrays = [];
        const sizes = [];
        const interleavedBuffer = new Buffer();
        let i;

        for (i in this.attributes)
        {
            const attribute = this.attributes[i];

            const buffer = this.buffers[attribute.buffer];

            arrays.push(buffer.data);

            sizes.push((attribute.size * byteSizeMap[attribute.type]) / 4);

            attribute.buffer = 0;
        }

        interleavedBuffer.data = interleaveTypedArrays(arrays, sizes);

        for (i = 0; i < this.buffers.length; i++)
        {
            if (this.buffers[i] !== this.indexBuffer)
            {
                this.buffers[i].destroy();
            }
        }

        this.buffers = [interleavedBuffer];

        if (this.indexBuffer)
        {
            this.buffers.push(this.indexBuffer);
        }

        return this;
    }

    /** Get the size of the geometries, in vertices. */
    getSize(): number
    {
        for (const i in this.attributes)
        {
            const attribute = this.attributes[i];
            const buffer = this.buffers[attribute.buffer];

            return (buffer.data as any).length / ((attribute.stride / 4) || attribute.size);
        }

        return 0;
    }

    /** Disposes WebGL resources that are connected to this geometry. */
    dispose(): void
    {
        this.disposeRunner.emit(this, false);
    }

    /** Destroys the geometry. */
    destroy(): void
    {
        this.dispose();

        this.buffers = null;
        this.indexBuffer = null;
        this.attributes = null;
    }

    /**
     * Returns a clone of the geometry.
     * @returns - A new clone of this geometry.
     */
    clone(): Geometry
    {
        const geometry = new Geometry();

        for (let i = 0; i < this.buffers.length; i++)
        {
            geometry.buffers[i] = new Buffer(this.buffers[i].data.slice(0));
        }

        for (const i in this.attributes)
        {
            const attrib = this.attributes[i];

            geometry.attributes[i] = new Attribute(
                attrib.buffer,
                attrib.size,
                attrib.normalized,
                attrib.type,
                attrib.stride,
                attrib.start,
                attrib.instance
            );
        }

        if (this.indexBuffer)
        {
            geometry.indexBuffer = geometry.buffers[this.buffers.indexOf(this.indexBuffer)];
            geometry.indexBuffer.type = BUFFER_TYPE.ELEMENT_ARRAY_BUFFER;
        }

        return geometry;
    }

    /**
     * Merges an array of geometries into a new single one.
     *
     * Geometry attribute styles must match for this operation to work.
     * @param geometries - array of geometries to merge
     * @returns - Shiny new geometry!
     */
    static merge(geometries: Array<Geometry>): Geometry
    {
        // todo add a geometry check!
        // also a size check.. cant be too big!]

        const geometryOut = new Geometry();

        const arrays = [];
        const sizes: Array<number> = [];
        const offsets = [];

        let geometry;

        // pass one.. get sizes..
        for (let i = 0; i < geometries.length; i++)
        {
            geometry = geometries[i];

            for (let j = 0; j < geometry.buffers.length; j++)
            {
                sizes[j] = sizes[j] || 0;
                sizes[j] += geometry.buffers[j].data.length;
                offsets[j] = 0;
            }
        }

        // build the correct size arrays..
        for (let i = 0; i < geometry.buffers.length; i++)
        {
            // TODO types!
            arrays[i] = new map[getBufferType(geometry.buffers[i].data)](sizes[i]);
            geometryOut.buffers[i] = new Buffer(arrays[i]);
        }

        // pass to set data..
        for (let i = 0; i < geometries.length; i++)
        {
            geometry = geometries[i];

            for (let j = 0; j < geometry.buffers.length; j++)
            {
                arrays[j].set(geometry.buffers[j].data, offsets[j]);
                offsets[j] += geometry.buffers[j].data.length;
            }
        }

        geometryOut.attributes = geometry.attributes;

        if (geometry.indexBuffer)
        {
            geometryOut.indexBuffer = geometryOut.buffers[geometry.buffers.indexOf(geometry.indexBuffer)];
            geometryOut.indexBuffer.type = BUFFER_TYPE.ELEMENT_ARRAY_BUFFER;

            let offset = 0;
            let stride = 0;
            let offset2 = 0;
            let bufferIndexToCount = 0;

            // get a buffer
            for (let i = 0; i < geometry.buffers.length; i++)
            {
                if (geometry.buffers[i] !== geometry.indexBuffer)
                {
                    bufferIndexToCount = i;
                    break;
                }
            }

            // figure out the stride of one buffer..
            for (const i in geometry.attributes)
            {
                const attribute = geometry.attributes[i];

                if ((attribute.buffer | 0) === bufferIndexToCount)
                {
                    stride += ((attribute.size * byteSizeMap[attribute.type]) / 4);
                }
            }

            // time to off set all indexes..
            for (let i = 0; i < geometries.length; i++)
            {
                const indexBufferData = geometries[i].indexBuffer.data;

                for (let j = 0; j < indexBufferData.length; j++)
                {
                    geometryOut.indexBuffer.data[j + offset2] += offset;
                }

                offset += geometries[i].buffers[bufferIndexToCount].data.length / (stride);
                offset2 += indexBufferData.length;
            }
        }

        return geometryOut;
    }
}
