import { TYPES } from '@pixi/constants';

/* eslint-disable max-len */

/**
 * Holds the information for a single attribute structure required to render geometry.
 *
 * This does not contain the actual data, but instead has a buffer id that maps to a {@link PIXI.Buffer}
 * This can include anything from positions, uvs, normals, colors etc.
 *
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
     * @param buffer - the id of the buffer that this attribute will look for
     * @param size - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2.
     * @param normalized - should the data be normalized.
     * @param {PIXI.TYPES} [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
     * @param [stride=0] - How far apart, in bytes, the start of each value is. (used for interleaving data)
     * @param [start=0] - How far into the array to start reading values (used for interleaving data)
     * @param [instance=false] - Whether the geometry is instanced.
     */
    constructor(buffer: number, size = 0, normalized = false, type = TYPES.FLOAT, stride?: number, start?: number, instance?: boolean)
    {
        this.buffer = buffer;
        this.size = size;
        this.normalized = normalized;
        this.type = type;
        this.stride = stride;
        this.start = start;
        this.instance = instance;
    }

    /** Destroys the Attribute. */
    destroy(): void
    {
        this.buffer = null;
    }

    /**
     * Helper function that creates an Attribute based on the information provided
     *
     * @param buffer - the id of the buffer that this attribute will look for
     * @param [size=0] - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
     * @param [normalized=false] - should the data be normalized.
     * @param [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
     * @param [stride=0] - How far apart, in bytes, the start of each value is. (used for interleaving data)
     * @returns - A new {@link PIXI.Attribute} based on the information provided
     */
    static from(buffer: number, size?: number, normalized?: boolean, type?: TYPES, stride?: number): Attribute
    {
        return new Attribute(buffer, size, normalized, type, stride);
    }
}
