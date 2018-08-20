import { TYPES } from '@pixi/constants';

import { Buffer, Geometry } from '@pixi/core';

/* eslint-disable max-len */

/**
 * The Geometry represents a model. It consists of two components:
 * GeometryStyle - The structure of the model such as the attributes layout
 * GeometryData - the data of the model - this consists of buffers.
 *
 * This can include anything from positions, uvs, normals, colors etc..
 *
 * Geometry can be defined without passing in a style or data if required (thats how I prefer!)
 *
 * ```js
 * let geometry = new PIXI.Geometry();
 *
 * geometry.addAttribute('positions', [0, 0, 100, 0, 100, 100, 0, 100], 2);
 * geometry.addAttribute('uvs', [0,0,1,0,1,1,0,1],2)
 * geometry.addIndex([0,1,2,1,3,2])
 *
 * ```
 * @class
 * @memberof PIXI
 */
export default class MeshGeometry extends Geometry
{
    constructor(vertices, uvs, index)
    {
        super();

        const verticesBuffer = new Buffer(vertices);
        const uvsBuffer = new Buffer(uvs, true);
        const indexBuffer = new Buffer(index, true, true);

        this.addAttribute('aVertexPosition', verticesBuffer, 2, false, TYPES.FLOAT)
            .addAttribute('aTextureCoord', uvsBuffer, 2, false, TYPES.FLOAT)
            .addIndex(indexBuffer);
    }

    get vertexDirtyId()
    {
        return this.buffers[0]._updateID;
    }
}
