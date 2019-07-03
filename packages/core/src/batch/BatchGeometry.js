import Buffer from '../geometry/Buffer';
import builtinAttributeDefinitions from './utils/builtinAttributeDefinitions';
import Geometry from '../geometry/Geometry';
import { TYPES } from '@pixi/constants';

const defaultAttributes = [
    {
        property: 'vertexData',
        name: 'aVertexPosition',
        type: 'float32',
        size: 2,
        glType: TYPES.FLOAT,
        glSize: 2,
    },
    {
        property: 'uvs',
        name: 'aTextureCoord',
        type: 'float32',
        size: 2,
        glType: TYPES.FLOAT,
        glSize: 2,
    },
    'aColor', // built-in attribute
    'aTextureId',
];

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
     * @param {Array<PIXI.AttributeDefinition>} attributeDefinitions - attribute definitions
     */
    constructor(_static = false, attributeDefinitions = defaultAttributes)
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
        for (let i = 0; i < attributeDefinitions.length; i++)
        {
            const def = attributeDefinitions[i];

            if (def === 'aColor')
            { // special
                this.addAttribute('aColor', this._buffer, 4, true, TYPES.UNSIGNED_BYTE);
                continue;
            }

            const isBuiltin = (typeof def === 'string');
            const identifier = isBuiltin ? def : def.name;
            const size = isBuiltin ? builtinAttributeDefinitions[identifier].glSize : def.glSize;
            const type = isBuiltin ? builtinAttributeDefinitions[identifier].glType : def.glType;

            this.addAttribute(identifier, this._buffer, size, def === 'aTextureId', type);
        }

        this.addIndex(this._indexBuffer);
    }
}
