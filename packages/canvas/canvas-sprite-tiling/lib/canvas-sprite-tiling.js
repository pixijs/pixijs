/*!
 * @pixi/canvas-sprite-tiling - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/canvas-sprite-tiling is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

var spriteTiling = require('@pixi/sprite-tiling');
var canvasRenderer = require('@pixi/canvas-renderer');
var utils = require('@pixi/utils');
var math = require('@pixi/math');

var tempMatrix = new math.Matrix();
var tempPoints = [new math.Point(), new math.Point(), new math.Point(), new math.Point()];
/**
 * Renders the object using the Canvas renderer
 *
 * @protected
 * @function _renderCanvas
 * @memberof PIXI.TilingSprite#
 * @param {PIXI.CanvasRenderer} renderer - a reference to the canvas renderer
 */
spriteTiling.TilingSprite.prototype._renderCanvas = function _renderCanvas(renderer) {
    var texture = this._texture;
    if (!texture.baseTexture.valid) {
        return;
    }
    var context = renderer.context;
    var transform = this.worldTransform;
    var baseTexture = texture.baseTexture;
    var source = baseTexture.getDrawableSource();
    var baseTextureResolution = baseTexture.resolution;
    // create a nice shiny pattern!
    if (this._textureID !== this._texture._updateID || this._cachedTint !== this.tint) {
        this._textureID = this._texture._updateID;
        // cut an object from a spritesheet..
        var tempCanvas = new utils.CanvasRenderTarget(texture._frame.width, texture._frame.height, baseTextureResolution);
        // Tint the tiling sprite
        if (this.tint !== 0xFFFFFF) {
            this._tintedCanvas = canvasRenderer.canvasUtils.getTintedCanvas(this, this.tint);
            tempCanvas.context.drawImage(this._tintedCanvas, 0, 0);
        }
        else {
            tempCanvas.context.drawImage(source, -texture._frame.x * baseTextureResolution, -texture._frame.y * baseTextureResolution);
        }
        this._cachedTint = this.tint;
        this._canvasPattern = tempCanvas.context.createPattern(tempCanvas.canvas, 'repeat');
    }
    // set context state..
    context.globalAlpha = this.worldAlpha;
    renderer.setBlendMode(this.blendMode);
    this.tileTransform.updateLocalTransform();
    var lt = this.tileTransform.localTransform;
    var W = this._width;
    var H = this._height;
    tempMatrix.identity();
    tempMatrix.copyFrom(lt);
    tempMatrix.prepend(transform);
    renderer.setContextTransform(tempMatrix);
    // fill the pattern!
    context.fillStyle = this._canvasPattern;
    var anchorX = this.uvRespectAnchor ? this.anchor.x * -W : 0;
    var anchorY = this.uvRespectAnchor ? this.anchor.y * -H : 0;
    tempPoints[0].set(anchorX, anchorY);
    tempPoints[1].set(anchorX + W, anchorY);
    tempPoints[2].set(anchorX + W, anchorY + H);
    tempPoints[3].set(anchorX, anchorY + H);
    for (var i = 0; i < 4; i++) {
        lt.applyInverse(tempPoints[i], tempPoints[i]);
    }
    context.beginPath();
    context.moveTo(tempPoints[0].x, tempPoints[0].y);
    for (var i = 1; i < 4; i++) {
        context.lineTo(tempPoints[i].x, tempPoints[i].y);
    }
    context.closePath();
    context.fill();
};
//# sourceMappingURL=canvas-sprite-tiling.js.map
