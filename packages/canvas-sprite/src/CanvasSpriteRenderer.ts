import { canvasUtils } from '@pixi/canvas-renderer';
import { BLEND_MODES, extensions, ExtensionType, groupD8, Matrix, SCALE_MODES } from '@pixi/core';

import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { ExtensionMetadata } from '@pixi/core';
import type { Sprite } from '@pixi/sprite';

const canvasRenderWorldTransform = new Matrix();

/**
 * Types that can be passed to drawImage
 * @typedef {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement|ImageBitmap} ICanvasImageSource
 * @memberof PIXI
 */

/*
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
 * @class
 * @protected
 * @memberof PIXI
 */
export class CanvasSpriteRenderer
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        name: 'sprite',
        type: ExtensionType.CanvasRendererPlugin,
    };

    /** A reference to the current renderer */
    protected renderer: CanvasRenderer;

    /** @param renderer - A reference to the current renderer */
    constructor(renderer: CanvasRenderer)
    {
        this.renderer = renderer;
    }

    /**
     * Renders the sprite object.
     * @param sprite - the sprite to render when using this spritebatch
     */
    render(sprite: Sprite): void
    {
        const texture = sprite._texture;
        const renderer = this.renderer;
        const context = renderer.canvasContext.activeContext;
        const activeResolution = renderer.canvasContext.activeResolution;

        if (!texture.valid)
        {
            return;
        }

        const sourceWidth = texture._frame.width;
        const sourceHeight = texture._frame.height;

        let destWidth = texture._frame.width;
        let destHeight = texture._frame.height;

        if (texture.trim)
        {
            destWidth = texture.trim.width;
            destHeight = texture.trim.height;
        }

        let wt = sprite.transform.worldTransform;
        let dx = 0;
        let dy = 0;

        const source = texture.baseTexture.getDrawableSource();

        if (texture.orig.width <= 0 || texture.orig.height <= 0 || !texture.valid || !source)
        {
            return;
        }

        renderer.canvasContext.setBlendMode(sprite.blendMode, true);

        context.globalAlpha = sprite.worldAlpha;

        // If smoothingEnabled is supported and we need to change the smoothing property for sprite texture
        const smoothingEnabled = texture.baseTexture.scaleMode === SCALE_MODES.LINEAR;
        const smoothProperty = renderer.canvasContext.smoothProperty;

        if (smoothProperty
            && context[smoothProperty] !== smoothingEnabled)
        {
            context[smoothProperty] = smoothingEnabled;
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

        dx -= destWidth / 2;
        dy -= destHeight / 2;

        renderer.canvasContext.setContextTransform(wt, sprite.roundPixels, 1);
        // Allow for pixel rounding
        if (sprite.roundPixels)
        {
            dx = dx | 0;
            dy = dy | 0;
        }

        const resolution = texture.baseTexture.resolution;

        const outerBlend = renderer.canvasContext._outerBlend;

        if (outerBlend)
        {
            context.save();
            context.beginPath();
            context.rect(
                dx * activeResolution,
                dy * activeResolution,
                destWidth * activeResolution,
                destHeight * activeResolution
            );
            context.clip();
        }

        if (sprite.tint !== 0xFFFFFF)
        {
            if (sprite._cachedTint !== sprite.tintValue || sprite._tintedCanvas.tintId !== sprite._texture._updateID)
            {
                sprite._cachedTint = sprite.tintValue;

                // TODO clean up caching - how to clean up the caches?
                sprite._tintedCanvas = canvasUtils.getTintedCanvas(sprite, sprite.tintValue);
            }

            context.drawImage(
                sprite._tintedCanvas,
                0,
                0,
                Math.floor(sourceWidth * resolution),
                Math.floor(sourceHeight * resolution),
                Math.floor(dx * activeResolution),
                Math.floor(dy * activeResolution),
                Math.floor(destWidth * activeResolution),
                Math.floor(destHeight * activeResolution)
            );
        }
        else
        {
            context.drawImage(
                source,
                texture._frame.x * resolution,
                texture._frame.y * resolution,
                Math.floor(sourceWidth * resolution),
                Math.floor(sourceHeight * resolution),
                Math.floor(dx * activeResolution),
                Math.floor(dy * activeResolution),
                Math.floor(destWidth * activeResolution),
                Math.floor(destHeight * activeResolution)
            );
        }

        if (outerBlend)
        {
            context.restore();
        }
        // just in case, leaking outer blend here will be catastrophic!
        renderer.canvasContext.setBlendMode(BLEND_MODES.NORMAL);
    }

    /** destroy the sprite object */
    destroy(): void
    {
        this.renderer = null;
    }
}

extensions.add(CanvasSpriteRenderer);
