import { GlTexture } from '../../../gl/texture/GlTexture';
import { GPUTextureGpuData } from '../../../gpu/texture/GpuTextureSystem';
import { TextureSource } from './TextureSource';

import type { Renderer } from '../../../types';
import type { TextureSourceOptions } from './TextureSource';

/**
 * Options for creating an ExternalSource.
 * @category rendering
 * @advanced
 */
export interface ExternalSourceOptions extends TextureSourceOptions<GPUTexture | WebGLTexture>
{
    /**
     * The external GPU texture (GPUTexture for WebGPU, WebGLTexture for WebGL)
     * @advanced
     */
    resource: GPUTexture | WebGLTexture;
    /**
     * The renderer this texture will be used with
     * @advanced
     */
    renderer: Renderer;
    /**
     * Width of the texture. Auto-detected for GPUTexture, required for WebGLTexture.
     * @advanced
     */
    width?: number;
    /**
     * Height of the texture. Auto-detected for GPUTexture, required for WebGLTexture.
     * @advanced
     */
    height?: number;
}

/**
 * A texture source that uses a GPU texture from an external library (e.g., Three.js).
 *
 * This allows sharing textures between PixiJS and other WebGL/WebGPU libraries without
 * re-uploading pixel data. The renderer is required so that ExternalSource can
 * pre-populate the GPU data and validate context ownership.
 * @example
 * ```typescript
 * // WebGPU - dimensions auto-detected
 * const texture = new Texture({
 *     source: new ExternalSource({
 *         resource: threeJsGpuTexture,
 *         renderer: renderer,
 *     })
 * });
 *
 * // WebGL - must provide dimensions (WebGLTexture is opaque)
 * const texture = new Texture({
 *     source: new ExternalSource({
 *         resource: threeJsGlTexture,
 *         renderer: renderer,
 *         width: 512,
 *         height: 512,
 *     })
 * });
 *
 * // Update to a new external texture
 * (texture.source as ExternalSource).updateGPUTexture(newExternalTexture);
 * ```
 * @category rendering
 * @advanced
 */
export class ExternalSource extends TextureSource<GPUTexture | WebGLTexture>
{
    private readonly _renderer: Renderer;

    constructor(options: ExternalSourceOptions)
    {
        const { resource, renderer } = options;

        // Auto-detect dimensions for GPUTexture
        const width = options.width ?? (resource as GPUTexture).width;
        const height = options.height ?? (resource as GPUTexture).height;

        super({ ...options, width, height });

        this._renderer = renderer;

        // Pre-populate _gpuData - this is the key to avoiding special checks in texture systems
        this._initGpuData(resource);
    }

    /**
     * Test if a resource is a valid external GPU texture.
     * @param resource - The resource to test
     * @returns True if the resource is a GPUTexture or WebGLTexture
     */
    public static test(resource: unknown): resource is GPUTexture | WebGLTexture
    {
        return (
            (globalThis.GPUTexture && resource instanceof GPUTexture)
            || (globalThis.WebGLTexture && resource instanceof WebGLTexture)
        );
    }

    private _initGpuData(resource: GPUTexture | WebGLTexture): void
    {
        const renderer = this._renderer;

        if ((renderer as any).gpu)
        {
            // WebGPU
            this._gpuData[renderer.uid] = new GPUTextureGpuData(resource as GPUTexture);
        }
        else
        {
            // WebGL - validate context ownership
            const gl = (renderer as any).gl;

            if (gl && !gl.isTexture(resource as WebGLTexture))
            {
                throw new Error('WebGLTexture does not belong to this renderer\'s WebGL context');
            }
            this._gpuData[renderer.uid] = new GlTexture(resource as WebGLTexture);
        }
    }

    /**
     * Update the external GPU texture reference.
     * Call this when the external library provides a new texture.
     * @param gpuTexture - The new GPU texture
     */
    public updateGPUTexture(gpuTexture: GPUTexture | WebGLTexture): void
    {
        const renderer = this._renderer;
        const gpuData = this._gpuData[renderer.uid];

        if ((renderer as any).gpu)
        {
            // WebGPU - update and invalidate caches
            const data = gpuData as GPUTextureGpuData;

            if (data.gpuTexture !== gpuTexture)
            {
                data.gpuTexture = gpuTexture as GPUTexture;
                data.textureView = null;

                // Invalidate bind group hash
                const textureSystem = (renderer as any).texture;

                if (textureSystem?._bindGroupHash)
                {
                    textureSystem._bindGroupHash[this.uid] = null;
                }
            }

            // Update dimensions from GPUTexture
            this.pixelWidth = (gpuTexture as GPUTexture).width;
            this.pixelHeight = (gpuTexture as GPUTexture).height;
        }
        else
        {
            // WebGL - just update the texture reference
            const data = gpuData as GlTexture;

            data.texture = gpuTexture as WebGLTexture;
        }

        this.emit('update', this);
    }
}
