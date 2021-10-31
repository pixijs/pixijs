import { TYPES } from '@pixi/constants';
import { Geometry } from '../geometry/Geometry';
import { Buffer } from '../geometry/Buffer';

/**
 * Geometry used to batch standard PIXI content (e.g. Mesh, Sprite, Graphics objects).
 *
 * @memberof PIXI
 */
export class BatchGeometry extends Geometry
{
    /**
     * Buffer used for position, color, texture IDs
     *
     * @protected
     */
    _buffer: Buffer;

    /**
     * Index buffer data
     *
     * @protected
     */
    _indexBuffer: Buffer;

    /**
     * @param {boolean} [_static=false] - Optimization flag, where `false`
     *        is updated every frame, `true` doesn't change frame-to-frame.
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
