import { Geometry } from '../geometry/Geometry';
import { Buffer } from '../geometry/Buffer';

import type { Rectangle } from '@pixi/math';

/**
 * Helper class to create a quad with uvs like in v4
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.Geometry
 */
export class QuadUv extends Geometry
{
    vertexBuffer: Buffer;
    uvBuffer: Buffer;
    vertices: Float32Array;
    uvs: Float32Array;

    constructor()
    {
        super();

        /**
         * An array of vertices
         *
         * @member {Float32Array}
         */
        this.vertices = new Float32Array([
            -1, -1,
            1, -1,
            1, 1,
            -1, 1,
        ]);

        /**
         * The Uvs of the quad
         *
         * @member {Float32Array}
         */
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
     * @param {PIXI.Rectangle} targetTextureFrame - the first rectangle
     * @param {PIXI.Rectangle} destinationFrame - the second rectangle
     * @return {PIXI.Quad} Returns itself.
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
     * legacy upload method, just marks buffers dirty
     * @returns {PIXI.QuadUv} Returns itself.
     */
    invalidate(): this
    {
        this.vertexBuffer._updateID++;
        this.uvBuffer._updateID++;

        return this;
    }
}
