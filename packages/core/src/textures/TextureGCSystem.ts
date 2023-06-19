import { GC_MODES } from '@pixi/constants';
import { extensions, ExtensionType } from '@pixi/extensions';

import type { ExtensionMetadata } from '@pixi/extensions';
import type { Renderer } from '../Renderer';
import type { RenderTexture } from '../renderTexture/RenderTexture';
import type { ISystem } from '../system/ISystem';
import type { Texture } from './Texture';

export interface IUnloadableTexture
{
    _texture: Texture | RenderTexture;
    children: IUnloadableTexture[];
}

/**
 * System plugin to the renderer to manage texture garbage collection on the GPU,
 * ensuring that it does not get clogged up with textures that are no longer being used.
 * @memberof PIXI
 */
export class TextureGCSystem implements ISystem
{
    /**
     * Default garbage collection mode.
     * @static
     * @type {PIXI.GC_MODES}
     * @default PIXI.GC_MODES.AUTO
     * @see PIXI.TextureGCSystem#mode
     */
    public static defaultMode = GC_MODES.AUTO;

    /**
     * Default maximum idle frames before a texture is destroyed by garbage collection.
     * @static
     * @default 3600
     * @see PIXI.TextureGCSystem#maxIdle
     */
    public static defaultMaxIdle = 60 * 60;

    /**
     * Default frames between two garbage collections.
     * @static
     * @default 600
     * @see PIXI.TextureGCSystem#checkCountMax
     */
    public static defaultCheckCountMax = 60 * 10;

    /** @ignore */
    static extension: ExtensionMetadata = {
        type: ExtensionType.RendererSystem,
        name: 'textureGC',
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
     * @see PIXI.TextureGCSystem.defaultMaxIdle
     */
    public maxIdle: number;

    /**
     * Frames between two garbage collections.
     * @see PIXI.TextureGCSystem.defaultCheckCountMax
     */
    public checkCountMax: number;

    /**
     * Current garbage collection mode.
     * @see PIXI.TextureGCSystem.defaultMode
     */
    public mode: GC_MODES;
    private renderer: Renderer;

    /** @param renderer - The renderer this System works for. */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;

        this.count = 0;
        this.checkCount = 0;
        this.maxIdle = TextureGCSystem.defaultMaxIdle;
        this.checkCountMax = TextureGCSystem.defaultCheckCountMax;
        this.mode = TextureGCSystem.defaultMode;
    }

    /**
     * Checks to see when the last time a texture was used.
     * If the texture has not been used for a specified amount of time, it will be removed from the GPU.
     */
    protected postrender(): void
    {
        if (!this.renderer.objectRenderer.renderingToScreen)
        {
            return;
        }

        this.count++;

        if (this.mode === GC_MODES.MANUAL)
        {
            return;
        }

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
    run(): void
    {
        const tm = this.renderer.texture;
        const managedTextures = tm.managedTextures;
        let wasRemoved = false;

        for (let i = 0; i < managedTextures.length; i++)
        {
            const texture = managedTextures[i];

            // Only supports non generated textures at the moment!
            if (texture.resource && this.count - texture.touched > this.maxIdle)
            {
                tm.destroyTexture(texture, true);
                managedTextures[i] = null;
                wasRemoved = true;
            }
        }

        if (wasRemoved)
        {
            let j = 0;

            for (let i = 0; i < managedTextures.length; i++)
            {
                if (managedTextures[i] !== null)
                {
                    managedTextures[j++] = managedTextures[i];
                }
            }

            managedTextures.length = j;
        }
    }

    /**
     * Removes all the textures within the specified displayObject and its children from the GPU.
     * @param {PIXI.DisplayObject} displayObject - the displayObject to remove the textures from.
     */
    unload(displayObject: IUnloadableTexture): void
    {
        const tm = this.renderer.texture;
        const texture = displayObject._texture as RenderTexture;

        // only destroy non generated textures
        if (texture && !texture.framebuffer)
        {
            tm.destroyTexture(texture);
        }

        for (let i = displayObject.children.length - 1; i >= 0; i--)
        {
            this.unload(displayObject.children[i]);
        }
    }

    destroy(): void
    {
        this.renderer = null;
    }
}

extensions.add(TextureGCSystem);
