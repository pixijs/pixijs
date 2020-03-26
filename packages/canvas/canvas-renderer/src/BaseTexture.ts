import { BaseTexture, BaseRenderTexture, Texture } from '@pixi/core';

/**
 * Get the drawable source, such as HTMLCanvasElement or HTMLImageElement suitable
 * for rendering with CanvasRenderer. Provided by **@pixi/canvas-renderer** package.
 * @method getDrawableSource
 * @memberof PIXI.BaseTexture#
 * @return {PIXI.ICanvasImageSource} Source to render with CanvasRenderer
 */
BaseTexture.prototype.getDrawableSource = function getDrawableSource(): CanvasImageSource
{
    const resource = this.resource as any;

    return resource ? (resource.bitmap || resource.source) : null;
};

/**
 * A reference to the canvas render target (we only need one as this can be shared across renderers)
 *
 * @protected
 * @member {PIXI.utils.CanvasRenderTarget} _canvasRenderTarget
 * @memberof PIXI.BaseRenderTexture#
 */

BaseRenderTexture.prototype._canvasRenderTarget = null;

Texture.prototype.patternCache = null;

Texture.prototype.tintCache = null;
