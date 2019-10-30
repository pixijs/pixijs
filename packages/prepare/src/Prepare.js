import { BaseTexture } from '@pixi/core';
import { Graphics } from '@pixi/graphics';
import { BasePrepare } from './BasePrepare';

/**
 * The prepare manager provides functionality to upload content to the GPU.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.plugins.prepare`
 *
 * @class
 * @extends PIXI.prepare.BasePrepare
 * @memberof PIXI.prepare
 */
export class Prepare extends BasePrepare
{
    /**
     * @param {PIXI.Renderer} renderer - A reference to the current renderer
     */
    constructor(renderer)
    {
        super(renderer);

        this.uploadHookHelper = this.renderer;

        // Add textures and graphics to upload
        this.registerFindHook(findGraphics);
        this.registerUploadHook(uploadBaseTextures);
        this.registerUploadHook(uploadGraphics);
    }
}
/**
 * Built-in hook to upload PIXI.Texture objects to the GPU.
 *
 * @private
 * @param {PIXI.Renderer} renderer - instance of the webgl renderer
 * @param {PIXI.BaseTexture} item - Item to check
 * @return {boolean} If item was uploaded.
 */
function uploadBaseTextures(renderer, item)
{
    if (item instanceof BaseTexture)
    {
        // if the texture already has a GL texture, then the texture has been prepared or rendered
        // before now. If the texture changed, then the changer should be calling texture.update() which
        // reuploads the texture without need for preparing it again
        if (!item._glTextures[renderer.CONTEXT_UID])
        {
            renderer.texture.bind(item);
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
function uploadGraphics(renderer, item)
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
        renderer.geometry.bind(geometry, item._resolveDirectShader());
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
function findGraphics(item, queue)
{
    if (item instanceof Graphics)
    {
        queue.push(item);

        return true;
    }

    return false;
}
