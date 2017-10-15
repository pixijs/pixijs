import GLBuffer from '../../core/renderers/webgl/systems/geometry/GLBuffer';
// import VertexArrayObject from '../../core/renderers/webgl/systems/geometry/VertexArrayObject';

import createIndicesForQuads from '../../core/utils/createIndicesForQuads';

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
export default class ParticleBuffer
{
    /**
     * @param {WebGLRenderingContext} gl - The rendering context.
     * @param {object} properties - The properties to upload.
     * @param {boolean[]} dynamicPropertyFlags - Flags for which properties are dynamic.
     * @param {number} size - The size of the batch.
     */
    constructor(gl, properties, dynamicPropertyFlags, size)
    {
        /**
         * The current WebGL drawing context.
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = gl;

        /**
         * The number of particles the buffer can hold
         *
         * @member {number}
         */
        this.size = size;

        /**
         * A list of the properties that are dynamic.
         *
         * @member {object[]}
         */
        this.dynamicProperties = [];

        /**
         * A list of the properties that are static.
         *
         * @member {object[]}
         */
        this.staticProperties = [];

        for (let i = 0; i < properties.length; ++i)
        {
            let property = properties[i];

            // Make copy of properties object so that when we edit the offset it doesn't
            // change all other instances of the object literal
            property = {
                attribute: property.attribute,
                size: property.size,
                uploadFunction: property.uploadFunction,
                unsignedByte: property.unsignedByte,
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

        this.initBuffers();
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    initBuffers()
    {
        const gl = this.gl;
        let dynamicOffset = 0;

        /**
         * Holds the indices of the geometry (quads) to draw
         *
         * @member {Uint16Array}
         */
        this.indices = createIndicesForQuads(this.size);
        this.indexBuffer = GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

        this.dynamicStride = 0;

        for (let i = 0; i < this.dynamicProperties.length; ++i)
        {
            const property = this.dynamicProperties[i];

            property.offset = dynamicOffset;
            dynamicOffset += property.size;
            this.dynamicStride += property.size;
        }

        this.dynamicData = new Float32Array(this.size * this.dynamicStride * 4);
        this.dynamicBuffer = GLBuffer.createVertexBuffer(gl, this.dynamicData, gl.STREAM_DRAW);

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

        this.staticData = new Float32Array(this.size * this.staticStride * 4);
        this.staticBuffer = GLBuffer.createVertexBuffer(gl, this.staticData, gl.STATIC_DRAW);

        // this.vao = new VertexArrayObject(gl)
        // .addIndex(this.indexBuffer);

        for (let i = 0; i < this.dynamicProperties.length; ++i)
        {
            const property = this.dynamicProperties[i];

            if (property.unsignedByte)
            {
                this.vao.addAttribute(
                    this.dynamicBuffer,
                    property.attribute,
                    gl.UNSIGNED_BYTE,
                    true,
                    this.dynamicStride * 4,
                    property.offset * 4
                );
            }
            else
            {
                this.vao.addAttribute(
                    this.dynamicBuffer,
                    property.attribute,
                    gl.FLOAT,
                    false,
                    this.dynamicStride * 4,
                    property.offset * 4
                );
            }
        }

        for (let i = 0; i < this.staticProperties.length; ++i)
        {
            const property = this.staticProperties[i];

            if (property.unsignedByte)
            {
                this.vao.addAttribute(
                    this.staticBuffer,
                    property.attribute,
                    gl.UNSIGNED_BYTE,
                    true,
                    this.staticStride * 4,
                    property.offset * 4
                );
            }
            else
            {
                this.vao.addAttribute(
                    this.staticBuffer,
                    property.attribute,
                    gl.FLOAT,
                    false,
                    this.staticStride * 4,
                    property.offset * 4
                );
            }
        }
    }

    /**
     * Uploads the dynamic properties.
     *
     * @param {PIXI.DisplayObject[]} children - The children to upload.
     * @param {number} startIndex - The index to start at.
     * @param {number} amount - The number to upload.
     */
    uploadDynamic(children, startIndex, amount)
    {
        for (let i = 0; i < this.dynamicProperties.length; i++)
        {
            const property = this.dynamicProperties[i];

            property.uploadFunction(children, startIndex, amount,
                property.unsignedByte ? this.dynamicDataUint32 : this.dynamicData,
                this.dynamicStride, property.offset);
        }

        this.dynamicBuffer.upload();
    }

    /**
     * Uploads the static properties.
     *
     * @param {PIXI.DisplayObject[]} children - The children to upload.
     * @param {number} startIndex - The index to start at.
     * @param {number} amount - The number to upload.
     */
    uploadStatic(children, startIndex, amount)
    {
        for (let i = 0; i < this.staticProperties.length; i++)
        {
            const property = this.staticProperties[i];

            property.uploadFunction(children, startIndex, amount,
                property.unsignedByte ? this.staticDataUint32 : this.staticData,
                this.staticStride, property.offset);
        }

        this.staticBuffer.upload();
    }

    /**
     * Destroys the ParticleBuffer.
     *
     */
    destroy()
    {
        this.dynamicProperties = null;
        this.dynamicData = null;
        this.dynamicBuffer.destroy();

        this.staticProperties = null;
        this.staticData = null;
        this.staticBuffer.destroy();
    }

}
