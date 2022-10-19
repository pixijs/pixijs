import { Buffer, Geometry, TYPES } from '@pixi/core';

import type { IArrayBuffer } from '@pixi/core';

/**
 * Standard 2D geometry used in PixiJS.
 *
 * Geometry can be defined without passing in a style or data if required.
 * @example
 * import { Geometry } from 'pixi.js';
 *
 * const geometry = new Geometry();
 *
 * geometry.addAttribute('positions', [0, 0, 100, 0, 100, 100, 0, 100], 2);
 * geometry.addAttribute('uvs', [0, 0, 1, 0, 1, 1, 0, 1], 2);
 * geometry.addIndex([0, 1, 2, 1, 3, 2]);
 * @memberof PIXI
 */
export class MeshGeometry extends Geometry
{
    // Internal-only properties
    /**
     * Dirty flag to limit update calls on Mesh. For example,
     * limiting updates on a single Mesh instance with a shared Geometry
     * within the render loop.
     * @private
     * @default -1
     */
    _updateId: number;

    /**
     * @param {Float32Array|number[]} [vertices] - Positional data on geometry.
     * @param {Float32Array|number[]} [uvs] - Texture UVs.
     * @param {Uint16Array|number[]} [index] - IndexBuffer
     */
    constructor(vertices?: IArrayBuffer, uvs?: IArrayBuffer, index?: IArrayBuffer)
    {
        super();

        const verticesBuffer = new Buffer(vertices);
        const uvsBuffer = new Buffer(uvs, true);
        const indexBuffer = new Buffer(index, true, true);

        this.addAttribute('aVertexPosition', verticesBuffer, 2, false, TYPES.FLOAT)
            .addAttribute('aTextureCoord', uvsBuffer, 2, false, TYPES.FLOAT)
            .addIndex(indexBuffer);

        this._updateId = -1;
    }

    /**
     * If the vertex position is updated.
     * @readonly
     * @private
     */
    get vertexDirtyId(): number
    {
        return this.buffers[0]._updateID;
    }
}
