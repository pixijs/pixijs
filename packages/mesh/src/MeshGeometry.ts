import { TYPES } from '@pixi/constants';
import { Buffer, Geometry } from '@pixi/core';

import type { IArrayBuffer } from '@pixi/core';

/**
 * Standard 2D geometry used in PixiJS.
 *
 * Geometry can be defined without passing in a style or data if required.
 *
 * ```js
 * const geometry = new PIXI.Geometry();
 *
 * geometry.addAttribute('positions', [0, 0, 100, 0, 100, 100, 0, 100], 2);
 * geometry.addAttribute('uvs', [0,0,1,0,1,1,0,1], 2);
 * geometry.addIndex([0,1,2,1,3,2]);
 *
 * ```
 * @class
 * @memberof PIXI
 * @extends PIXI.Geometry
 */
export class MeshGeometry extends Geometry
{
    // TODO: is this needed?
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    private _updateId: number;

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

        /**
         * Dirty flag to limit update calls on Mesh. For example,
         * limiting updates on a single Mesh instance with a shared Geometry
         * within the render loop.
         * @private
         * @member {number}
         * @default -1
         */
        this._updateId = -1;
    }

    /**
     * If the vertex position is updated.
     * @member {number}
     * @readonly
     * @private
     */
    get vertexDirtyId(): number
    {
        return this.buffers[0]._updateID;
    }
}
