import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { bgr2rgb } from '../../../scene/container/container-mixins/getGlobalMixin';
import { canvasUtils } from '../../renderers/canvas/utils/canvasUtils';

import type { CanvasRenderer } from '../../renderers/canvas/CanvasRenderer';
import type { Geometry } from '../../renderers/shared/geometry/Geometry';
import type { Shader } from '../../renderers/shared/shader/Shader';
import type { Batch } from '../shared/Batcher';
import type { BatcherAdaptor, BatcherPipe } from '../shared/BatcherPipe';
import type { DefaultBatchableQuadElement } from '../shared/DefaultBatcher';

/**
 * A BatcherAdaptor that renders batches using Canvas2D.
 * @category rendering
 * @ignore
 */
export class CanvasBatchAdaptor implements BatcherAdaptor
{
    private static readonly _tempPatternMatrix = new Matrix();

    private static _getPatternRepeat(
        addressModeU?: string,
        addressModeV?: string
    ): CanvasPatternRepeat
    {
        const repeatU = addressModeU && addressModeU !== 'clamp-to-edge';
        const repeatV = addressModeV && addressModeV !== 'clamp-to-edge';

        if (repeatU && repeatV) return 'repeat';
        if (repeatU) return 'repeat-x';
        if (repeatV) return 'repeat-y';

        return 'no-repeat';
    }

    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.CanvasPipesAdaptor,
        ],
        name: 'batch',
    } as const;

    public start(batchPipe: BatcherPipe, geometry: Geometry, shader: Shader): void
    {
        void batchPipe;
        void geometry;
        void shader;
    }

    public execute(batchPipe: BatcherPipe, batch: Batch): void
    {
        const elements = batch.elements;

        if (!elements || !elements.length) return;

        const renderer = batchPipe.renderer as CanvasRenderer;
        const contextSystem = renderer.canvasContext;
        const context = contextSystem.activeContext;

        for (let i = 0; i < elements.length; i++)
        {
            const element = elements[i];

            if (!element.packAsQuad) continue;

            const quad = element as DefaultBatchableQuadElement;
            const texture = quad.texture;
            const source = texture ? canvasUtils.getCanvasSource(texture) : null;

            if (!source) continue;

            const textureStyle = texture.source.style;
            const smoothProperty = contextSystem.smoothProperty;
            const shouldSmooth = textureStyle.scaleMode !== 'nearest';

            if (context[smoothProperty] !== shouldSmooth)
            {
                context[smoothProperty] = shouldSmooth;
            }

            contextSystem.setBlendMode(element.blendMode);

            const argb = quad.color;
            const alpha = ((argb >>> 24) & 0xFF) / 255;

            if (alpha <= 0) continue;

            context.globalAlpha = alpha;

            const tint = bgr2rgb(argb & 0xFFFFFF);
            const frame = texture.frame;
            const repeatU = textureStyle.addressModeU ?? textureStyle.addressMode;
            const repeatV = textureStyle.addressModeV ?? textureStyle.addressMode;
            const repeat = CanvasBatchAdaptor._getPatternRepeat(repeatU, repeatV);

            const resolution = texture.source._resolution ?? texture.source.resolution ?? 1;

            const sx = frame.x * resolution;
            const sy = frame.y * resolution;
            const sw = frame.width * resolution;
            const sh = frame.height * resolution;

            const bounds = quad.bounds;
            const dx = bounds.minX;
            const dy = bounds.minY;
            const dw = bounds.maxX - bounds.minX;
            const dh = bounds.maxY - bounds.minY;

            contextSystem.setContextTransform(quad.transform, quad.roundPixels === 1);

            const drawX = dx;
            const drawY = dy;
            const drawW = dw;
            const drawH = dh;

            const uvs = texture.uvs;
            const uvMin = Math.min(uvs.x0, uvs.x1, uvs.x2, uvs.x3, uvs.y0, uvs.y1, uvs.y2, uvs.y3);
            const uvMax = Math.max(uvs.x0, uvs.x1, uvs.x2, uvs.x3, uvs.y0, uvs.y1, uvs.y2, uvs.y3);
            const needsRepeat = repeat !== 'no-repeat' && (uvMin < 0 || uvMax > 1);

            if (needsRepeat)
            {
                let patternSource = source;

                if (tint !== 0xFFFFFF && frame.width <= texture.source.width && frame.height <= texture.source.height)
                {
                    patternSource = canvasUtils.getTintedCanvas({ texture }, tint) as CanvasImageSource;
                }

                const pattern = context.createPattern(patternSource, repeat);

                if (!pattern) continue;

                const denomX = drawW;
                const denomY = drawH;

                if (denomX === 0 || denomY === 0) continue;

                const invDx = 1 / denomX;
                const invDy = 1 / denomY;

                const a = (uvs.x1 - uvs.x0) * invDx;
                const b = (uvs.y1 - uvs.y0) * invDx;
                const c = (uvs.x3 - uvs.x0) * invDy;
                const d = (uvs.y3 - uvs.y0) * invDy;
                const tx = uvs.x0 - (a * drawX) - (c * drawY);
                const ty = uvs.y0 - (b * drawX) - (d * drawY);

                const pixelWidth = texture.source.pixelWidth;
                const pixelHeight = texture.source.pixelHeight;

                CanvasBatchAdaptor._tempPatternMatrix.set(
                    a * pixelWidth,
                    b * pixelHeight,
                    c * pixelWidth,
                    d * pixelHeight,
                    tx * pixelWidth,
                    ty * pixelHeight
                );

                canvasUtils.applyPatternTransform(pattern, CanvasBatchAdaptor._tempPatternMatrix);
                context.fillStyle = pattern;
                context.fillRect(drawX, drawY, drawW, drawH);
            }
            else
            {
                const tintedSource = tint === 0xFFFFFF
                    ? source
                    : canvasUtils.getTintedCanvas({ texture }, tint) as CanvasImageSource;

                context.drawImage(
                    tintedSource,
                    tintedSource === source ? sx : 0,
                    tintedSource === source ? sy : 0,
                    Math.floor(sw),
                    Math.floor(sh),
                    drawX,
                    drawY,
                    drawW,
                    drawH
                );
            }
        }
    }
}
