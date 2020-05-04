import { BaseTexture } from '@pixi/core';
import { Graphics } from '@pixi/graphics';
import { BasePrepare, IDisplayObjectExtended } from './BasePrepare';

import type { AbstractRenderer, Renderer } from '@pixi/core';

/**
 * Built-in hook to upload PIXI.Texture objects to the GPU.
 *
 * @private
 * @param {PIXI.Renderer} renderer - instance of the webgl renderer
 * @param {PIXI.BaseTexture} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function uploadBaseTextures(renderer: AbstractRenderer | BasePrepare, item: IDisplayObjectExtended | BaseTexture): boolean
{
    if (item instanceof BaseTexture)
    {
        // if the texture already has a GL texture, then the texture has been prepared or rendered
        // before now. If the texture changed, then the changer should be calling texture.update() which
        // reuploads the texture without need for preparing it again
        if (!item._glTextures[(renderer as Renderer).CONTEXT_UID])
        {
            (renderer as Renderer).texture.bind(item);
        }

        return true;
    }

    return false;
}

/**
 * Built-in hook to upload PIXI.Graphics to the GPU.
 *
 * @private
 * @param {PIXI.Renderer} renderer - instance of the webgl renderer
 * @param {PIXI.DisplayObject} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function uploadGraphics(renderer: AbstractRenderer | BasePrepare, item: IDisplayObjectExtended): boolean
{
    if (!(item instanceof Graphics))
    {
        return false;
    }

    const { geometry } = item;

    // update dirty graphics to get batches
    item.finishPoly();
    geometry.updateBatches();

    const { batches } = geometry;

    // upload all textures found in styles
    for (let i = 0; i < batches.length; i++)
    {
        const { texture } = batches[i].style;

        if (texture)
        {
            uploadBaseTextures(renderer, texture.baseTexture);
        }
    }

    // if its not batchable - update vao for particular shader
    if (!geometry.batchable)
    {
        (renderer as Renderer).geometry.bind(geometry, (item as any)._resolveDirectShader((renderer as Renderer)));
    }

    return true;
}

/**
 * Built-in hook to find graphics.
 *
 * @private
 * @param {PIXI.DisplayObject} item - Display object to check
 * @param {Array<*>} queue - Collection of items to upload
 * @return {boolean} if a PIXI.Graphics object was found.
 */
function findGraphics(item: IDisplayObjectExtended, queue: Array<any>): boolean
{
    if (item instanceof Graphics)
    {
        queue.push(item);

        return true;
    }

    return false;
}

/**
 * The prepare plugin provides renderer-specific plugins for pre-rendering DisplayObjects. These plugins are useful for
 * asynchronously preparing and uploading to the GPU assets, textures, graphics waiting to be displayed.
 *
 * Do not instantiate this plugin directly. It is available from the `renderer.plugins` property.
 * See {@link PIXI.CanvasRenderer#plugins} or {@link PIXI.Renderer#plugins}.
 * @example
 * // Create a new application
 * const app = new PIXI.Application();
 * document.body.appendChild(app.view);
 *
 * // Don't start rendering right away
 * app.stop();
 *
 * // create a display object
 * const rect = new PIXI.Graphics()
 *     .beginFill(0x00ff00)
 *     .drawRect(40, 40, 200, 200);
 *
 * // Add to the stage
 * app.stage.addChild(rect);
 *
 * // Don't start rendering until the graphic is uploaded to the GPU
 * app.renderer.plugins.prepare.upload(app.stage, () => {
 *     app.start();
 * });
 *
 * @class
 * @extends PIXI.BasePrepare
 * @memberof PIXI
 */
export class Prepare extends BasePrepare
{
    /**
     * @param {PIXI.Renderer} renderer - A reference to the current renderer
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        this.uploadHookHelper = this.renderer;

        // Add textures and graphics to upload
        this.registerFindHook(findGraphics);
        this.registerUploadHook(uploadBaseTextures);
        this.registerUploadHook(uploadGraphics);
    }
}
