import { Cache } from '../../assets/cache/Cache';
import { ExtensionType } from '../../extensions/Extensions';
import { ProxyRenderable } from '../../rendering/renderers/shared/ProxyRenderable';
import { BigPool } from '../../utils/pool/PoolGroup';
import { GraphicsView } from '../graphics/shared/GraphicsView';
import { SdfShader } from '../text/sdfShader/SdfShader';
import { BitmapFontManager } from './BitmapFontManager';
import { getBitmapTextLayout } from './utils/getBitmapTextLayout';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../rendering/renderers/shared/Renderable';
import type { Renderer } from '../../rendering/renderers/types';
import type { GraphicsContext } from '../graphics/shared/GraphicsContext';
import type { TextView } from '../text/TextView';

class GraphicsProxyRenderable extends ProxyRenderable<GraphicsView>
{
    constructor()
    {
        super({
            view: new GraphicsView(),
        });
    }
}

export class BitmapTextPipe implements RenderPipe<TextView>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'bitmapText',
    } as const;

    private _renderer: Renderer;
    private _gpuBitmapText: Record<number, GraphicsProxyRenderable> = {};
    private _sdfShader: SdfShader;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public validateRenderable(renderable: Renderable<TextView>): boolean
    {
        const graphicsRenderable = this._getGpuBitmapText(renderable);

        if (renderable.view._didUpdate)
        {
            renderable.view._didUpdate = false;
            this._updateContext(renderable, graphicsRenderable.view.context);
        }

        const rebuild = this._renderer.renderPipes.graphics.validateRenderable(graphicsRenderable);

        // TODO - need to shift all the verts in the graphicsData to the new anchor

        return rebuild;
        // update the anchor...
    }

    public addRenderable(renderable: Renderable<TextView>, instructionSet: InstructionSet)
    {
        const graphicsRenderable = this._getGpuBitmapText(renderable);

        if (renderable.view._didUpdate)
        {
            renderable.view._didUpdate = false;

            this._updateContext(renderable, graphicsRenderable.view.context);
        }

        this._renderer.renderPipes.graphics.addRenderable(graphicsRenderable, instructionSet);

        if (graphicsRenderable.view.context.customShader)
        {
            this._updateDistanceField(renderable);
        }
    }

    public destroyRenderable(renderable: Renderable<TextView>)
    {
        this._destroyRenderableByUid(renderable.uid);
    }

    private _destroyRenderableByUid(renderableUid: number)
    {
        BigPool.return(this._gpuBitmapText[renderableUid]);
        this._gpuBitmapText[renderableUid] = null;
    }

    public updateRenderable(renderable: Renderable<TextView>)
    {
        const graphicsRenderable = this._getGpuBitmapText(renderable);

        this._renderer.renderPipes.graphics.updateRenderable(graphicsRenderable);

        if (graphicsRenderable.view.context.customShader)
        {
            this._updateDistanceField(renderable);
        }
    }

    private _updateContext(renderable: Renderable<TextView>, context: GraphicsContext)
    {
        const view = renderable.view;

        const bitmapFont = BitmapFontManager.getFont(view.text, view._style);

        context.clear();

        if (bitmapFont.distanceField.type !== 'none')
        {
            if (!context.customShader)
            {
                if (!this._sdfShader)
                {
                    this._sdfShader = new SdfShader();
                }

                context.customShader = this._sdfShader;
            }
        }

        const chars = Array.from(view.text);
        const style = view._style;

        let currentY = (style._stroke?.width || 0) / 2;

        currentY += bitmapFont.baseLineOffset;

        // measure our text...
        const bitmapTextLayout = getBitmapTextLayout(chars, style, bitmapFont);

        let index = 0;

        const padding = style.padding;
        const scale = bitmapTextLayout.scale;

        context
            .translate(
                (-view.anchor._x * bitmapTextLayout.width) - padding,
                (-view.anchor._y * (bitmapTextLayout.height + bitmapTextLayout.offsetY)) - padding)
            .scale(scale, scale);

        const tint = style._fill.color;

        for (let i = 0; i < bitmapTextLayout.lines.length; i++)
        {
            const line = bitmapTextLayout.lines[i];

            for (let j = 0; j < line.charPositions.length; j++)
            {
                const char = chars[index++];

                const charData = bitmapFont.chars[char];

                if (charData?.texture)
                {
                    context.texture(
                        charData.texture,
                        tint,
                        Math.round(line.charPositions[j] + charData.xOffset),
                        Math.round(currentY + charData.yOffset),
                    );
                }
            }

            currentY += bitmapFont.lineHeight;
        }
    }

    private _getGpuBitmapText(renderable: Renderable<TextView>)
    {
        return this._gpuBitmapText[renderable.uid] || this.initGpuText(renderable);
    }

    public initGpuText(renderable: Renderable<TextView>)
    {
        // TODO we could keep a bunch of contexts around and reuse one that hav the same style!
        const proxyRenderable = BigPool.get(GraphicsProxyRenderable, renderable);

        this._gpuBitmapText[renderable.uid] = proxyRenderable;

        proxyRenderable.view.roundPixels = (this._renderer._roundPixels | renderable.view.roundPixels) as 0 | 1;

        this._updateContext(renderable, proxyRenderable.view.context);

        renderable.on('destroyed', () =>
        {
            this.destroyRenderable(renderable);
        });

        return this._gpuBitmapText[renderable.uid];
    }

    private _updateDistanceField(renderable: Renderable<TextView>)
    {
        const context = this._getGpuBitmapText(renderable).view.context;

        const view = renderable.view;

        const fontFamily = view._style.fontFamily as string;
        const dynamicFont = Cache.get(`${fontFamily as string}-bitmap`);

        // Inject the shader code with the correct value
        const { a, b, c, d } = renderable.rgTransform;

        const dx = Math.sqrt((a * a) + (b * b));
        const dy = Math.sqrt((c * c) + (d * d));
        const worldScale = (Math.abs(dx) + Math.abs(dy)) / 2;

        const fontScale = dynamicFont.baseRenderedFontSize / view._style.fontSize;

        const resolution = view.resolution ?? this._renderer.resolution;
        const distance = worldScale * dynamicFont.distanceField.range * (1 / fontScale) * resolution;

        context.customShader.resources.localUniforms.uniforms.uDistance = distance;
    }

    public destroy()
    {
        for (const uid in this._gpuBitmapText)
        {
            this._destroyRenderableByUid(uid as unknown as number);
        }

        this._gpuBitmapText = null;

        this._sdfShader?.destroy(true);
        this._sdfShader = null;

        this._renderer = null;
    }
}

