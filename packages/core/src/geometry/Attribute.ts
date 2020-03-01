import type { TYPES } from '@pixi/constants';

/* eslint-disable max-len */

/**
 * Holds the information for a single attribute structure required to render geometry.
 *
 * This does not contain the actual data, but instead has a buffer id that maps to a {@link PIXI.Buffer}
 * This can include anything from positions, uvs, normals, colors etc.
 *
 * @class
 * @memberof PIXI
 */
export class Attribute
{
    public buffer: number;
    public size: number;
    public normalized: boolean;
    public type: TYPES;
    public stride: number;
    public start: number;
    public instance: boolean;
    /**
     * @param {string} buffer  the id of the buffer that this attribute will look for
     * @param {Number} [size=0] the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2.
     * @param {Boolean} [normalized=false] should the data be normalized.
     * @param {Number} [type=PIXI.TYPES.FLOAT] what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
     * @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
     * @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
     */
    constructor(buffer: number, size = 0, normalized = false, type = 5126, stride?: number, start?: number, instance?: boolean)
    {
        this.buffer = buffer;
        this.size = size;
        this.normalized = normalized;
        this.type = type;
        this.stride = stride;
        this.start = start;
        this.instance = instance;
    }

    /**
     * Destroys the Attribute.
     */
    destroy(): void
    {
        this.buffer = null;
    }

    /**
     * Helper function that creates an Attribute based on the information provided
     *
     * @static
     * @param {string} buffer  the id of the buffer that this attribute will look for
     * @param {Number} [size=0] the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
     * @param {Boolean} [normalized=false] should the data be normalized.
     * @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
     * @param {Number} [type=PIXI.TYPES.FLOAT] what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
     * @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
     *
     * @returns {PIXI.Attribute} A new {@link PIXI.Attribute} based on the information provided
     */
    static from(buffer: number, size?: number, normalized?: boolean, type?: TYPES, stride?: number): Attribute
    {
        return new Attribute(buffer, size, normalized, type, stride);
    }
}
