import { ParticleContainer } from '@pixi/particles';
import type { Sprite } from '@pixi/sprite';
import type { CanvasRenderer } from '@pixi/canvas-renderer';
import { Rectangle } from '@pixi/math';

const sourceFrame = new Rectangle();
const destinationFrame = new Rectangle();

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

    const context = renderer.context;
    const transform = this.worldTransform;
    let isRotated = true;

    let positionX = 0;
    let positionY = 0;

    let finalWidth = 0;
    let finalHeight = 0;

    renderer.setBlendMode(this.blendMode);

    context.globalAlpha = this.worldAlpha;

    this.displayObjectUpdateTransform();

    for (let i = 0; i < this.children.length; ++i)
    {
        const child = this.children[i] as Sprite;

        if (!child.visible)
        {
            continue;
        }

        const texture = child.texture;
        const source = texture.baseTexture.getDrawableSource();

        if (texture.orig.width <= 0 || texture.orig.height <= 0 || !texture.valid || !source)
        {
            continue;
        }

        const width = texture._frame.width;
        const height = texture._frame.height;

        context.globalAlpha = this.worldAlpha * child.alpha;

        if (child.rotation % (Math.PI * 2) === 0)
        {
            // this is the fastest  way to optimise! - if rotation is 0 then we can avoid any kind of setTransform call
            if (isRotated)
            {
                renderer.setContextTransform(transform, false, 1);
                isRotated = false;
            }

            positionX = ((child.anchor.x) * (-width * child.scale.x)) + child.position.x + 0.5;
            positionY = ((child.anchor.y) * (-height * child.scale.y)) + child.position.y + 0.5;

            finalWidth = width * child.scale.x;
            finalHeight = height * child.scale.y;
        }
        else
        {
            if (!isRotated)
            {
                isRotated = true;
            }

            child.displayObjectUpdateTransform();

            const childTransform = child.worldTransform;

            renderer.setContextTransform(childTransform, this.roundPixels, 1);

            positionX = ((child.anchor.x) * (-width)) + 0.5;
            positionY = ((child.anchor.y) * (-height)) + 0.5;

            finalWidth = width;
            finalHeight = height;
        }

        destinationFrame.x = positionX * renderer.resolution;
        destinationFrame.y = positionY * renderer.resolution;
        destinationFrame.width = finalWidth * renderer.resolution;
        destinationFrame.height = finalHeight * renderer.resolution;

        if (this.roundPixels)
        {
            destinationFrame.x = Math.round(destinationFrame.x);
            destinationFrame.y = Math.round(destinationFrame.y);
            destinationFrame.width = Math.round(destinationFrame.width);
            destinationFrame.height = Math.round(destinationFrame.height);
        }

        const resolution = texture.baseTexture.resolution;

        sourceFrame.copyFrom(texture._frame);
        sourceFrame.x = Math.round(sourceFrame.x * resolution);
        sourceFrame.y = Math.round(sourceFrame.y * resolution);
        sourceFrame.width = Math.round(sourceFrame.width * resolution);
        sourceFrame.height = Math.round(sourceFrame.height * resolution);

        context.drawImage(
            source,
            sourceFrame.x,
            sourceFrame.y,
            sourceFrame.width,
            sourceFrame.height,
            destinationFrame.x,
            destinationFrame.y,
            destinationFrame.width,
            destinationFrame.height
        );
    }
};
