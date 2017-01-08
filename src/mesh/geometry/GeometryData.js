/* eslint-disable max-len */
import Buffer from './Buffer';

/**
 * GeometryData - the data of the geometry - this consits of attribute buffers and one index buffer.
 *
 * This can include anything from positions, uvs, normals, colors etc..
 *
 * ```js
 * let geometryData = new PIXI.GeometryData();
 *
 * geometryData.add('positions', [0,1,0,2,3]);
 * geometryData.add('uvs', [0,0,1,0,1,1,0,1]);
 * geometryData.addIndex([0,1,2,1,3,2])
 *
 * ```
 * @class
 * @memberof PIXI.GeometryData
 */
export default class GeometryData
{
    /**
     *
     */
    constructor()
    {
        /**
         * an array of {PIXI.Buffer} belonging to the geometryData
         * @type {Array}
         */
        this.buffers = [];

        /**
         * the index buffer data for the geometry
         * @type {PIXI.Buffer}
         */
        this.indexBuffer = null;
    }

    /**
    *
    * Adds an buffer to the geometryData
    *
    * @param {String} id - the name of the buffer (matching up to a geometry style)
    * @param {PIXI.Buffer} [buffer] the buffer that holds the data mapping to a geometry attribute. You can also provide an Array and a buffer will be created from it.
    *
    * @return {PIXI.GeometryData} returns self, useful for chaining.
    */
    add(id, buffer)
    {
        // bit of duplicate code here and in geometry..
        if (!buffer.data)
        {
            // its an array!
            if (buffer instanceof Array)
            {
                buffer = new Float32Array(buffer);
            }

            buffer = new Buffer(buffer);
        }

        // only one!
        if (this.buffers.indexOf(buffer) === -1)
        {
            this.buffers.push(buffer);
            this[id] = buffer;
        }

        return this;
    }

    /**
    *
    * Adds an index buffer to the geometryData
    * The index buffer contains integers, three for each triangle in the geometry, which reference the various attribute buffers (position, colour, UV coordinates, other UV coordinates, normal, …). There is only ONE index buffer.
    *
    * @param {PIXI.Buffer} [buffer] the buffer that holds the data of the index buffer. You can also provide an Array and a buffer will be created from it.
    * @return {PIXI.GeometryData} returns self, useful for chaining.
    */
    addIndex(buffer)
    {
        if (!buffer.data)
        {
            // its an array!
            if (buffer instanceof Array)
            {
                buffer = new Uint16Array(buffer);
            }

            buffer = new Buffer(buffer);
        }

        buffer.index = true;
        this.indexBuffer = buffer;

        if (this.buffers.indexOf(buffer) === -1)
        {
            this.buffers.push(buffer);
        }

        return this;
    }

    /**
     * Destroys the geometry data.
     */
    destroy()
    {
        for (let i = 0; i < this.buffers.length; i++)
        {
            this.buffers[i].destroy();
        }

        this.buffers = null;

        this.indexBuffer.destroy();
        this.indexBuffer = null;
    }
}
