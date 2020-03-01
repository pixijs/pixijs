import { createIndicesForQuads } from '@pixi/utils';
import { Geometry, Buffer } from '@pixi/core';
import { TYPES } from '@pixi/constants';

import type { DisplayObject } from '@pixi/display';
import type { IParticleRendererProperty } from './ParticleRenderer';

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original PixiJS version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that
 * they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's ParticleBuffer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/ParticleBuffer.java
 */

/**
 * The particle buffer manages the static and dynamic buffers for a particle container.
 *
 * @class
 * @private
 * @memberof PIXI
 */
export class ParticleBuffer
{
    public geometry: Geometry;
    public staticStride: number;
    public staticBuffer: Buffer;
    public staticData: Float32Array;
    public staticDataUint32: Uint32Array;
    public dynamicStride: number;
    public dynamicBuffer: Buffer;
    public dynamicData: Float32Array;
    public dynamicDataUint32: Uint32Array;
    public _updateID: number;

    indexBuffer: Buffer;
    private size: number;
    private dynamicProperties: IParticleRendererProperty[];
    private staticProperties: IParticleRendererProperty[];

    /**
     * @private
     * @param {object} properties - The properties to upload.
     * @param {boolean[]} dynamicPropertyFlags - Flags for which properties are dynamic.
     * @param {number} size - The size of the batch.
     */
    constructor(properties: IParticleRendererProperty[], dynamicPropertyFlags: boolean[], size: number)
    {
        this.geometry = new Geometry();

        this.indexBuffer = null;

        /**
         * The number of particles the buffer can hold
         *
         * @private
         * @member {number}
         */
        this.size = size;

        /**
         * A list of the properties that are dynamic.
         *
         * @private
         * @member {object[]}
         */
        this.dynamicProperties = [];

        /**
         * A list of the properties that are static.
         *
         * @private
         * @member {object[]}
         */
        this.staticProperties = [];

        for (let i = 0; i < properties.length; ++i)
        {
            let property = properties[i];

            // Make copy of properties object so that when we edit the offset it doesn't
            // change all other instances of the object literal
            property = {
                attributeName: property.attributeName,
                size: property.size,
                uploadFunction: property.uploadFunction,
                type: property.type || TYPES.FLOAT,
                offset: property.offset,
            };

            if (dynamicPropertyFlags[i])
            {
                this.dynamicProperties.push(property);
            }
            else
            {
                this.staticProperties.push(property);
            }
        }

        this.staticStride = 0;
        this.staticBuffer = null;
        this.staticData = null;
        this.staticDataUint32 = null;

        this.dynamicStride = 0;
        this.dynamicBuffer = null;
        this.dynamicData = null;
        this.dynamicDataUint32 = null;

        this._updateID = 0;

        this.initBuffers();
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    private initBuffers(): void
    {
        const geometry = this.geometry;

        let dynamicOffset = 0;

        /**
         * Holds the indices of the geometry (quads) to draw
         *
         * @member {Uint16Array}
         * @private
         */
        this.indexBuffer = new Buffer(createIndicesForQuads(this.size), true, true);
        geometry.addIndex(this.indexBuffer);

        this.dynamicStride = 0;

        for (let i = 0; i < this.dynamicProperties.length; ++i)
        {
            const property = this.dynamicProperties[i];

            property.offset = dynamicOffset;
            dynamicOffset += property.size;
            this.dynamicStride += property.size;
        }

        const dynBuffer = new ArrayBuffer(this.size * this.dynamicStride * 4 * 4);

        this.dynamicData = new Float32Array(dynBuffer);
        this.dynamicDataUint32 = new Uint32Array(dynBuffer);
        this.dynamicBuffer = new Buffer(this.dynamicData, false, false);

        // static //
        let staticOffset = 0;

        this.staticStride = 0;

        for (let i = 0; i < this.staticProperties.length; ++i)
        {
            const property = this.staticProperties[i];

            property.offset = staticOffset;
            staticOffset += property.size;
            this.staticStride += property.size;
        }

        const statBuffer = new ArrayBuffer(this.size * this.staticStride * 4 * 4);

        this.staticData = new Float32Array(statBuffer);
        this.staticDataUint32 = new Uint32Array(statBuffer);
        this.staticBuffer = new Buffer(this.staticData, true, false);

        for (let i = 0; i < this.dynamicProperties.length; ++i)
        {
            const property = this.dynamicProperties[i];

            geometry.addAttribute(
                property.attributeName,
                this.dynamicBuffer,
                0,
                property.type === TYPES.UNSIGNED_BYTE,
                property.type,
                this.dynamicStride * 4,
                property.offset * 4
            );
        }

        for (let i = 0; i < this.staticProperties.length; ++i)
        {
            const property = this.staticProperties[i];

            geometry.addAttribute(
                property.attributeName,
                this.staticBuffer,
                0,
                property.type === TYPES.UNSIGNED_BYTE,
                property.type,
                this.staticStride * 4,
                property.offset * 4
            );
        }
    }

    /**
     * Uploads the dynamic properties.
     *
     * @private
     * @param {PIXI.DisplayObject[]} children - The children to upload.
     * @param {number} startIndex - The index to start at.
     * @param {number} amount - The number to upload.
     */
    uploadDynamic(children: DisplayObject[], startIndex: number, amount: number): void
    {
        for (let i = 0; i < this.dynamicProperties.length; i++)
        {
            const property = this.dynamicProperties[i];

            property.uploadFunction(children, startIndex, amount,
                property.type === TYPES.UNSIGNED_BYTE ? this.dynamicDataUint32 : this.dynamicData,
                this.dynamicStride, property.offset);
        }

        this.dynamicBuffer._updateID++;
    }

    /**
     * Uploads the static properties.
     *
     * @private
     * @param {PIXI.DisplayObject[]} children - The children to upload.
     * @param {number} startIndex - The index to start at.
     * @param {number} amount - The number to upload.
     */
    uploadStatic(children: DisplayObject[], startIndex: number, amount: number): void
    {
        for (let i = 0; i < this.staticProperties.length; i++)
        {
            const property = this.staticProperties[i];

            property.uploadFunction(children, startIndex, amount,
                property.type === TYPES.UNSIGNED_BYTE ? this.staticDataUint32 : this.staticData,
                this.staticStride, property.offset);
        }

        this.staticBuffer._updateID++;
    }

    /**
     * Destroys the ParticleBuffer.
     *
     * @private
     */
    destroy(): void
    {
        this.indexBuffer = null;

        this.dynamicProperties = null;
        this.dynamicBuffer = null;
        this.dynamicData = null;
        this.dynamicDataUint32 = null;

        this.staticProperties = null;
        this.staticBuffer = null;
        this.staticData = null;
        this.staticDataUint32 = null;
        // all buffers are destroyed inside geometry
        this.geometry.destroy();
    }
}
