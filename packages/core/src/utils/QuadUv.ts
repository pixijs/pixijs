import { Geometry } from '../geometry/Geometry';
import { Buffer } from '../geometry/Buffer';

import type { Rectangle } from '@pixi/math';

/**
 * Helper class to create a quad with uvs like in v4
 *
 * @memberof PIXI
 */
export class QuadUv extends Geometry
{
    vertexBuffer: Buffer;
    uvBuffer: Buffer;

    /** An array of vertices. */
    vertices: Float32Array;

    /** The Uvs of the quad. */
    uvs: Float32Array;

    constructor()
    {
        super();

        this.vertices = new Float32Array([
            -1, -1,
            1, -1,
            1, 1,
            -1, 1,
        ]);

        this.uvs = new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ]);

        this.vertexBuffer = new Buffer(this.vertices);
        this.uvBuffer = new Buffer(this.uvs);

        this.addAttribute('aVertexPosition', this.vertexBuffer)
            .addAttribute('aTextureCoord', this.uvBuffer)
            .addIndex([0, 1, 2, 0, 2, 3]);
    }

    /**
     * Maps two Rectangle to the quad.
     *
     * @param targetTextureFrame - The first rectangle
     * @param destinationFrame - The second rectangle
     * @return - Returns itself.
     */
    map(targetTextureFrame: Rectangle, destinationFrame: Rectangle): this
    {
        let x = 0; // destinationFrame.x / targetTextureFrame.width;
        let y = 0; // destinationFrame.y / targetTextureFrame.height;

        this.uvs[0] = x;
        this.uvs[1] = y;

        this.uvs[2] = x + (destinationFrame.width / targetTextureFrame.width);
        this.uvs[3] = y;

        this.uvs[4] = x + (destinationFrame.width / targetTextureFrame.width);
        this.uvs[5] = y + (destinationFrame.height / targetTextureFrame.height);

        this.uvs[6] = x;
        this.uvs[7] = y + (destinationFrame.height / targetTextureFrame.height);

        x = destinationFrame.x;
        y = destinationFrame.y;

        this.vertices[0] = x;
        this.vertices[1] = y;

        this.vertices[2] = x + destinationFrame.width;
        this.vertices[3] = y;

        this.vertices[4] = x + destinationFrame.width;
        this.vertices[5] = y + destinationFrame.height;

        this.vertices[6] = x;
        this.vertices[7] = y + destinationFrame.height;

        this.invalidate();

        return this;
    }

    /**
     * Legacy upload method, just marks buffers dirty.
     *
     * @returns - Returns itself.
     */
    invalidate(): this
    {
        this.vertexBuffer._updateID++;
        this.uvBuffer._updateID++;

        return this;
    }
}
