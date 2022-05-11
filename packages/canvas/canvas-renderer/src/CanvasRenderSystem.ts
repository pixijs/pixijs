import { Matrix } from '@pixi/math';

import type { CanvasRenderer } from './CanvasRenderer';
import { BaseRenderTexture, CanvasResource, IRendererRenderOptions, ISystem, RenderTexture } from '@pixi/core';
import { BLEND_MODES } from '@pixi/constants';
import { CanvasRenderTarget, deprecation, hex2string, rgb2hex } from '@pixi/utils';
import { DisplayObject } from 'pixi.js';
import { CrossPlatformCanvasRenderingContext2D } from './CanvasContextSystem';

/**
 * system that provides a render function that focussing on rendering Pixi Scene Graph objects
 * to either the main view or to a renderTexture. Used for Canvas `2d` contexts
 *
 * @memberof PIXI
 */
export class CanvasRenderSystem implements ISystem
{
    /** A reference to the current renderer */
    private renderer: CanvasRenderer;
    renderingToScreen: boolean;
    lastObjectRendered: DisplayObject;

    /** @param renderer - A reference to the current renderer */
    constructor(renderer: CanvasRenderer)
    {
        this.renderer = renderer;
    }

    /**
     * Renders the object to its Canvas view.
     *
     * @param displayObject The object to be rendered.
     * @param options the options to be passed to the renderer
     */
    public render(displayObject: DisplayObject, options?: IRendererRenderOptions | RenderTexture | BaseRenderTexture): void
    {
        const renderer = this.renderer;

        if (!renderer.view)
        {
            return;
        }

        const _context = renderer.context;

        let renderTexture: BaseRenderTexture | RenderTexture;
        let clear: boolean;
        let transform: Matrix;
        let skipUpdateTransform: boolean;

        if (options)
        {
            if (options instanceof RenderTexture || options instanceof BaseRenderTexture)
            {
                // #if _DEBUG
                deprecation('6.0.0', 'CanvasRenderer#render arguments changed, use options instead.');
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

        renderer.emit('prerender');

        const rootResolution = renderer.resolution;

        if (renderTexture)
        {
            renderTexture = renderTexture.castToBaseTexture() as BaseRenderTexture;

            if (!renderTexture._canvasRenderTarget)
            {
                renderTexture._canvasRenderTarget = new CanvasRenderTarget(
                    renderTexture.width,
                    renderTexture.height,
                    renderTexture.resolution
                );

                renderTexture.resource = new CanvasResource(renderTexture._canvasRenderTarget.canvas);
                renderTexture.valid = true;
            }

            _context.activeContext = renderTexture._canvasRenderTarget.context as CrossPlatformCanvasRenderingContext2D;
            renderer.context.activeResolution = renderTexture._canvasRenderTarget.resolution;
        }
        else
        {
            _context.activeContext = _context.rootContext;
            _context.activeResolution = rootResolution;
        }

        const context2D = _context.activeContext;

        _context._projTransform = transform || null;

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
        }

        context2D.save();
        context2D.setTransform(1, 0, 0, 1, 0, 0);
        context2D.globalAlpha = 1;
        _context._activeBlendMode = BLEND_MODES.NORMAL;
        _context._outerBlend = false;
        context2D.globalCompositeOperation = _context.blendModes[BLEND_MODES.NORMAL];

        if (clear !== undefined ? clear : renderer.background.clearBeforeRender)
        {
            if (this.renderingToScreen)
            {
                context2D.clearRect(0, 0, renderer.width, renderer.height);

                const background = renderer.background;

                if (background.backgroundAlpha > 0)
                {
                    context2D.globalAlpha = this.useContextAlpha ? background.backgroundAlpha : 1;
                    context2D.fillStyle = background.backgroundColorString;
                    context2D.fillRect(0, 0, renderer.width, renderer.height);
                    context2D.globalAlpha = 1;
                }
            }
            else
            {
                renderTexture = (renderTexture as BaseRenderTexture);
                renderTexture._canvasRenderTarget.clear();

                const clearColor = renderTexture.clearColor;

                if (clearColor[3] > 0)
                {
                    context2D.globalAlpha = clearColor[3] ?? 1;
                    context2D.fillStyle = hex2string(rgb2hex(clearColor));
                    context2D.fillRect(0, 0, renderTexture.realWidth, renderTexture.realHeight);
                    context2D.globalAlpha = 1;
                }
            }
        }

        // TODO RENDER TARGET STUFF HERE..
        const tempContext = _context.activeContext;

        _context.activeContext = context2D;
        displayObject.renderCanvas(renderer);
        _context.activeContext = tempContext;

        context2D.restore();

        _context.activeResolution = rootResolution;
        _context._projTransform = null;

        renderer.emit('postrender');
    }

    public destroy(): void
    {
        // ka boom!
    }
}
