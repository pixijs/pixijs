import { ExtensionType } from '../../../extensions/Extensions';
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
        const activeResolution = contextSystem.activeResolution;

        for (let i = 0; i < elements.length; i++)
        {
            const element = elements[i];

            if (!element.packAsQuad) continue;

            const quad = element as DefaultBatchableQuadElement;
            const texture = quad.texture;

            const source = texture?.source?.resource as CanvasImageSource;

            if (!source) continue;

            contextSystem.setBlendMode(element.blendMode);

            const argb = quad.color;
            const alpha = ((argb >>> 24) & 0xFF) / 255;

            if (alpha <= 0) continue;

            context.globalAlpha = alpha;

            const tint = bgr2rgb(argb & 0xFFFFFF);
            const tintedSource = tint === 0xFFFFFF
                ? source
                : canvasUtils.getTintedCanvas({ texture }, tint) as CanvasImageSource;

            const frame = texture.frame;
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

            contextSystem.setContextTransform(quad.transform, quad.roundPixels === 1, 1);

            const drawX = Math.floor(dx * activeResolution);
            const drawY = Math.floor(dy * activeResolution);
            const drawW = Math.floor(dw * activeResolution);
            const drawH = Math.floor(dh * activeResolution);

            if (tintedSource === source)
            {
                context.drawImage(
                    source,
                    sx,
                    sy,
                    Math.floor(sw),
                    Math.floor(sh),
                    drawX,
                    drawY,
                    drawW,
                    drawH
                );
            }
            else
            {
                context.drawImage(
                    tintedSource,
                    0,
                    0,
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
