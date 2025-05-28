import { ExtensionType } from '../../../extensions/Extensions';
import { checkMaxIfStatementsInShader } from '../../batcher/gl/utils/checkMaxIfStatementsInShader';
import { type System } from '../shared/system/System';

import type { WebGLRenderer } from './WebGLRenderer';
/**
 * The GpuLimitsSystem provides information about the capabilities and limitations of the underlying GPU.
 * These limits, such as the maximum number of textures that can be used in a shader
 * (`maxTextures`) or the maximum number of textures that can be batched together (`maxBatchableTextures`),
 * are determined by the specific graphics hardware and driver.
 *
 * The values for these limits are not available immediately upon instantiation of the class.
 * They are populated when the GL rendering context is successfully initialized and ready,
 * which occurs after the `renderer.init()` method has completed.
 * Attempting to access these properties before the context is ready will result in undefined or default values.
 *
 * This system allows the renderer to adapt its behavior and resource allocation strategies
 * to stay within the supported boundaries of the GPU, ensuring optimal performance and stability.
 * @example
 * ```ts
 * const renderer = new WebGlRenderer();
 * await renderer.init();
 *
 * console.log(renderer.limits.maxTextures);
 * ```
 * @category rendering
 * @advanced
 */
export class GlLimitsSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'limits',
    } as const;

    /** The maximum number of textures that can be used by a shader */
    public maxTextures: number;
    /** The maximum number of batchable textures */
    public maxBatchableTextures: number;

    /** The maximum number of uniform bindings */
    public maxUniformBindings: number;

    private readonly _renderer: WebGLRenderer;

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
    }

    public contextChange(): void
    {
        const gl = this._renderer.gl;

        // step 1: first check max textures the GPU can handle.
        this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

        // step 2: check the maximum number of if statements the shader can have too..
        this.maxBatchableTextures = checkMaxIfStatementsInShader(this.maxTextures, gl);

        this.maxUniformBindings = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
    }

    public destroy(): void
    {
        // boom!
    }
}
