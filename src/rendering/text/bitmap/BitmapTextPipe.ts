import { Cache } from '../../../assets/cache/Cache';
import { ExtensionType } from '../../../extensions/Extensions';
import { GraphicsContext } from '../../graphics/shared/GraphicsContext';
import { GraphicsView } from '../../graphics/shared/GraphicsView';
import { ProxyRenderable } from '../../renderers/shared/ProxyRenderable';
import { SdfShader } from '../sdfShader/SdfShader';
import { BitmapFontManager } from './BitmapFontManager';
import { getBitmapTextLayout } from './utils/getBitmapTextLayout';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Renderer } from '../../renderers/types';
import type { TextView } from '../TextView';

export class BitmapTextPipe implements RenderPipe<TextView>
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererPipes,
            ExtensionType.WebGPURendererPipes,
            ExtensionType.CanvasRendererPipes,
        ],
        name: 'bitmapText',
    };

    private renderer: Renderer;

    private gpuBitmapText: Record<string, {
        graphicsRenderable: Renderable<GraphicsView>,
        context: GraphicsContext,
    }> = {};

    private sdfShader: SdfShader;

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    validateRenderable(renderable: Renderable<TextView>): boolean
    {
        const { graphicsRenderable, context } = this.getGpuBitmapText(renderable);

        // todo only if text change..
        this.updateContext(renderable, context);

        const rebuild = this.renderer.renderPipes.graphics.validateRenderable(graphicsRenderable);

        // TODO - need to shift all the verts in the graphicsData to the new anchor

        return rebuild;
        // update the anchor...
    }

    addRenderable(renderable: Renderable<TextView>, instructionSet: InstructionSet)
    {
        const { graphicsRenderable, context } = this.getGpuBitmapText(renderable);

        // TODO break the batch if we are not batching..
        this.renderer.renderPipes.batch.break(instructionSet);

        this.renderer.renderPipes.graphics.addRenderable(graphicsRenderable, instructionSet);

        if (context.customShader)
        {
            this.updateDistanceField(renderable);
        }
    }

    updateRenderable(renderable: Renderable<TextView>)
    {
        const { graphicsRenderable, context } = this.getGpuBitmapText(renderable);

        this.renderer.renderPipes.graphics.updateRenderable(graphicsRenderable);

        if (context.customShader)
        {
            this.updateDistanceField(renderable);
        }
    }

    updateContext(renderable: Renderable<TextView>, context: GraphicsContext)
    {
        const view = renderable.view;

        const bitmapFont = BitmapFontManager.getFont(view.text, view._style);

        context.clear();

        if (bitmapFont.distanceField.fieldType !== 'none')
        {
            if (!context.customShader)
            {
                if (!this.sdfShader)
                {
                    this.sdfShader = new SdfShader();
                }

                context.customShader = this.sdfShader;
            }
        }

        const chars = Array.from(view.text);
        const style = view._style;

        let currentY = (style._stroke?.width || 0) / 2;

        currentY += bitmapFont.baseLineOffset;

        // measure our text...
        const bitmapTextLayout = getBitmapTextLayout(chars, style, bitmapFont);

        let index = 0;

        const scale = style.fontSize / bitmapFont.baseMeasurementFontSize;

        context.scale(scale, scale);

        const offsetX = -view.anchor.x * bitmapTextLayout.width;
        const offsetY = -view.anchor.y * bitmapTextLayout.height;

        context.translate(offsetX, offsetY);

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

    getGpuBitmapText(renderable: Renderable<TextView>)
    {
        return this.gpuBitmapText[renderable.uid] || this.initGpuText(renderable);
    }

    initGpuText(renderable: Renderable<TextView>)
    {
        renderable.view._style.update();

        const context = new GraphicsContext();

        this.gpuBitmapText[renderable.uid] = {
            graphicsRenderable: new ProxyRenderable({
                view: new GraphicsView(context),
                original: renderable,
            }),
            context
        };

        this.updateContext(renderable, context);

        return this.gpuBitmapText[renderable.uid];
    }

    updateDistanceField(renderable: Renderable<TextView>)
    {
        const { context } = this.getGpuBitmapText(renderable);

        const view = renderable.view;

        const fontFamily = view._style.fontFamily as string;
        const dynamicFont = Cache.get(fontFamily as string);

        // Inject the shader code with the correct value
        const { a, b, c, d } = renderable.layerTransform;

        const dx = Math.sqrt((a * a) + (b * b));
        const dy = Math.sqrt((c * c) + (d * d));
        const worldScale = (Math.abs(dx) + Math.abs(dy)) / 2;

        const fontScale = dynamicFont.baseRenderedFontSize / view._style.fontSize;

        // TODO take the correct resolution..
        const resolution = 1;// this.renderer.view.resolution;
        const distance = worldScale * dynamicFont.distanceField.distanceRange * (1 / fontScale) * resolution;

        context.customShader.resources.localUniforms.uniforms.distance = distance;
    }
}

