var CanvasRenderer = require('../../renderers/canvas/CanvasRenderer'),
    CONST = require('../../const'),
    math = require('../../math'),
    canvasRenderWorldTransform = new math.Matrix(),
    CanvasTinter = require('./CanvasTinter');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
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
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer sprite this batch works for.
 */
function CanvasSpriteRenderer(renderer)
{
    this.renderer = renderer;
}


CanvasSpriteRenderer.prototype.constructor = CanvasSpriteRenderer;
module.exports = CanvasSpriteRenderer;

CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);

/**
 * Renders the sprite object.
 *
 * @param sprite {PIXI.Sprite} the sprite to render when using this spritebatch
 */
CanvasSpriteRenderer.prototype.render = function (sprite)
{
    var texture = sprite._texture,
        renderer = this.renderer,
        wt = sprite.transform.worldTransform,
        dx,
        dy,
        width = texture._frame.width,
        height = texture._frame.height;

    if (texture.orig.width <= 0 || texture.orig.height <= 0)
    {
        return;
    }

    renderer.setBlendMode(sprite.blendMode);

    //  Ignore null sources
    if (texture.valid)
    {
        renderer.context.globalAlpha = sprite.worldAlpha;

        // If smoothingEnabled is supported and we need to change the smoothing property for sprite texture
        var smoothingEnabled = texture.baseTexture.scaleMode === CONST.SCALE_MODES.LINEAR;
        if (renderer.smoothProperty && renderer.context[renderer.smoothProperty] !== smoothingEnabled)
        {
            renderer.context[renderer.smoothProperty] = smoothingEnabled;
        }

        if (texture.trim) {
            dx = texture.trim.width/2 + texture.trim.x - sprite.anchor.x * texture.orig.width;
            dy = texture.trim.height/2 + texture.trim.y - sprite.anchor.y * texture.orig.height;
        } else {
            dx = (0.5 - sprite.anchor.x) * texture.orig.width;
            dy = (0.5 - sprite.anchor.y) * texture.orig.height;
        }
        if(texture.rotate) {
            wt.copy(canvasRenderWorldTransform);
            wt = canvasRenderWorldTransform;
            math.GroupD8.matrixAppendRotationInv(wt, texture.rotate, dx, dy);
            // the anchor has already been applied above, so lets set it to zero
            dx = 0;
            dy = 0;
        }
        dx -= width/2;
        dy -= height/2;
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

        var resolution = texture.baseTexture.resolution;

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
                dx  * renderer.resolution,
                dy  * renderer.resolution,
                width * renderer.resolution,
                height * renderer.resolution
            );
        }
    }
};

/**
 * destroy the sprite object.
 *
 */
CanvasSpriteRenderer.prototype.destroy = function (){
  this.renderer = null;
};
