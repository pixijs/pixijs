import { ExtensionType } from '../../../extensions/Extensions';
import { groupD8 } from '../../../maths/matrix/groupD8';
import { Matrix } from '../../../maths/matrix/Matrix';
import { bgr2rgb } from '../../../scene/container/container-mixins/getGlobalMixin';
import { multiplyHexColors } from '../../../scene/container/utils/multiplyHexColors';
import { type PatternRepetition } from '../../../scene/graphics/shared/fill/FillPattern';
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
    ): PatternRepetition
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

            // Use the batch-level (already alpha-adjusted) blend mode
            contextSystem.setBlendMode(batch.blendMode);

            const globalColor = renderer.globalUniforms.globalUniformData?.worldColor ?? 0xFFFFFFFF;
            const argb = quad.color;

            const globalAlpha = ((globalColor >>> 24) & 0xFF) / 255;
            const quadAlpha = ((argb >>> 24) & 0xFF) / 255;

            const filterAlpha = (renderer.filter as { alphaMultiplier?: number } | null)?.alphaMultiplier ?? 1;
            const alpha = globalAlpha * quadAlpha * filterAlpha;

            if (alpha <= 0) continue;

            context.globalAlpha = alpha;

            const globalTint = globalColor & 0xFFFFFF;
            const quadTint = argb & 0xFFFFFF;

            const tint = bgr2rgb(multiplyHexColors(quadTint, globalTint));
            const frame = texture.frame;
            const repeatU = textureStyle.addressModeU ?? textureStyle.addressMode;
            const repeatV = textureStyle.addressModeV ?? textureStyle.addressMode;
            const repeat = CanvasBatchAdaptor._getPatternRepeat(repeatU, repeatV);

            const resolution = texture.source._resolution ?? texture.source.resolution ?? 1;

            const isFromCachedRenderGroup = ((quad as any).renderable as any)?.renderGroup?.isCachedAsTexture;

            const sx = frame.x * resolution;
            const sy = frame.y * resolution;
            const sw = frame.width * resolution;
            const sh = frame.height * resolution;

            const bounds = quad.bounds;

            const isRootTarget = renderer.renderTarget.renderTarget.isRoot;
            const dx = bounds.minX;
            const dy = bounds.minY;
            const dw = bounds.maxX - bounds.minX;
            const dh = bounds.maxY - bounds.minY;

            const rotate = texture.rotate;

            const uvs = texture.uvs;
            const uvMin = Math.min(uvs.x0, uvs.x1, uvs.x2, uvs.x3, uvs.y0, uvs.y1, uvs.y2, uvs.y3);
            const uvMax = Math.max(uvs.x0, uvs.x1, uvs.x2, uvs.x3, uvs.y0, uvs.y1, uvs.y2, uvs.y3);
            const needsRepeat = repeat !== 'no-repeat' && (uvMin < 0 || uvMax > 1);

            // Determine if we'll use getTintedCanvas (which handles rotation internally)
            // Use it for tinting OR rotation (for non-repeat path)
            const willUseProcessedCanvas = !needsRepeat && (tint !== 0xFFFFFF || rotate);
            // Only apply rotation transform when NOT using processed canvas (which handles rotation itself)
            const applyRotateTransform = rotate && !willUseProcessedCanvas;

            if (applyRotateTransform)
            {
                CanvasBatchAdaptor._tempPatternMatrix.copyFrom(quad.transform);
                groupD8.matrixAppendRotationInv(
                    CanvasBatchAdaptor._tempPatternMatrix,
                    rotate,
                    dx,
                    dy,
                    dw,
                    dh
                );
                contextSystem.setContextTransform(
                    CanvasBatchAdaptor._tempPatternMatrix,
                    quad.roundPixels === 1,
                    undefined,
                    isFromCachedRenderGroup && isRootTarget
                );
            }
            else
            {
                contextSystem.setContextTransform(
                    quad.transform,
                    quad.roundPixels === 1,
                    undefined,
                    isFromCachedRenderGroup && isRootTarget
                );
            }

            const drawX = applyRotateTransform ? 0 : dx;
            const drawY = applyRotateTransform ? 0 : dy;
            const drawW = dw;
            const drawH = dh;

            if (needsRepeat)
            {
                // We can now allow tinting for PMA textures because getCanvasSource
                // returns an un-premultiplied (straight alpha) version for Canvas.
                // NOTE: Don't use getTintedCanvas when rotated because it applies rotation compensation,
                // but the repeat path uses UV-based pattern transforms that expect the original rotated source.
                let patternSource = source;

                const canTint = tint !== 0xFFFFFF && !rotate;
                const fitsFrame = frame.width <= texture.source.width && frame.height <= texture.source.height;

                if (canTint && fitsFrame)
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
                // We can now allow tinting for PMA textures because getCanvasSource
                // returns an un-premultiplied (straight alpha) version for Canvas.
                // getTintedCanvas handles rotation internally, so use it for rotated textures too
                const needsProcessing = tint !== 0xFFFFFF || rotate;
                const processedSource = needsProcessing
                    ? canvasUtils.getTintedCanvas({ texture }, tint) as CanvasImageSource
                    : source;

                const isProcessed = processedSource !== source;

                context.drawImage(
                    processedSource,
                    isProcessed ? 0 : sx,
                    isProcessed ? 0 : sy,
                    isProcessed ? (processedSource as any).width : sw,
                    isProcessed ? (processedSource as any).height : sh,
                    drawX,
                    drawY,
                    drawW,
                    drawH
                );
            }
        }
    }
}
