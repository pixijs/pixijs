/*!
 * @pixi/canvas-particles - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/canvas-particles is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

var particles = require('@pixi/particles');

/**
 * Renders the object using the Canvas renderer
 * @method renderCanvas
 * @memberof PIXI.ParticleContainer#
 * @private
 * @param {PIXI.CanvasRenderer} renderer - a reference to the canvas renderer
 */
particles.ParticleContainer.prototype.renderCanvas = function renderCanvas(renderer) {
    if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable) {
        return;
    }
    var context = renderer.context;
    var transform = this.worldTransform;
    var isRotated = true;
    var positionX = 0;
    var positionY = 0;
    var finalWidth = 0;
    var finalHeight = 0;
    renderer.setBlendMode(this.blendMode);
    context.globalAlpha = this.worldAlpha;
    this.displayObjectUpdateTransform();
    for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i];
        if (!child.visible) {
            continue;
        }
        if (!child._texture.valid) {
            continue;
        }
        var frame = child._texture.frame;
        context.globalAlpha = this.worldAlpha * child.alpha;
        if (child.rotation % (Math.PI * 2) === 0) {
            // this is the fastest  way to optimise! - if rotation is 0 then we can avoid any kind of setTransform call
            if (isRotated) {
                renderer.setContextTransform(transform, false, 1);
                isRotated = false;
            }
            positionX = ((child.anchor.x) * (-frame.width * child.scale.x)) + child.position.x + 0.5;
            positionY = ((child.anchor.y) * (-frame.height * child.scale.y)) + child.position.y + 0.5;
            finalWidth = frame.width * child.scale.x;
            finalHeight = frame.height * child.scale.y;
        }
        else {
            if (!isRotated) {
                isRotated = true;
            }
            child.displayObjectUpdateTransform();
            var childTransform = child.worldTransform;
            renderer.setContextTransform(childTransform, this.roundPixels, 1);
            positionX = ((child.anchor.x) * (-frame.width)) + 0.5;
            positionY = ((child.anchor.y) * (-frame.height)) + 0.5;
            finalWidth = frame.width;
            finalHeight = frame.height;
        }
        var resolution = child._texture.baseTexture.resolution;
        context.drawImage(child._texture.baseTexture.getDrawableSource(), frame.x * resolution, frame.y * resolution, frame.width * resolution, frame.height * resolution, positionX * renderer.resolution, positionY * renderer.resolution, finalWidth * renderer.resolution, finalHeight * renderer.resolution);
    }
};
//# sourceMappingURL=canvas-particles.js.map
