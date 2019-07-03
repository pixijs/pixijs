import Buffer from '../geometry/Buffer';
import builtinAttributeSizes from './utils/builtinAttributeSizes';
import Geometry from '../geometry/Geometry';
import { TYPES } from '@pixi/constants';

/**
 * Geometry used to batch standard PIXI content (e.g. Mesh, Sprite,
 * Graphics objects).
 *
 * @class
 * @memberof PIXI
 */
export default class BatchGeometry extends Geometry
{
    /**
     * @param {boolean} [_static=false] Optimization flag, where `false`
     *        is updated every frame, `true` doesn't change frame-to-frame.
     * @param {Object[]} attributeDefinitions - attribute definitions
     */
    constructor(_static = false, attributeDefinitions)
    {
        super();

        /**
         * Buffer used for position, color, texture IDs
         *
         * @member {PIXI.Buffer}
         * @protected
         */
        this._buffer = new Buffer(null, _static, false);

        /**
         * Index buffer data
         *
         * @member {PIXI.Buffer}
         * @protected
         */
        this._indexBuffer = new Buffer(null, _static, true);

        /* These are automatically interleaved by GeometrySystem. */
        attributeDefinitions.forEach((def) =>
        {
            if (def === 'aColor')
            { // special
                this.addAttribute('aColor', this._buffer, 4, true, TYPES.UNSIGNED_BYTE);

                return;
            }

            const isBuiltin = (typeof def === 'string');
            const identifier = isBuiltin ? def : def.name;
            const size = isBuiltin ? builtinAttributeSizes[identifier] : def.glSize;

            this.addAttribute(identifier, this._buffer, size, def === 'aTextureId', def.glType);
        });

        this.addIndex(this._indexBuffer);
    }
}
