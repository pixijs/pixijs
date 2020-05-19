import { SCALE_MODES, BLEND_MODES } from '@pixi/constants';
import { Matrix, groupD8 } from '@pixi/math';
import { canvasUtils } from '@pixi/canvas-renderer';

const canvasRenderWorldTransform = new Matrix();

/**
 * Types that can be passed to drawImage
 * @typedef {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap} ICanvasImageSource
 * @memberof PIXI
 */

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original PixiJS version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now
 * share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's CanvasSpriteRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/CanvasSpriteRenderer.java
 */

/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * @class
 * @protected
 * @memberof PIXI
 */
export class CanvasSpriteRenderer
{
    /**
     * @param {PIXI.Renderer} renderer -The renderer sprite this batch works for.
     */
    constructor(renderer)
    {
        this.renderer = renderer;
    }

    /**
     * Renders the sprite object.
     *
     * @param {PIXI.Sprite} sprite - the sprite to render when using this spritebatch
     */
    render(sprite)
    {
        const texture = sprite._texture;
        const renderer = this.renderer;
        const context = renderer.context;

        const width = texture._frame.width;
        const height = texture._frame.height;

        let wt = sprite.transform.worldTransform;
        let dx = 0;
        let dy = 0;

        const source = texture.baseTexture.getDrawableSource();

        if (texture.orig.width <= 0 || texture.orig.height <= 0 || !texture.valid || !source)
        {
            return;
        }

        if (!texture.valid)
        {
            return;
        }

        renderer.setBlendMode(sprite.blendMode, true);

        renderer.context.globalAlpha = sprite.worldAlpha;

        // If smoothingEnabled is supported and we need to change the smoothing property for sprite texture
        const smoothingEnabled = texture.baseTexture.scaleMode === SCALE_MODES.LINEAR;

        if (renderer.smoothProperty && renderer.context[renderer.smoothProperty] !== smoothingEnabled)
        {
            context[renderer.smoothProperty] = smoothingEnabled;
        }

        if (texture.trim)
        {
            dx = (texture.trim.width / 2) + texture.trim.x - (sprite.anchor.x * texture.orig.width);
            dy = (texture.trim.height / 2) + texture.trim.y - (sprite.anchor.y * texture.orig.height);
        }
        else
        {
            dx = (0.5 - sprite.anchor.x) * texture.orig.width;
            dy = (0.5 - sprite.anchor.y) * texture.orig.height;
        }

        if (texture.rotate)
        {
            wt.copyTo(canvasRenderWorldTransform);
            wt = canvasRenderWorldTransform;
            groupD8.matrixAppendRotationInv(wt, texture.rotate, dx, dy);
            // the anchor has already been applied above, so lets set it to zero
            dx = 0;
            dy = 0;
        }

        dx -= width / 2;
        dy -= height / 2;

        renderer.setContextTransform(wt, sprite.roundPixels, 1);
        // Allow for pixel rounding
        if (sprite.roundPixels)
        {
            dx = dx | 0;
            dy = dy | 0;
        }

        const resolution = texture.baseTexture.resolution;
        const outerBlend = renderer._outerBlend;

        if (outerBlend)
        {
            context.save();
            context.beginPath();
            context.rect(
                dx * renderer.resolution,
                dy * renderer.resolution,
                width * renderer.resolution,
                height * renderer.resolution
            );
            context.clip();
        }

        if (sprite.tint !== 0xFFFFFF)
        {
            if (sprite._cachedTint !== sprite.tint || sprite._tintedCanvas.tintId !== sprite._texture._updateID)
            {
                sprite._cachedTint = sprite.tint;

                // TODO clean up caching - how to clean up the caches?
                sprite._tintedCanvas = canvasUtils.getTintedCanvas(sprite, sprite.tint);
            }

            context.drawImage(
                sprite._tintedCanvas,
                0,
                0,
                Math.floor(width * resolution),
                Math.floor(height * resolution),
                Math.floor(dx * renderer.resolution),
                Math.floor(dy * renderer.resolution),
                Math.floor(width * renderer.resolution),
                Math.floor(height * renderer.resolution)
            );
        }
        else
        {
            context.drawImage(
                source,
                texture._frame.x * resolution,
                texture._frame.y * resolution,
                Math.floor(width * resolution),
                Math.floor(height * resolution),
                Math.floor(dx * renderer.resolution),
                Math.floor(dy * renderer.resolution),
                Math.floor(width * renderer.resolution),
                Math.floor(height * renderer.resolution)
            );
        }

        if (outerBlend)
        {
            context.restore();
        }
        // just in case, leaking outer blend here will be catastrophic!
        renderer.setBlendMode(BLEND_MODES.NORMAL);
    }

    /**
     * destroy the sprite object.
     *
     */
    destroy()
    {
        this.renderer = null;
    }
}
