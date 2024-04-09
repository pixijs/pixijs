import { uid } from '../../../../utils/data/uid';
import { createIdFromString } from '../utils/createIdFromString';
import { getDefaultUniformValue } from './utils/getDefaultUniformValue';

import type { BindResource } from '../../gpu/shader/BindResource';
import type { Buffer } from '../buffer/Buffer';
import type { UniformData } from './types';

type FLOPS<T = UniformData> = T extends { value: infer V } ? V : never;

// TODO replace..T['value']
type ExtractUniformObject<T = Record<string, UniformData>> = {
    [K in keyof T]: FLOPS<T[K]>;
};

/**
 * Uniform group options
 * @memberof rendering
 */
export type UniformGroupOptions = {
    /**
     * if true the UniformGroup is handled as an Uniform buffer object.
     * This is the only way WebGPU can work with uniforms. WebGL2 can also use this.
     * So don't set to true if you want to use WebGPU :D
     */
    ubo?: boolean;
    /** if true, then you are responsible for when the data is uploaded to the GPU by calling `update()` */
    isStatic?: boolean;
};

/**
 * Uniform group holds uniform map and some ID's for work
 *
 * `UniformGroup` has two modes:
 *
 * 1: Normal mode
 * Normal mode will upload the uniforms with individual function calls as required. This is the default mode
 * for WebGL rendering.
 *
 * 2: Uniform buffer mode
 * This mode will treat the uniforms as a uniform buffer. You can pass in either a buffer that you manually handle, or
 * or a generic object that PixiJS will automatically map to a buffer for you.
 * For maximum benefits, make Ubo UniformGroups static, and only update them each frame.
 * This is the only way uniforms can be used with WebGPU.
 *
 * Rules of UBOs:
 * - UBOs only work with WebGL2, so make sure you have a fallback!
 * - Only floats are supported (including vec[2,3,4], mat[2,3,4])
 * - Samplers cannot be used in ubo's (a GPU limitation)
 * - You must ensure that the object you pass in exactly matches in the shader ubo structure.
 * Otherwise, weirdness will ensue!
 * - The name of the ubo object added to the group must match exactly the name of the ubo in the shader.
 *
 * When declaring your uniform options, you ust parse in the value and the type of the uniform.
 * The types correspond to the WebGPU types {@link UNIFORM_TYPES}
 *
 Uniforms can be modified via the classes 'uniforms' property. It will contain all the uniforms declared in the constructor.
 *
 * ```glsl
 * // UBO in shader:
 * uniform myCoolData { // Declaring a UBO...
 *     mat4 uCoolMatrix;
 *     float uFloatyMcFloatFace;
 * };
 * ```
 *
 * ```js
 * // A new Uniform Buffer Object...
 * const myCoolData = new UniformGroup({
 *     uCoolMatrix: {value:new Matrix(), type: 'mat4<f32>'},
 *     uFloatyMcFloatFace: {value:23, type: 'f32'},
 * }}
 *
 * // modify the data
 * myCoolData.uniforms.uFloatyMcFloatFace = 42;
 * // Build a shader...
 * const shader = Shader.from(srcVert, srcFrag, {
 *     myCoolData // Name matches the UBO name in the shader. Will be processed accordingly.
 * })
 *
 *
 *  ```
 * @memberof rendering
 */
export class UniformGroup<UNIFORMS extends { [key: string]: UniformData } = any> implements BindResource
{
    /** The default options used by the uniform group. */
    public static defaultOptions: UniformGroupOptions = {
        /** if true the UniformGroup is handled as an Uniform buffer object. */
        ubo: false,
        /** if true, then you are responsible for when the data is uploaded to the GPU by calling `update()` */
        isStatic: false,
    };

    /** used internally to know if a uniform group was used in the last render pass */
    public _touched = 0;

    /** a unique id for this uniform group used through the renderer */
    public readonly uid = uid('uniform');
    /** a resource type, used to identify how to handle it when its in a bind group / shader resource */
    public _resourceType = 'uniformGroup';
    /** the resource id used internally by the renderer to build bind group keys */
    public _resourceId = uid('resource');
    /** the structures of the uniform group */
    public uniformStructures: UNIFORMS;
    /** the uniforms as an easily accessible map of properties */
    public uniforms: ExtractUniformObject<UNIFORMS>;
    /** true if it should be used as a uniform buffer object */
    public ubo: boolean;
    /** an underlying buffer that will be uploaded to the GPU when using this UniformGroup */
    public buffer?: Buffer;
    /**
     * if true, then you are responsible for when the data is uploaded to the GPU.
     * otherwise, the data is reuploaded each frame.
     */
    public isStatic: boolean;
    /** used ito identify if this is a uniform group */
    public readonly isUniformGroup = true;
    /**
     * used to flag if this Uniform groups data is different from what it has stored in its buffer / on the GPU
     * @internal
     * @ignore
     */
    public _dirtyId = 0;
    /**
     * a signature string generated for internal use
     * @internal
     * @ignore
     */
    public readonly _signature: number;

    // implementing the interface - UniformGroup are not destroyed
    public readonly destroyed = false;

    /**
     * Create a new Uniform group
     * @param uniformStructures - The structures of the uniform group
     * @param options - The optional parameters of this uniform group
     */
    constructor(uniformStructures: UNIFORMS, options?: UniformGroupOptions)
    {
        options = { ...UniformGroup.defaultOptions, ...options };

        this.uniformStructures = uniformStructures;

        const uniforms = {} as ExtractUniformObject<UNIFORMS>;

        for (const i in uniformStructures)
        {
            const uniformData = uniformStructures[i] as UniformData;

            uniformData.name = i;
            uniformData.size = uniformData.size ?? 1;
            uniformData.value ??= getDefaultUniformValue(uniformData.type, uniformData.size);

            uniforms[i] = uniformData.value as ExtractUniformObject<UNIFORMS>[keyof UNIFORMS];
        }

        this.uniforms = uniforms;

        this._dirtyId = 1;
        this.ubo = options.ubo;
        this.isStatic = options.isStatic;

        this._signature = createIdFromString(Object.keys(uniforms).map(
            (i) => `${i}-${(uniformStructures[i as keyof typeof uniformStructures] as UniformData).type}`
        ).join('-'), 'uniform-group');
    }

    /** Call this if you want the uniform groups data to be uploaded to the GPU only useful if `isStatic` is true. */
    public update(): void
    {
        this._dirtyId++;
        // dispatch...
    }
}
