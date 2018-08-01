import { TYPES } from '@pixi/constants';
import Geometry from './Geometry';
import Buffer from './Buffer';

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
export default class Geometry2d extends Geometry
{
    /**
     * @param {array} [buffers]  an array of buffers. optional.
     * @param {object} [attributes] of the geometry, optional structure of the attributes layout
     */
    constructor(_static = false)
    {
        super();

        this._buffer = new Buffer(null, _static, false);
        this._indexBuffer = new Buffer(null, _static, true);

        this.addAttribute('aVertexPosition', this._buffer, 2, false, TYPES.FLOAT)
            .addAttribute('aTextureCoord', this._buffer, 2, false, TYPES.FLOAT)
            .addAttribute('aColor', this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
            .addAttribute('aTextureId', this._buffer, 1, true, TYPES.FLOAT)
            .addIndex(this._indexBuffer);
    }
}
