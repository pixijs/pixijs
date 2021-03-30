import { BUFFER_TYPE } from '@pixi/constants/src';
import type { Dict } from '@pixi/utils';
import { Buffer } from '../geometry/Buffer';
import type { UniformsSyncCallback } from './utils';

let UID = 0;

/**
 * Uniform group holds uniform map and some ID's for work
 *
 * `UniformGroup` has two modes:
 *
 * 1: Normal mode
 * Normal mode will upload the uniforms with individual function calls as required
 *
 * 2: Uniform buffer mode
 * This mode will treat the uniforms as a uniform buffer. You can pass in either a buffer that you manually handle, or
 * or a generic object that PixiJS will automatically map to a buffer for you.
 * For maximum benefits, make Ubo UniformGroups static, and only update them each frame.
 *
 * Rules of UBOs:
 * - UBOs only work with WebGL2, so make sure you have a fallback!
 * - Only floats are supported (including vec[2,3,4], mat[2,3,4])
 * - Samplers cannot be used in ubo's (a GPU limitation)
 * - You must ensure that the object you pass in exactly matches in the shader ubo structure.
 * Otherwise, weirdness will ensue!
 * - The name of the ubo object added to the group must match exactly the name of the ubo in the shader.
 *
 * ```
 * // ubo in shader:
 * uniform myCoolData { // declaring a ubo..
 * mat4 uCoolMatrix;
 * float uFloatyMcFloatFace
 *
 *
 * // a new uniform buffer object..
 * const myCoolData = new UniformBufferGroup({
 *   uCoolMatrix: new Matrix(),
 *   uFloatyMcFloatFace: 23,
 * }}
 *
 * // build a shader...
 * const shader = Shader.from(srcVert, srcFrag, {
 *   myCoolData // name matches the ubo name in the shader. will be processed accordingly.
 * })
 *
 *  ```
 *
 * @class
 * @memberof PIXI
 */
export class UniformGroup<LAYOUT = Dict<any>>
{
    public readonly uniforms: LAYOUT;
    public readonly group: boolean;
    public id: number;
    syncUniforms: Dict<UniformsSyncCallback>;
    dirtyId: number;
    static: boolean;
    ubo: boolean;
    buffer?: Buffer;
    autoManage: boolean;

    /**
     * @param {object | Buffer} [uniforms] - Custom uniforms to use to augment the built-in ones. Or a pixi buffer
     * @param {boolean} [isStatic] - Uniforms wont be changed after creation
     * @param {boolean} [isUbo] - if true, will treat this uniform group as a uniform buffer object
     */
    constructor(uniforms: LAYOUT | Buffer, isStatic?: boolean, isUbo?: boolean)
    {
        /**
         * Its a group and not a single uniforms
         * @member {boolean}
         * @readonly
         * @default true
         */
        this.group = true;

        // lets generate this when the shader ?
        this.syncUniforms = {};

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
        this.static = !!isStatic;

        /**
         * Flags whether this group is treated like a uniform buffer object.
         * @member {boolean}
         */
        this.ubo = !!isUbo;

        if (uniforms instanceof Buffer)
        {
            this.buffer = uniforms;
            this.buffer.type = BUFFER_TYPE.UNIFORM_BUFFER;
            this.autoManage = false;
            this.ubo = true;
        }
        else
        {
            /**
             * uniform values
             * @member {object}
             * @readonly
             */
            this.uniforms = uniforms;

            if (this.ubo)
            {
                this.buffer = new Buffer(new Float32Array(1));
                this.buffer.type = BUFFER_TYPE.UNIFORM_BUFFER;
                this.autoManage = true;
            }
        }
    }

    update(): void
    {
        this.dirtyId++;

        if (!this.autoManage && this.buffer)
        {
            this.buffer.update();
        }
    }

    add(name: string, uniforms: Dict<any>, _static?: boolean): void
    {
        if (!this.ubo)
        {
            (this.uniforms as any)[name] = new UniformGroup(uniforms, _static);
        }
        else
        {
            // eslint-disable-next-line max-len
            throw new Error('[UniformGroup] uniform groups in ubo mode cannot be modified, or have uniform groups nested in them');
        }
    }

    static from(uniforms: Dict<any> | Buffer, _static?: boolean, _ubo?: boolean): UniformGroup
    {
        return new UniformGroup(uniforms, _static, _ubo);
    }

    /**
     * A short hand function for creating a static UBO UniformGroup.
     *
     * @param uniforms - the ubo item
     * @param _static - should this be updated each time it is used? defaults to true here!
     */
    static uboFrom(uniforms: Dict<any> | Buffer, _static?: boolean): UniformGroup
    {
        return new UniformGroup(uniforms, _static ?? true, true);
    }
}
