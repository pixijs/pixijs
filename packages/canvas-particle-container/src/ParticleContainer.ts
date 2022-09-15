import { ParticleContainer } from '@pixi/particle-container';
import type { CanvasRenderer } from '@pixi/canvas-renderer';

/**
 * Renders the object using the Canvas renderer
 * @method renderCanvas
 * @memberof PIXI.ParticleContainer#
 * @private
 * @param {PIXI.CanvasRenderer} renderer - a reference to the canvas renderer
 */
ParticleContainer.prototype.renderCanvas = function renderCanvas(renderer: CanvasRenderer): void
{
    if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable)
    {
        return;
    }

    const context = renderer.canvasContext.activeContext;
    const transform = this.worldTransform;
    let isRotated = true;

    let positionX = 0;
    let positionY = 0;

    let finalWidth = 0;
    let finalHeight = 0;

    renderer.canvasContext.setBlendMode(this.blendMode);

    context.globalAlpha = this.worldAlpha;

    this.displayObjectUpdateTransform();

    for (let i = 0; i < this.children.length; ++i)
    {
        const child = this.children[i];

        if (!child.visible)
        {
            continue;
        }

        if (!child._texture.valid)
        {
            continue;
        }

        const frame = child._texture.frame;

        context.globalAlpha = this.worldAlpha * child.alpha;

        if (child.rotation % (Math.PI * 2) === 0)
        {
            // this is the fastest  way to optimise! - if rotation is 0 then we can avoid any kind of setTransform call
            if (isRotated)
            {
                renderer.canvasContext.setContextTransform(transform, false, 1);
                isRotated = false;
            }

            positionX = ((child.anchor.x) * (-frame.width * child.scale.x)) + child.position.x + 0.5;
            positionY = ((child.anchor.y) * (-frame.height * child.scale.y)) + child.position.y + 0.5;

            finalWidth = frame.width * child.scale.x;
            finalHeight = frame.height * child.scale.y;
        }
        else
        {
            if (!isRotated)
            {
                isRotated = true;
            }

            child.displayObjectUpdateTransform();

            const childTransform = child.worldTransform;

            renderer.canvasContext.setContextTransform(childTransform, this.roundPixels, 1);

            positionX = ((child.anchor.x) * (-frame.width)) + 0.5;
            positionY = ((child.anchor.y) * (-frame.height)) + 0.5;

            finalWidth = frame.width;
            finalHeight = frame.height;
        }

        const resolution = child._texture.baseTexture.resolution;
        const contextResolution = renderer.canvasContext.activeResolution;

        context.drawImage(
            child._texture.baseTexture.getDrawableSource(),
            frame.x * resolution,
            frame.y * resolution,
            frame.width * resolution,
            frame.height * resolution,
            positionX * contextResolution,
            positionY * contextResolution,
            finalWidth * contextResolution,
            finalHeight * contextResolution
        );
    }
};
