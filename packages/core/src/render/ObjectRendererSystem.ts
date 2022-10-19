import type { Matrix } from '@pixi/math';
import type { IRenderableObject, IRendererRenderOptions } from '../IRenderer';
import type { ISystem } from '../system/ISystem';
import type { Renderer } from '../Renderer';
import type { RenderTexture } from '../renderTexture/RenderTexture';
import type { ExtensionMetadata } from '@pixi/extensions';
import { extensions, ExtensionType } from '@pixi/extensions';

/**
 * system that provides a render function that focussing on rendering Pixi Scene Graph objects
 * to either the main view or to a renderTexture.  Used for Canvas `WebGL` contexts
 * @memberof PIXI
 */
export class ObjectRendererSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: ExtensionType.RendererSystem,
        name: 'objectRenderer',
    };

    renderer: Renderer;

    /**
     * Flag if we are rendering to the screen vs renderTexture
     * @readonly
     * @default true
     */
    renderingToScreen: boolean;

    /**
     * the last object rendered by the renderer. Useful for other plugins like interaction managers
     * @readonly
     */
    lastObjectRendered: IRenderableObject;

    // renderers scene graph!
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    /**
     * Renders the object to its WebGL view.
     * @param displayObject - The object to be rendered.
     * @param options - the options to be passed to the renderer
     */
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

        if (clear ?? renderer.background.clearBeforeRender)
        {
            renderer.renderTexture.clear();
        }

        displayObject.render(renderer);

        // apply transform..
        renderer.batch.currentRenderer.flush();

        if (renderTexture)
        {
            if (options.blit)
            {
                renderer.framebuffer.blit();
            }

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

extensions.add(ObjectRendererSystem);
