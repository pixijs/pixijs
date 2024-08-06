import { ExtensionType } from '../../../../extensions/Extensions';

import type { Renderer } from '../../types';
import type { System } from '../system/System';

/**
 * Options for the {@link TextureGCSystem}.
 * @memberof rendering
 * @property {boolean} [textureGCActive=true] - If set to true, this will enable the garbage collector on the GPU.
 * @property {number} [textureGCAMaxIdle=60 * 60] -
 * The maximum idle frames before a texture is destroyed by garbage collection.
 * @property {number} [textureGCCheckCountMax=600] - Frames between two garbage collections.
 */
export interface TextureGCSystemOptions
{
    /**
     * If set to true, this will enable the garbage collector on the GPU.
     * @default true
     * @memberof rendering.SharedRendererOptions
     */
    textureGCActive: boolean;
    /**
     * @deprecated since 8.3.0
     * @see {@link TextureGCSystem.textureGCMaxIdle}
     * @memberof rendering.SharedRendererOptions
     */
    textureGCAMaxIdle: number;
    /**
     * The maximum idle frames before a texture is destroyed by garbage collection.
     * @default 60 * 60
     * @memberof rendering.SharedRendererOptions
     */
    textureGCMaxIdle: number;
    /**
     * Frames between two garbage collections.
     * @default 600
     * @memberof rendering.SharedRendererOptions
     */
    textureGCCheckCountMax: number;
}
/**
 * System plugin to the renderer to manage texture garbage collection on the GPU,
 * ensuring that it does not get clogged up with textures that are no longer being used.
 * @memberof rendering
 */
export class TextureGCSystem implements System<TextureGCSystemOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'textureGC',
    } as const;

    /** default options for the TextureGCSystem */
    public static defaultOptions: TextureGCSystemOptions = {
        /**
         * If set to true, this will enable the garbage collector on the GPU.
         * @default true
         */
        textureGCActive: true,
        /**
         * @deprecated since 8.3.0
         * @see {@link TextureGCSystem.textureGCMaxIdle}
         */
        textureGCAMaxIdle: null,
        /**
         * The maximum idle frames before a texture is destroyed by garbage collection.
         * @default 60 * 60
         */
        textureGCMaxIdle: 60 * 60,
        /**
         * Frames between two garbage collections.
         * @default 600
         */
        textureGCCheckCountMax: 600,
    };

    /**
     * Frame count since started.
     * @readonly
     */
    public count: number;

    /**
     * Frame count since last garbage collection.
     * @readonly
     */
    public checkCount: number;

    /**
     * Maximum idle frames before a texture is destroyed by garbage collection.
     * @see TextureGCSystem.defaultMaxIdle
     */
    public maxIdle: number;

    /**
     * Frames between two garbage collections.
     * @see TextureGCSystem.defaultCheckCountMax
     */
    public checkCountMax: number;

    /**
     * Current garbage collection mode.
     * @see TextureGCSystem.defaultMode
     */
    public active: boolean;
    private _renderer: Renderer;

    /** @param renderer - The renderer this System works for. */
    constructor(renderer: Renderer)
    {
        this._renderer = renderer;

        this.count = 0;
        this.checkCount = 0;
    }

    public init(options: TextureGCSystemOptions): void
    {
        options = { ...TextureGCSystem.defaultOptions, ...options };

        this.checkCountMax = options.textureGCCheckCountMax;
        this.maxIdle = options.textureGCAMaxIdle ?? options.textureGCMaxIdle;
        this.active = options.textureGCActive;
    }

    /**
     * Checks to see when the last time a texture was used.
     * If the texture has not been used for a specified amount of time, it will be removed from the GPU.
     */
    protected postrender(): void
    {
        if (!this._renderer.renderingToScreen)
        {
            return;
        }

        this.count++;

        if (!this.active) return;

        this.checkCount++;

        if (this.checkCount > this.checkCountMax)
        {
            this.checkCount = 0;

            this.run();
        }
    }

    /**
     * Checks to see when the last time a texture was used.
     * If the texture has not been used for a specified amount of time, it will be removed from the GPU.
     */
    public run(): void
    {
        const managedTextures = this._renderer.texture.managedTextures;

        for (let i = 0; i < managedTextures.length; i++)
        {
            const texture = managedTextures[i];

            // Only supports non generated textures at the moment!
            if (
                texture.autoGarbageCollect
                && texture.resource
                && texture._touched > -1
                && this.count - texture._touched > this.maxIdle
            )
            {
                texture._touched = -1;
                texture.unload();
            }
        }
    }

    public destroy(): void
    {
        this._renderer = null as any as Renderer;
    }
}
