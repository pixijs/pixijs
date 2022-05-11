import { Matrix } from '@pixi/math';
import { IRenderableObject, IRendererRenderOptions } from '../IRenderer';
import { ISystem } from '../system/ISystem';
import { Renderer } from '../Renderer';
import { RenderTexture } from '../renderTexture/RenderTexture';

export class RendererSystem implements ISystem
{
    renderer: Renderer;
    renderingToScreen: boolean;
    lastObjectRendered: IRenderableObject;

    // renderers scene graph!
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    render(displayObject: IRenderableObject, options?: IRendererRenderOptions): void
    {
        const renderer = this.renderer;

        let renderTexture: RenderTexture;
        let clear: boolean;
        let transform: Matrix;
        let skipUpdateTransform: boolean;

        if (options)
        {
            renderTexture = options.renderTexture;
            clear = options.clear;
            transform = options.transform;
            skipUpdateTransform = options.skipUpdateTransform;
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
            this.lastObjectRendered = displayObject;
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

        if (clear !== undefined ? clear : renderer.background.clearBeforeRender)
        {
            renderer.renderTexture.clear();
        }

        displayObject.render(renderer);

        // apply transform..
        renderer.batch.currentRenderer.flush();

        if (renderTexture)
        {
            // @dev7355608 please confirm this is ok to be here?
            renderer.framebuffer.blit();

            renderTexture.baseTexture.update();
        }

        renderer.runners.postrender.emit();

        // reset transform after render
        renderer.projection.transform = null;

        renderer.emit('postrender');
    }

    destroy(): void
    {
        // ka pow!
        this.renderer = null;
        this.lastObjectRendered = null;
    }
}
