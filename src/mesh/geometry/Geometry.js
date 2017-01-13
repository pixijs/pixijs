import Attribute from './Attribute';
import Buffer from './Buffer';

/* eslint-disable max-len */

/**
 * The Geometry represents a model. It consists of two components:
 * GeometryStyle - The structure of the model such as the attributes layout
 * GeometryData - the data of the model - this consits of buffers.
 *
 * This can include anything from positions, uvs, normals, colors etc..
 *
 * Geometry can be defined without passing in a style or data if required (thats how I prefer!)
 *
 * ```js
 * let geometry = new PIXI.mesh.Geometry();
 *
 * geometry.addAttribute('positions', [0, 0, 100, 0, 100, 100, 0, 100], 2);
 * geometry.addAttribute('uvs', [0,0,1,0,1,1,0,1],2)
 * geometry.addIndex([0,1,2,1,3,2])
 *
 * ```
 * @class
 * @memberof PIXI.mesh.Geometry
 */
export default class Geometry
{
    /**
     * @param {array} data  this consists of buffers. optional.
     * @param {object} attributes of the geometry, optional structure of the attributes layout
     */
    constructor(buffers, attributes)
    {
        this.buffers = buffers || [];

        this.indexBuffer = null;

        this.attributes = attributes || {};

        /**
         * A map of renderer IDs to webgl VAOs
         *
         * @private
         * @type {Array<VertexArrayObject>}
         */
        this.glVertexArrayObjects = [];
    }

    /**
    *
    * Adds an attribute to the geometry
    *
    * @param {String} id - the name of the attribute (matching up to a shader)
    * @param {PIXI.mesh.Buffer} [buffer] the buffer that holds the data of the attribute . You can also provide an Array and a buffer will be created from it.
    * @param {Number} [size=2] the size of the attribute. If you hava 2 floats per vertex (eg position x and y) this would be 2
    * @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
    * @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
    * @param {Boolean} [normalised=false] should the data be normalised.
    *
    * @return {PIXI.mesh.Geometry} returns self, useful for chaining.
    */
    addAttribute(id, buffer, normalised = false, type, stride, start)
    {
        // check if this is a buffer!
        if (!buffer.data)
        {
            // its an array!
            if (buffer instanceof Array)
            {
                buffer = new Float32Array(buffer);
            }

            buffer = new Buffer(buffer);
        }

        var ids = id.split('|');

        if(ids.length > 1)
        {
            for (var i = 0; i < ids.length; i++)
            {
                this.addAttribute(ids[i], buffer, normalised, type)
            }

            return this;
        }

        let bufferIndex = this.buffers.indexOf(buffer);

        if (bufferIndex === -1)
        {
            this.buffers.push(buffer);
            bufferIndex = this.buffers.length-1
        }

        this.attributes[id] = new Attribute(bufferIndex, normalised, type, stride, start);

        return this;
    }

    /**
     * returns the requested attribute
     *
     * @param {String} id  the name of the attribute required
     * @return {PIXI.mesh.Attribute} the attribute requested.
     */
    getAttribute(id)
    {
        return this.buffers[this.attributes[id].buffer];
    }

    /**
    *
    * Adds an index buffer to the geometry
    * The index buffer contains integers, three for each triangle in the geometry, which reference the various attribute buffers (position, colour, UV coordinates, other UV coordinates, normal, …). There is only ONE index buffer.
    *
    * @param {PIXI.mesh.Buffer} [buffer] the buffer that holds the data of the index buffer. You can also provide an Array and a buffer will be created from it.
    * @return {PIXI.mesh.Geometry} returns self, useful for chaining.
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
     * returns the index buffer
     *
     * @return {PIXI.mesh.Buffer} the index buffer.
     */
    getIndex()
    {
        return this.indexBuffer;
    }

    /**
     * Destroys the geometry.
     */
    destroy()
    {
        for (let i = 0; i < this.glVertexArrayObjects.length; i++)
        {
            this.glVertexArrayObjects[i].destroy();
        }

        this.glVertexArrayObjects = null;

        for (let i = 0; i < this.buffers.length; i++)
        {
            this.buffers[i].destroy();
        }

        this.buffers = null;
        this.indexBuffer.destroy();

        this.attributes = null;
    }
}
