import { System } from '../System';
import { ObjectRenderer } from './ObjectRenderer';

import type { Renderer } from '../Renderer';
import type { BaseTexture } from '../textures/BaseTexture';
import type { BatchTextureArray } from './BatchTextureArray';
/**
 * System plugin to the renderer to manage batching.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
export class BatchSystem extends System
{
    public readonly emptyRenderer: ObjectRenderer;
    public currentRenderer: ObjectRenderer;

    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        /**
         * An empty renderer.
         *
         * @member {PIXI.ObjectRenderer}
         */
        this.emptyRenderer = new ObjectRenderer(renderer);

        /**
         * The currently active ObjectRenderer.
         *
         * @member {PIXI.ObjectRenderer}
         */
        this.currentRenderer = this.emptyRenderer;
    }

    /**
     * Changes the current renderer to the one given in parameter
     *
     * @param {PIXI.ObjectRenderer} objectRenderer - The object renderer to use.
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
     * @param {PIXI.BaseTexture[]} arr copy destination
     * @param {number} maxTextures number of copied elements
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
     * @param {PIXI.BatchTextureArray} texArray textures to bound
     * @param {PIXI.BaseTexture[]} boundTextures current state of bound textures
     * @param {number} batchId marker for _batchEnabled param of textures in texArray
     * @param {number} maxTextures number of texture locations to manipulate
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
}
