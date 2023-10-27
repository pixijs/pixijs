import { extensions, ExtensionType } from '../../../../extensions/Extensions';

import type { Renderer } from '../../types';
import type { System } from '../system/System';

export interface TextureGCSystemOptions
{
    textureGCActive: boolean;
    textureGCAMaxIdle: number;
    textureGCCheckCountMax: number;
}
/**
 * System plugin to the renderer to manage texture garbage collection on the GPU,
 * ensuring that it does not get clogged up with textures that are no longer being used.
 */
export class TextureGCSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'textureGC',
    } as const;

    public static defaultOptions: TextureGCSystemOptions = {
        textureGCActive: true,
        textureGCAMaxIdle: 60 * 60,
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
        this.maxIdle = options.textureGCAMaxIdle;
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
            if (texture.resource && texture._touched > -1 && this.count - texture._touched > this.maxIdle)
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

extensions.add(TextureGCSystem);
