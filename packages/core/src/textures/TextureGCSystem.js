import { System } from '../System';
import { GC_MODES } from '@pixi/constants';
import { settings } from '@pixi/settings';

/**
 * System plugin to the renderer to manage texture garbage collection on the GPU,
 * ensuring that it does not get clogged up with textures that are no longer being used.
 *
 * @class
 * @memberof PIXI.systems
 * @extends PIXI.System
 */
export class TextureGCSystem extends System
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer)
    {
        super(renderer);

        /**
         * Count
         * @member {number}
         * @readonly
         */
        this.count = 0;

        /**
         * Check count
         * @member {number}
         * @readonly
         */
        this.checkCount = 0;

        /**
         * Maximum idle time, in seconds
         * @member {number}
         * @see PIXI.settings.GC_MAX_IDLE
         */
        this.maxIdle = settings.GC_MAX_IDLE;

        /**
         * Maximum number of item to check
         * @member {number}
         * @see PIXI.settings.GC_MAX_CHECK_COUNT
         */
        this.checkCountMax = settings.GC_MAX_CHECK_COUNT;

        /**
         * Current garabage collection mode
         * @member {PIXI.GC_MODES}
         * @see PIXI.settings.GC_MODE
         */
        this.mode = settings.GC_MODE;
    }

    /**
     * Checks to see when the last time a texture was used
     * if the texture has not been used for a specified amount of time it will be removed from the GPU
     */
    postrender()
    {
        if (!this.renderer.renderingToScreen)
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
     * Checks to see when the last time a texture was used
     * if the texture has not been used for a specified amount of time it will be removed from the GPU
     */
    run()
    {
        const tm = this.renderer.texture;
        const managedTextures =  tm.managedTextures;
        let wasRemoved = false;

        for (let i = 0; i < managedTextures.length; i++)
        {
            const texture = managedTextures[i];

            // only supports non generated textures at the moment!
            if (!texture.framebuffer && this.count - texture.touched > this.maxIdle)
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
     * Removes all the textures within the specified displayObject and its children from the GPU
     *
     * @param {PIXI.DisplayObject} displayObject - the displayObject to remove the textures from.
     */
    unload(displayObject)
    {
        const tm = this.renderer.textureSystem;

        // only destroy non generated textures
        if (displayObject._texture && displayObject._texture._glRenderTargets)
        {
            tm.destroyTexture(displayObject._texture);
        }

        for (let i = displayObject.children.length - 1; i >= 0; i--)
        {
            this.unload(displayObject.children[i]);
        }
    }
}
