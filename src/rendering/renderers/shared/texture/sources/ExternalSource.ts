import { GlTexture } from '../../../gl/texture/GlTexture';
import { GPUTextureGpuData } from '../../../gpu/texture/GpuTextureSystem';
import { TextureSource } from './TextureSource';

import type { Renderer } from '../../../types';

/**
 * Options for creating an ExternalSource.
 * @category rendering
 * @advanced
 */
export interface ExternalSourceOptions
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
    /**
     * Optional label for debugging
     * @advanced
     */
    label?: string;
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
        const { resource, renderer, label } = options;

        // Auto-detect dimensions for GPUTexture (WebGLTexture is opaque, requires explicit dimensions)
        const width = options.width ?? (resource as GPUTexture).width;
        const height = options.height ?? (resource as GPUTexture).height;

        // Only pass the minimal required options to TextureSource
        super({
            resource,
            width,
            height,
            label,
            // External textures shouldn't be garbage collected - the external library owns them
            autoGarbageCollect: false,
        });

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

    private _validateTexture(resource: GPUTexture | WebGLTexture): void
    {
        const renderer = this._renderer;
        const isWebGPU = !!(renderer as any).gpu;
        const isGPUTexture = globalThis.GPUTexture && resource instanceof GPUTexture;
        const isWebGLTexture = globalThis.WebGLTexture && resource instanceof WebGLTexture;

        if (isWebGPU && isWebGLTexture)
        {
            throw new Error('Cannot use WebGLTexture with a WebGPU renderer');
        }

        if (!isWebGPU && isGPUTexture)
        {
            throw new Error('Cannot use GPUTexture with a WebGL renderer');
        }

        // WebGL context ownership check
        if (!isWebGPU)
        {
            const gl = (renderer as any).gl;

            if (gl && !gl.isTexture(resource as WebGLTexture))
            {
                throw new Error('WebGLTexture does not belong to this renderer\'s WebGL context');
            }
        }
    }

    private _initGpuData(resource: GPUTexture | WebGLTexture): void
    {
        const renderer = this._renderer;

        this._validateTexture(resource);

        if ((renderer as any).gpu)
        {
            // WebGPU
            this._gpuData[renderer.uid] = new GPUTextureGpuData(resource as GPUTexture);
        }
        else
        {
            // WebGL
            this._gpuData[renderer.uid] = new GlTexture(resource as WebGLTexture);
        }
    }

    /**
     * Update the external GPU texture reference.
     * Call this when the external library provides a new texture.
     * @param gpuTexture - The new GPU texture
     * @param width - New width (required for WebGLTexture, auto-detected for GPUTexture)
     * @param height - New height (required for WebGLTexture, auto-detected for GPUTexture)
     */
    public updateGPUTexture(gpuTexture: GPUTexture | WebGLTexture, width?: number, height?: number): void
    {
        const renderer = this._renderer;
        const gpuData = this._gpuData[renderer.uid];

        if ((renderer as any).gpu)
        {
            // WebGPU - validate and update
            this._validateTexture(gpuTexture);

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

            // Update dimensions from GPUTexture (or use provided values)
            const newWidth = width ?? (gpuTexture as GPUTexture).width;
            const newHeight = height ?? (gpuTexture as GPUTexture).height;

            this.resize(newWidth, newHeight);
        }
        else
        {
            // WebGL - validate and update the texture reference
            this._validateTexture(gpuTexture);

            const data = gpuData as GlTexture;

            data.texture = gpuTexture as WebGLTexture;

            // WebGL: dimensions must be provided (WebGLTexture is opaque)
            if (width !== undefined && height !== undefined)
            {
                this.resize(width, height);
            }
        }

        this.emit('update', this);
    }
}
