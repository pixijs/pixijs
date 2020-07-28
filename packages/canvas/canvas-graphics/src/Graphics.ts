import { Graphics } from '@pixi/graphics';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { RenderTexture, Texture } from '@pixi/core';
import { Matrix } from '@pixi/math';

import type { SCALE_MODES } from '@pixi/constants';
import type { BaseRenderTexture } from '@pixi/core';

let canvasRenderer: CanvasRenderer;
const tempMatrix = new Matrix();

/**
 * Generates a canvas texture. Only available with **pixi.js-legacy** bundle
 * or the **@pixi/canvas-graphics** package.
 * @method generateCanvasTexture
 * @memberof PIXI.Graphics#
 * @param {PIXI.SCALE_MODES} scaleMode - The scale mode of the texture.
 * @param {number} resolution - The resolution of the texture.
 * @return {PIXI.Texture} The new texture.
 */
Graphics.prototype.generateCanvasTexture = function generateCanvasTexture(scaleMode: SCALE_MODES, resolution = 1): Texture
{
    const bounds = this.getLocalBounds();

    const canvasBuffer = RenderTexture.create({
        width: bounds.width,
        height: bounds.height,
        scaleMode,
        resolution,
    });

    if (!canvasRenderer)
    {
        canvasRenderer = new CanvasRenderer();
    }

    this.transform.updateLocalTransform();
    this.transform.localTransform.copyTo(tempMatrix);

    tempMatrix.invert();

    tempMatrix.tx -= bounds.x;
    tempMatrix.ty -= bounds.y;

    canvasRenderer.render(this, canvasBuffer, true, tempMatrix);

    const texture = Texture.from((canvasBuffer.baseTexture as BaseRenderTexture)._canvasRenderTarget.canvas, {
        scaleMode,
    });

    texture.baseTexture.setResolution(resolution);

    return texture;
};

Graphics.prototype.cachedGraphicsData = [];

/**
 * Renders the object using the Canvas renderer
 *
 * @method _renderCanvas
 * @memberof PIXI.Graphics#
 * @private
 * @param {PIXI.CanvasRenderer} renderer - The renderer
 */
Graphics.prototype._renderCanvas = function _renderCanvas(renderer: CanvasRenderer): void
{
    if (this.isMask === true)
    {
        return;
    }

    this.finishPoly();
    renderer.plugins.graphics.render(this);
};
