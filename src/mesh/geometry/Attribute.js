/* eslint-disable max-len */

/**
 * holds the information for a single attribute structure required to render geometry.
 * this does not conatina the actul data, but instead has a buffer id that maps to a {PIXI.Buffer}
 * This can include anything from positions, uvs, normals, colors etc..
 *
 * @class
 * @memberof PIXI.Attribute
 */
class Attribute
{
    /**
     * @param {string} buffer  the id of the buffer that this attribute will look for
     * @param {Number} [size=2] the size of the attribute. If you hava 2 floats per vertex (eg position x and y) this would be 2
     * @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
     * @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
     * @param {Boolean} [normalised=false] should the data be normalised.
     */
    constructor(buffer, size = 2, stride = 0, start = 0, normalised = false)
    {
        this.buffer = buffer;
        this.normalized = normalised;
        this.size = size;
        this.stride = stride;
        this.start = start;
        this.type = null;
    }

    /**
     * Destroys the Attribute.
     */
    destroy()
    {
        this.buffer = null;
    }

    /**
     * Helper function that creates an Attribute based on the information provided
     *
     * @static
     * @param {string} buffer  the id of the buffer that this attribute will look for
     * @param {Number} [size=2] the size of the attribute. If you hava 2 floats per vertex (eg position x and y) this would be 2
     * @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
     * @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
     * @param {Boolean} [normalised=false] should the data be normalised.
     *
     * @returns {PIXI.Attribute} A new {PIXI.Attribute} based on the information provided
     */
    static from(buffer, size, stride, start, normalised)
    {
        return new Attribute(buffer, size, stride, start, normalised);
    }
}

module.exports = Attribute;
