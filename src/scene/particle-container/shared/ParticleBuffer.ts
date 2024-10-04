import { Buffer } from '../../../rendering/renderers/shared/buffer/Buffer';
import { BufferUsage } from '../../../rendering/renderers/shared/buffer/const';
import { Geometry } from '../../../rendering/renderers/shared/geometry/Geometry';
import { getAttributeInfoFromFormat } from '../../../rendering/renderers/shared/geometry/utils/getAttributeInfoFromFormat';
import { ViewableBuffer } from '../../../utils/data/ViewableBuffer';
import { createIndicesForQuads } from './utils/createIndicesForQuads';
import { generateParticleUpdateFunction } from './utils/generateParticleUpdateFunction';

import type { IndexBufferArray } from '../../../rendering/renderers/shared/geometry/Geometry';
import type { IParticle } from './Particle';
import type { ParticleRendererProperty } from './particleData';
import type { ParticleUpdateFunction } from './utils/generateParticleUpdateFunction';

/**
 * Options for creating a ParticleBuffer.
 * @property {number} size - The size of the particle buffer.
 * @property {Record<string, ParticleRendererProperty>} properties - A record of attributes that the particle container uses.
 */
export interface ParticleBufferOptions
{
    size: number;
    properties: Record<string, ParticleRendererProperty>;
}

/**
 * The ParticleBuffer holds the buffers and geometry for a particle container.
 * It also contains the upload functions for the static and dynamic properties.
 * @internal
 */
export class ParticleBuffer
{
    /** The buffer containing static attribute data for all elements in the batch. */
    public staticAttributeBuffer: ViewableBuffer;
    /** The buffer containing dynamic attribute data for all elements in the batch. */
    public dynamicAttributeBuffer: ViewableBuffer;

    private readonly _staticBuffer: Buffer;
    private readonly _dynamicBuffer: Buffer;

    /** The buffer containing index data for all elements in the batch. */
    public indexBuffer: IndexBufferArray;

    private readonly _dynamicStride: number;
    private readonly _staticStride: number;

    /** The geometry of the particle buffer. */
    public readonly geometry: Geometry;

    private _size = 0;
    private readonly _dynamicUpload: ParticleUpdateFunction;
    private readonly _staticUpload: ParticleUpdateFunction;
    private readonly _generateParticleUpdateCache: Record<string, {
        dynamicUpdate: ParticleUpdateFunction;
        staticUpdate: ParticleUpdateFunction;
    }> = {};

    constructor(options: ParticleBufferOptions)
    {
        // size in sprites!
        const size = this._size = options.size ?? 1000;

        // TODO add the option to specify what is dynamic!
        const properties = options.properties;

        // in bytes!
        let staticVertexSize = 0;
        let dynamicVertexSize = 0;

        for (const i in properties)
        {
            const property = properties[i];
            const attributeInfo = getAttributeInfoFromFormat(property.format);

            if (property.dynamic)
            {
                // dynamic.
                dynamicVertexSize += attributeInfo.stride;
            }
            else
            {
                // static.
                staticVertexSize += attributeInfo.stride;
            }
        }

        this._dynamicStride = dynamicVertexSize / 4;
        this._staticStride = staticVertexSize / 4;

        this.staticAttributeBuffer = new ViewableBuffer(size * 4 * staticVertexSize);
        this.dynamicAttributeBuffer = new ViewableBuffer(size * 4 * dynamicVertexSize);

        this.indexBuffer = createIndicesForQuads(size);

        // build geometry..

        const geometry = new Geometry();

        let dynamicOffset = 0;
        let staticOffset = 0;

        this._staticBuffer = new Buffer({
            data: new Float32Array(1),
            label: 'static-particle-buffer',
            shrinkToFit: false,
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST
        });

        this._dynamicBuffer = new Buffer({
            data: new Float32Array(1),
            label: 'dynamic-particle-buffer',
            shrinkToFit: false,
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST
        });

        for (const i in properties)
        {
            const property = properties[i];
            const attributeInfo = getAttributeInfoFromFormat(property.format);

            if (property.dynamic)
            {
                geometry.addAttribute(property.attributeName, {
                    buffer: this._dynamicBuffer,
                    stride: this._dynamicStride * 4,
                    offset: dynamicOffset * 4,
                    format: property.format,
                });
                dynamicOffset += attributeInfo.size;
            }
            else
            {
                geometry.addAttribute(property.attributeName, {
                    buffer: this._staticBuffer,
                    stride: this._staticStride * 4,
                    offset: staticOffset * 4,
                    format: property.format,
                });
                staticOffset += attributeInfo.size;
            }
        }

        geometry.addIndex(this.indexBuffer);

        const uploadFunction = this.getParticleUpdate(properties);

        this._dynamicUpload = uploadFunction.dynamicUpdate;
        this._staticUpload = uploadFunction.staticUpdate;

        this.geometry = geometry;
    }

    public getParticleUpdate(properties: Record<string, ParticleRendererProperty>)
    {
        const key = getParticleSyncKey(properties);

        if (this._generateParticleUpdateCache[key])
        {
            return this._generateParticleUpdateCache[key];
        }

        this._generateParticleUpdateCache[key] = this.generateParticleUpdate(properties);

        return this._generateParticleUpdateCache[key];
    }

    public generateParticleUpdate(properties: Record<string, ParticleRendererProperty>)
    {
        return generateParticleUpdateFunction(properties);
    }

    public update(particles: IParticle[], uploadStatic: boolean)
    {
        // first resize the buffers if needed!
        // TODO resize!
        if (particles.length > this._size)
        {
            uploadStatic = true;

            this._size = Math.max(particles.length, (this._size * 1.5) | 0);

            this.staticAttributeBuffer = new ViewableBuffer(this._size * this._staticStride * 4 * 4);
            this.dynamicAttributeBuffer = new ViewableBuffer(this._size * this._dynamicStride * 4 * 4);
            this.indexBuffer = createIndicesForQuads(this._size);

            this.geometry.indexBuffer.setDataWithSize(
                this.indexBuffer, this.indexBuffer.byteLength, true);
        }

        const dynamicAttributeBuffer = this.dynamicAttributeBuffer;

        this._dynamicUpload(particles, dynamicAttributeBuffer.float32View, dynamicAttributeBuffer.uint32View);

        this._dynamicBuffer.setDataWithSize(
            this.dynamicAttributeBuffer.float32View, particles.length * this._dynamicStride * 4, true);

        if (uploadStatic)
        {
            const staticAttributeBuffer = this.staticAttributeBuffer;

            this._staticUpload(particles, staticAttributeBuffer.float32View, staticAttributeBuffer.uint32View);

            this._staticBuffer.setDataWithSize(
                staticAttributeBuffer.float32View, particles.length * this._staticStride * 4, true);
        }
    }

    public destroy()
    {
        this._staticBuffer.destroy();
        this._dynamicBuffer.destroy();
        this.geometry.destroy();
    }
}

function getParticleSyncKey(properties: Record<string, ParticleRendererProperty>)
{
    const keyGen: string[] = [];

    for (const key in properties)
    {
        const property = properties[key];

        keyGen.push(key, property.code, property.dynamic ? 'd' : 's');
    }

    return keyGen.join('_');
}

