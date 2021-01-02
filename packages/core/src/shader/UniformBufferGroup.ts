import { BUFFER_TYPE } from '@pixi/constants/src';
import type { Dict } from '@pixi/utils';
import { Buffer } from '../geometry/Buffer';
import { ViewableBuffer } from '../geometry/ViewableBuffer';
import type { UniformsSyncCallback } from './utils';

let UID = 2;

/**
 * Uniform buffer group is a way to wrk with WebGL2's uniform buffer objects
 *
 * IMPORTANT
 * This group, will auto manage the buffer is you pass on a generic object representing the data in the shader.
 * you mast add _all_ the elements otherwise it will generate the buffer and syncing incorrectly
 *
 * ```
 * // shader:
 *
 * uniform myCoolData {
 *    mat4 uCoolMatrix;
 *    float uFloatyMcFloatFace
 * }
 *
 * // js: You
 * const uniformBuffer = new UniformBuffer({
 *    uCoolMatrix:new Float32Array(16),
 *    uFloatyMcFloatFace: 23,
 * }}
 *
 * ```
 * @class
 * @memberof PIXI
 */
export class UniformBufferGroup
{
    public readonly uniforms: Dict<any>;
    public readonly group: boolean;
    public id: number;

    syncUniforms: UniformsSyncCallback;
    dirtyId: number;
    static: boolean;
    buffer: Buffer;
    ubo = true;
    autoManage:boolean;

    bufferView: ViewableBuffer;

    /**
     * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
     * @param {boolean} [_static] - Uniforms wont be changed after creation
     */
    constructor(uniforms: Dict<any> | Buffer, _static?: boolean)
    {
        /**
         * uniform values
         * @member {object}
         * @readonly
         */

        if (uniforms instanceof Buffer)
        {
            this.buffer = uniforms;
            this.buffer.type = BUFFER_TYPE.UNIFORM_BUFFER;
            this.autoManage = false;
        }
        else
        {
            this.uniforms = uniforms;
            this.buffer = new Buffer(new Float32Array(1));
            this.buffer.type = BUFFER_TYPE.UNIFORM_BUFFER;
            this.autoManage = true;
        }

        /**
         * Its a group and not a single uniforms
         * @member {boolean}
         * @readonly
         * @default true
         */
        this.group = true;

        /**
         * dirty version
         * @protected
         * @member {number}
         */
        this.dirtyId = 0;

        /**
         * unique id
         * @protected
         * @member {number}
         */
        this.id = UID++;

        /**
         * Uniforms wont be changed after creation
         * @member {boolean}
         */
        this.static = !!_static;
    }

    update(): void
    {
        this.dirtyId++;
    }

    static from(uniforms: Dict<any>, _static?: boolean): UniformBufferGroup
    {
        return new UniformBufferGroup(uniforms, _static);
    }
}
