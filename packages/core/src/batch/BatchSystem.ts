import { ObjectRenderer } from './ObjectRenderer';

import type { ISystem } from '../ISystem';
import type { Renderer } from '../Renderer';
import type { BaseTexture } from '../textures/BaseTexture';
import type { BatchTextureArray } from './BatchTextureArray';

/**
 * System plugin to the renderer to manage batching.
 *
 * @memberof PIXI
 */
export class BatchSystem implements ISystem
{
    /** An empty renderer. */
    public readonly emptyRenderer: ObjectRenderer;

    /** The currently active ObjectRenderer. */
    public currentRenderer: ObjectRenderer;
    private renderer: Renderer;

    /**
     * @param renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
        this.emptyRenderer = new ObjectRenderer(renderer);
        this.currentRenderer = this.emptyRenderer;
    }

    /**
     * Changes the current renderer to the one given in parameter
     *
     * @param objectRenderer - The object renderer to use.
     */
    setObjectRenderer(objectRenderer: ObjectRenderer): void
    {
        if (this.currentRenderer === objectRenderer)
        {
            return;
        }

        this.currentRenderer.stop();
        this.currentRenderer = objectRenderer;

        this.currentRenderer.start();
    }

    /**
     * This should be called if you wish to do some custom rendering
     * It will basically render anything that may be batched up such as sprites
     */
    flush(): void
    {
        this.setObjectRenderer(this.emptyRenderer);
    }

    /**
     * Reset the system to an empty renderer
     */
    reset(): void
    {
        this.setObjectRenderer(this.emptyRenderer);
    }

    /**
     * Handy function for batch renderers: copies bound textures in first maxTextures locations to array
     * sets actual _batchLocation for them
     *
     * @param arr - arr copy destination
     * @param maxTextures - number of copied elements
     */
    copyBoundTextures(arr: BaseTexture[], maxTextures: number): void
    {
        const { boundTextures } = this.renderer.texture;

        for (let i = maxTextures - 1; i >= 0; --i)
        {
            arr[i] = boundTextures[i] || null;
            if (arr[i])
            {
                arr[i]._batchLocation = i;
            }
        }
    }

    /**
     * Assigns batch locations to textures in array based on boundTextures state.
     * All textures in texArray should have `_batchEnabled = _batchId`,
     * and their count should be less than `maxTextures`.
     *
     * @param texArray - textures to bound
     * @param boundTextures - current state of bound textures
     * @param batchId - marker for _batchEnabled param of textures in texArray
     * @param maxTextures - number of texture locations to manipulate
     */
    boundArray(texArray: BatchTextureArray, boundTextures: Array<BaseTexture>,
        batchId: number, maxTextures: number): void
    {
        const { elements, ids, count } = texArray;
        let j = 0;

        for (let i = 0; i < count; i++)
        {
            const tex = elements[i];
            const loc = tex._batchLocation;

            if (loc >= 0 && loc < maxTextures
                && boundTextures[loc] === tex)
            {
                ids[i] = loc;
                continue;
            }

            while (j < maxTextures)
            {
                const bound = boundTextures[j];

                if (bound && bound._batchEnabled === batchId
                    && bound._batchLocation === j)
                {
                    j++;
                    continue;
                }

                ids[i] = j;
                tex._batchLocation = j;
                boundTextures[j] = tex;
                break;
            }
        }
    }

    /**
     * @ignore
     */
    destroy(): void
    {
        this.renderer = null;
    }
}
