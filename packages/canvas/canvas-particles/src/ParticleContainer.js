import { ParticleContainer } from '@pixi/particles';

/**
 * Renders the object using the Canvas renderer
 * @method renderCanvas
 * @memberof PIXI.ParticleContainer#
 * @private
 * @param {PIXI.CanvasRenderer} renderer - a reference to the canvas renderer
 */
ParticleContainer.prototype.renderCanvas = function renderCanvas(renderer)
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
        const child = this.children[i];

        if (!child.visible)
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
                context.setTransform(
                    transform.a,
                    transform.b,
                    transform.c,
                    transform.d,
                    transform.tx * renderer.resolution,
                    transform.ty * renderer.resolution
                );

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

            if (this.roundPixels)
            {
                context.setTransform(
                    childTransform.a,
                    childTransform.b,
                    childTransform.c,
                    childTransform.d,
                    (childTransform.tx * renderer.resolution) | 0,
                    (childTransform.ty * renderer.resolution) | 0
                );
            }
            else
            {
                context.setTransform(
                    childTransform.a,
                    childTransform.b,
                    childTransform.c,
                    childTransform.d,
                    childTransform.tx * renderer.resolution,
                    childTransform.ty * renderer.resolution
                );
            }

            positionX = ((child.anchor.x) * (-frame.width)) + 0.5;
            positionY = ((child.anchor.y) * (-frame.height)) + 0.5;

            finalWidth = frame.width;
            finalHeight = frame.height;
        }

        const resolution = child._texture.baseTexture.resolution;

        context.drawImage(
            child._texture.baseTexture.source,
            frame.x * resolution,
            frame.y * resolution,
            frame.width * resolution,
            frame.height * resolution,
            positionX * renderer.resolution,
            positionY * renderer.resolution,
            finalWidth * renderer.resolution,
            finalHeight * renderer.resolution
        );
    }
};
