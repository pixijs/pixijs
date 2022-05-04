import { Matrix } from '@pixi/math';
import { deprecation } from '@pixi/utils';
import { IRendererRenderOptions } from './AbstractRenderer';
import { IRenderableObject } from './IRenderableObject';
import { ISystem } from './ISystem';
import { Renderer } from './Renderer';
import { RenderTexture } from './renderTexture/RenderTexture';

export class RendererSystem implements ISystem
{
    renderer: Renderer;
    renderingToScreen: boolean;
    _lastObjectRendered: IRenderableObject;

    // renderers scene graph!
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    render(displayObject: IRenderableObject, options?: IRendererRenderOptions | RenderTexture): void
    {
        const renderer = this.renderer;

        let renderTexture: RenderTexture;
        let clear: boolean;
        let transform: Matrix;
        let skipUpdateTransform: boolean;

        if (options)
        {
            if (options instanceof RenderTexture)
            {
                // #if _DEBUG
                deprecation('6.0.0', 'Renderer#render arguments changed, use options instead.');
                // #endif

                /* eslint-disable prefer-rest-params */
                renderTexture = options;
                clear = arguments[2];
                transform = arguments[3];
                skipUpdateTransform = arguments[4];
                /* eslint-enable prefer-rest-params */
            }
            else
            {
                renderTexture = options.renderTexture;
                clear = options.clear;
                transform = options.transform;
                skipUpdateTransform = options.skipUpdateTransform;
            }
        }

        // can be handy to know!
        this.renderingToScreen = !renderTexture;

        renderer.runners.prerender.emit();
        renderer.emit('prerender');

        // apply a transform at a GPU level
        renderer.projection.transform = transform;

        // no point rendering if our context has been blown up!
        if (renderer.context.isLost)
        {
            return;
        }

        if (!renderTexture)
        {
            this._lastObjectRendered = displayObject;
        }

        if (!skipUpdateTransform)
        {
            // update the scene graph
            const cacheParent = displayObject.enableTempParent();

            displayObject.updateTransform();
            displayObject.disableTempParent(cacheParent);
            // displayObject.hitArea = //TODO add a temp hit area
        }

        renderer.renderTexture.bind(renderTexture);
        renderer.batch.currentRenderer.start();

        if (clear !== undefined ? clear : renderer._background.clearBeforeRender)
        {
            renderer.renderTexture.clear();
        }

        displayObject.render(renderer);

        // apply transform..
        renderer.batch.currentRenderer.flush();

        if (renderTexture)
        {
            renderTexture.baseTexture.update();
        }

        renderer.runners.postrender.emit();

        // reset transform after render
        renderer.projection.transform = null;

        renderer.emit('postrender');
    }
}
