import CanvasRenderer from '../../renderers/canvas/CanvasRenderer';
import { SCALE_MODES } from '../../const';
import { Matrix, GroupD8 } from '../../math';
import CanvasTinter from './CanvasTinter';

const canvasRenderWorldTransform = new Matrix();

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
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
 * @private
 * @memberof PIXI
 */
export default class CanvasSpriteRenderer
{
    /**
     * @param {PIXI.WebGLRenderer} renderer -The renderer sprite this batch works for.
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

        const width = texture._frame.width;
        const height = texture._frame.height;

        let wt = sprite.transform.worldTransform;
        let dx = 0;
        let dy = 0;

        if (texture.orig.width <= 0 || texture.orig.height <= 0 || !texture.baseTexture.source)
        {
            return;
        }

        renderer.setBlendMode(sprite.blendMode);

        //  Ignore null sources
        if (texture.valid)
        {
            renderer.context.globalAlpha = sprite.worldAlpha;

            // If smoothingEnabled is supported and we need to change the smoothing property for sprite texture
            const smoothingEnabled = texture.baseTexture.scaleMode === SCALE_MODES.LINEAR;

            if (renderer.smoothProperty && renderer.context[renderer.smoothProperty] !== smoothingEnabled)
            {
                renderer.context[renderer.smoothProperty] = smoothingEnabled;
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
                wt.copy(canvasRenderWorldTransform);
                wt = canvasRenderWorldTransform;
                GroupD8.matrixAppendRotationInv(wt, texture.rotate, dx, dy);
                // the anchor has already been applied above, so lets set it to zero
                dx = 0;
                dy = 0;
            }

            dx -= width / 2;
            dy -= height / 2;

            // Allow for pixel rounding
            if (renderer.roundPixels)
            {
                renderer.context.setTransform(
                    wt.a,
                    wt.b,
                    wt.c,
                    wt.d,
                    (wt.tx * renderer.resolution) | 0,
                    (wt.ty * renderer.resolution) | 0
                );

                dx = dx | 0;
                dy = dy | 0;
            }
            else
            {
                renderer.context.setTransform(
                    wt.a,
                    wt.b,
                    wt.c,
                    wt.d,
                    wt.tx * renderer.resolution,
                    wt.ty * renderer.resolution
                );
            }

            const resolution = texture.baseTexture.resolution;

            if (sprite.tint !== 0xFFFFFF)
            {
                if (sprite.cachedTint !== sprite.tint)
                {
                    sprite.cachedTint = sprite.tint;

                    // TODO clean up caching - how to clean up the caches?
                    sprite.tintedTexture = CanvasTinter.getTintedTexture(sprite, sprite.tint);
                }

                renderer.context.drawImage(
                    sprite.tintedTexture,
                    0,
                    0,
                    width * resolution,
                    height * resolution,
                    dx * renderer.resolution,
                    dy * renderer.resolution,
                    width * renderer.resolution,
                    height * renderer.resolution
                );
            }
            else
            {
                renderer.context.drawImage(
                    texture.baseTexture.source,
                    texture._frame.x * resolution,
                    texture._frame.y * resolution,
                    width * resolution,
                    height * resolution,
                    dx * renderer.resolution,
                    dy * renderer.resolution,
                    width * renderer.resolution,
                    height * renderer.resolution
                );
            }
        }
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

CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);
