import { ExtensionType } from '../../../../extensions/Extensions';
import { getMaxTexturesPerBatch } from '../../../../rendering/batcher/gl/utils/maxRecommendedTextures';
import { Batcher } from '../../../../rendering/batcher/shared/Batcher';
import { SmoothBatchGeometry } from './SmoothBatchGeometry';
import { SmoothShader } from './SmoothShader';

import type {
    BatchableMeshElement, BatchableQuadElement, BatcherOptions,
} from '../../../../rendering/batcher/shared/Batcher';
import type { Shader } from '../../../../rendering/renderers/shared/shader/Shader';
import type { BatchableSmoothGraphics } from '../BatchableSmoothGraphics';

let smoothShader: Shader = null;

/** Source geometry stride: 10 floats per vertex */
const GEOM_STRIDE = 10;

/**
 * Batcher for smooth HHAA graphics. Registered as 'smooth'.
 *
 * Reads 10-float-per-vertex geometry data from BatchableSmoothGraphics elements
 * and writes 14-float-per-vertex output with pre-transformed positions and
 * per-vertex style data.
 * @category rendering
 * @advanced
 */
export class SmoothBatcher extends Batcher
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.Batcher,
        ],
        name: 'smooth',
    } as const;

    public geometry = new SmoothBatchGeometry();
    public shader: SmoothShader;

    public name = SmoothBatcher.extension.name;
    protected vertexSize = 14;

    constructor(options?: BatcherOptions)
    {
        super(options);

        smoothShader ??= new SmoothShader(options?.maxTextures ?? getMaxTexturesPerBatch());
        this.shader = smoothShader as SmoothShader;
    }

    /**
     * Pack 10-float source geometry into 14-float output with transform, style, and color.
     * @param element - Smooth graphics batchable element
     * @param float32View - Output float32 view
     * @param uint32View - Output uint32 view
     * @param index - Starting float offset in output
     * @param textureId - Texture slot ID
     */
    public packAttributes(
        element: BatchableMeshElement,
        float32View: Float32Array,
        uint32View: Uint32Array,
        index: number,
        textureId: number,
    ): void
    {
        const smoothElement = element as unknown as BatchableSmoothGraphics;
        const wt = smoothElement.transform;
        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;

        const srcFloats = smoothElement.geometryData.vertices;
        const offset = smoothElement.attributeOffset;
        const count = smoothElement.attributeSize;

        const elementScale = smoothElement.pixelLine
            ? 1
            : Math.sqrt(Math.abs((a * d) - (b * c)));
        const effectiveLineWidth = smoothElement.lineWidth * elementScale;

        const avgScale = elementScale;

        // Pack alignment + pixelLine into a single float:
        // integer part = 0 (pixelLine/no-scale) or 1 (normal scale)
        // fractional part = alignment (0-1)
        const stylePacked = (smoothElement.pixelLine ? 0 : 1) + smoothElement.alignment;

        const argb = smoothElement.color;
        const textureIdAndRound = (textureId << 16) | (smoothElement.roundPixels & 0xFFFF);

        for (let i = 0; i < count; i++)
        {
            const srcBase = (offset + i) * GEOM_STRIDE;

            // Transform prev (2 floats)
            const prevX = srcFloats[srcBase];
            const prevY = srcFloats[srcBase + 1];

            float32View[index] = (a * prevX) + (c * prevY) + tx;
            float32View[index + 1] = (b * prevX) + (d * prevY) + ty;

            // Transform point1 (2 floats)
            const p1x = srcFloats[srcBase + 2];
            const p1y = srcFloats[srcBase + 3];

            float32View[index + 2] = (a * p1x) + (c * p1y) + tx;
            float32View[index + 3] = (b * p1x) + (d * p1y) + ty;

            // Transform point2 (2 floats)
            const p2x = srcFloats[srcBase + 4];
            const p2y = srcFloats[srcBase + 5];

            float32View[index + 4] = (a * p2x) + (c * p2y) + tx;
            float32View[index + 5] = (b * p2x) + (d * p2y) + ty;

            // Transform next (2 floats)
            const nextX = srcFloats[srcBase + 6];
            const nextY = srcFloats[srcBase + 7];

            float32View[index + 6] = (a * nextX) + (c * nextY) + tx;
            float32View[index + 7] = (b * nextX) + (d * nextY) + ty;

            // Travel (scaled by avgScale)
            float32View[index + 8] = srcFloats[srcBase + 8] * avgScale;
            // VertexJoint (unchanged)
            float32View[index + 9] = srcFloats[srcBase + 9];

            // Per-vertex style data
            float32View[index + 10] = effectiveLineWidth;
            float32View[index + 11] = stylePacked;
            uint32View[index + 12] = argb;
            uint32View[index + 13] = textureIdAndRound;

            index += 14;
        }
    }

    /**
     * Smooth graphics never use quad packing, so this is a no-op.
     * @param _element - unused
     * @param _float32View - unused
     * @param _uint32View - unused
     * @param _index - unused
     * @param _textureId - unused
     */
    public packQuadAttributes(
        _element: BatchableQuadElement,
        _float32View: Float32Array,
        _uint32View: Uint32Array,
        _index: number,
        _textureId: number,
    ): void
    {
        // Smooth graphics are mesh-based only
    }

    /**
     * Updates the maximum number of textures used in the shader.
     * @param maxTextures - new max textures
     * @internal
     */
    public _updateMaxTextures(maxTextures: number): void
    {
        if (this.shader.maxTextures === maxTextures) return;
        smoothShader = new SmoothShader(maxTextures);
        this.shader = smoothShader as SmoothShader;
    }

    public override destroy(): void
    {
        this.shader = null;
        super.destroy();
    }
}
