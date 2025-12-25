import { ExtensionType } from '../../../extensions/Extensions';
import { groupD8 } from '../../../maths/matrix/groupD8';
import { Matrix } from '../../../maths/matrix/Matrix';
import { bgr2rgb } from '../../../scene/container/container-mixins/getGlobalMixin';
import { multiplyHexColors } from '../../../scene/container/utils/multiplyHexColors';
import { canvasUtils } from '../../renderers/canvas/utils/canvasUtils';
import { type PatternRepetition } from '~/scene';

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

            contextSystem.setBlendMode(element.blendMode);

            const globalColor = renderer.globalUniforms.globalUniformData?.worldColor ?? 0xFFFFFFFF;
            const argb = quad.color;

            const globalAlpha = ((globalColor >>> 24) & 0xFF) / 255;
            const quadAlpha = ((argb >>> 24) & 0xFF) / 255;

            const alpha = globalAlpha * quadAlpha;

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

            const sx = frame.x * resolution;
            const sy = frame.y * resolution;
            const sw = frame.width * resolution;
            const sh = frame.height * resolution;

            const bounds = quad.bounds;

            // For cached texture sprites (render groups), the bounds have an offset that's already
            // in world space. Since we skip the global transform, we need to normalize to (0,0)
            const isFromCachedRenderGroup = ((quad as any).renderable as any)?.renderGroup?.isCachedAsTexture;
            const dx = isFromCachedRenderGroup ? 0 : bounds.minX;
            const dy = isFromCachedRenderGroup ? 0 : bounds.minY;
            const dw = bounds.maxX - bounds.minX;
            const dh = bounds.maxY - bounds.minY;

            const rotate = texture.rotate;

            if (rotate)
            {
                CanvasBatchAdaptor._tempPatternMatrix.copyFrom(quad.transform);
                groupD8.matrixAppendRotationInv(
                    CanvasBatchAdaptor._tempPatternMatrix,
                    rotate,
                    dx,
                    dy
                );
                contextSystem.setContextTransform(
                    CanvasBatchAdaptor._tempPatternMatrix,
                    quad.roundPixels === 1,
                    undefined,
                    isFromCachedRenderGroup
                );
            }
            else
            {
                contextSystem.setContextTransform(
                    quad.transform,
                    quad.roundPixels === 1,
                    undefined,
                    isFromCachedRenderGroup
                );
            }

            const drawX = rotate ? 0 : dx;
            const drawY = rotate ? 0 : dy;
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

                const isTinted = tintedSource !== source;

                context.drawImage(
                    tintedSource,
                    isTinted ? 0 : sx,
                    isTinted ? 0 : sy,
                    isTinted ? (tintedSource as any).width : sw,
                    isTinted ? (tintedSource as any).height : sh,
                    drawX,
                    drawY,
                    drawW,
                    drawH
                );
            }
        }
    }
}
