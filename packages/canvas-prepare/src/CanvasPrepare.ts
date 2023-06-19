import { BaseTexture, extensions, ExtensionType, settings } from '@pixi/core';
import { BasePrepare } from '@pixi/prepare';

import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { ExtensionMetadata, ICanvas, ICanvasRenderingContext2D, IRenderer, ISystem } from '@pixi/core';
import type { IDisplayObjectExtended } from '@pixi/prepare';

const CANVAS_START_SIZE = 16;

/**
 * Built-in hook to upload PIXI.Texture objects to the GPU.
 * @private
 * @param prepare - Instance of CanvasPrepare
 * @param item - Item to check
 * @returns If item was uploaded.
 */
function uploadBaseTextures(prepare: IRenderer | BasePrepare, item: IDisplayObjectExtended): boolean
{
    const tempPrepare = prepare as CanvasPrepare;

    if (item instanceof BaseTexture)
    {
        const image = (item as any).source;

        // Sometimes images (like atlas images) report a size of zero, causing errors on windows phone.
        // So if the width or height is equal to zero then use the canvas size
        // Otherwise use whatever is smaller, the image dimensions or the canvas dimensions.
        const imageWidth = image.width === 0 ? tempPrepare.canvas.width : Math.min(tempPrepare.canvas.width, image.width);
        const imageHeight = image.height === 0 ? tempPrepare.canvas.height
            : Math.min(tempPrepare.canvas.height, image.height);

        // Only a small subsections is required to be drawn to have the whole texture uploaded to the GPU
        // A smaller draw can be faster.
        tempPrepare.ctx.drawImage(
            image, 0, 0, imageWidth, imageHeight, 0, 0,
            tempPrepare.canvas.width, tempPrepare.canvas.height
        );

        return true;
    }

    return false;
}

/**
 * The prepare manager provides functionality to upload content to the GPU.
 *
 * This cannot be done directly for Canvas like in WebGL, but the effect can be achieved by drawing
 * textures to an offline canvas. This draw call will force the texture to be moved onto the GPU.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.prepare`
 * @class
 * @extends PIXI.BasePrepare
 * @memberof PIXI
 */
export class CanvasPrepare extends BasePrepare implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        name: 'prepare',
        type: ExtensionType.CanvasRendererSystem,
    };

    /**
     * An offline canvas to render textures to
     * @internal
     */
    canvas: ICanvas;
    /**
     * The context to the canvas
     * @internal
     */
    ctx: ICanvasRenderingContext2D;

    /**
     * @param renderer - A reference to the current renderer
     */
    constructor(renderer: CanvasRenderer)
    {
        super(renderer);

        this.uploadHookHelper = this;

        this.canvas = settings.ADAPTER.createCanvas(
            CANVAS_START_SIZE,
            CANVAS_START_SIZE
        );

        this.ctx = this.canvas.getContext('2d');

        // Add textures to upload
        this.registerUploadHook(uploadBaseTextures);
    }

    /** Destroys the plugin, don't use after this */
    public destroy(): void
    {
        super.destroy();
        this.ctx = null;
        this.canvas = null;
    }
}

extensions.add(CanvasPrepare);
