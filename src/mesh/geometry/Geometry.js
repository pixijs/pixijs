import Attribute from './Attribute';
import Buffer from './Buffer';
import GeometryStyle from './GeometryStyle';
import GeometryData from './GeometryData';

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
     * @param {PIXI.mesh.GeometryData} data  optional structure of the model such as the attributes layout
     * @param {PIXI.mesh.GeometryStyle} style optional data of the model, this consists of buffers.
     */
    constructor(data, style)
    {
        /**
         * the style of the geometry
         * @type {PIXI.mesh.GeometryStyle}
         */
        this.style = style || new GeometryStyle();

        /**
         * the data of the geometry
         * @type {PIXI.mesh.GeometryData}
         */
        this.data = data || new GeometryData();

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
    addAttribute(id, buffer, size = 2, stride = 0, start = 0, normalised = false)
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

        this.style.addAttribute(id, new Attribute(buffer.id, size, stride, start, normalised));
        this.data.add(buffer.id, buffer);

        // dynamically create an access point..
        this[id] = buffer;

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
        return this.data[this.style.attributes[id].buffer];
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
        this.data.addIndex(buffer);

        return this;
    }

    /**
     * returns the index buffer
     *
     * @return {PIXI.mesh.Buffer} the index buffer.
     */
    getIndex()
    {
        return this.data.indexBuffer;
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

        this.data.destroy();
        this.style.destroy();
    }
}
