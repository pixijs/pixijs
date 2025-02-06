import { ExtensionType } from '../../../extensions/Extensions';
import { Batch2DArrayGeometry } from './Batch2DArrayGeometry';
import { Batcher } from './Batcher';
import { Default2DArrayShader } from './Default2DArrayShader';

import type { Shader } from '../../renderers/shared/shader/Shader';
import type { BatchableMeshElement, BatchableQuadElement } from './Batcher';
import type { DefaultBatchElements } from './DefaultBatcher';

let defaultShader2DArray: Shader = null;

/**
 * Represents the common elements for default 2darray batch rendering.
 * This interface defines the properties that are used by the Default2DArrayBatcher
 * to render elements efficiently in a batch.
 * @memberof rendering
 */
export interface Default2dArrayBatchElements extends DefaultBatchElements
{
    /** The layer ID of the element. This is used to determine the lauer from array_2d_array textures. */
    layerId: number;
}

/**
 * Represents a batchable quad element with default batch properties.
 * @memberof rendering
 */
export interface Default2DArrayBatchableQuadElement extends BatchableQuadElement, Default2dArrayBatchElements {}

/**
 * Represents a batchable mesh element with default batch properties.
 * @memberof rendering
 */
export interface Default2DArrayBatchableMeshElement extends BatchableMeshElement, Default2dArrayBatchElements {}

/**
 * The default batcher is used to batch quads and meshes. This batcher will batch the following elements:
 * - tints
 * - roundPixels
 * - texture
 * - transform
 * @memberof rendering
 */
export class Default2DArrayBatcher extends Batcher
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.Batcher,
        ],
        name: 'default2darray',
    } as const;

    public geometry = new Batch2DArrayGeometry();
    public shader = defaultShader2DArray || (defaultShader2DArray = new Default2DArrayShader(this.maxTextures));

    public name = Default2DArrayBatcher.extension.name;

    /** The size of one attribute. 1 = 32 bit. x, y, u, v, color, textureIdAndRound, layerId -> total = 7 */
    public vertexSize = 7;

    /**
     * Packs the attributes of a DefaultBatchableMeshElement into the provided views.
     * @param element - The DefaultBatchableMeshElement to pack.
     * @param float32View - The Float32Array view to pack into.
     * @param uint32View - The Uint32Array view to pack into.
     * @param index - The starting index in the views.
     * @param textureId - The texture ID to use.
     */
    public packAttributes(
        element: Default2DArrayBatchableMeshElement,
        float32View: Float32Array,
        uint32View: Uint32Array,
        index: number,
        textureId: number
    )
    {
        const textureIdAndRound = (textureId << 16) | (element.roundPixels & 0xFFFF);
        const layerId = element.layerId;

        const wt = element.transform;

        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;

        const { positions, uvs } = element;

        const argb = element.color;

        const offset = element.attributeOffset;
        const end = offset + element.attributeSize;

        for (let i = offset; i < end; i++)
        {
            const i2 = i * 2;

            const x = positions[i2];
            const y = positions[(i2) + 1];

            float32View[index++] = (a * x) + (c * y) + tx;
            float32View[index++] = (d * y) + (b * x) + ty;

            float32View[index++] = uvs[i2];
            float32View[index++] = uvs[(i2) + 1];

            uint32View[index++] = argb;
            uint32View[index++] = textureIdAndRound;
            float32View[index++] = layerId;
        }
    }

    /**
     * Packs the attributes of a DefaultBatchableQuadElement into the provided views.
     * @param element - The DefaultBatchableQuadElement to pack.
     * @param float32View - The Float32Array view to pack into.
     * @param uint32View - The Uint32Array view to pack into.
     * @param index - The starting index in the views.
     * @param textureId - The texture ID to use.
     */
    public packQuadAttributes(
        element: Default2DArrayBatchableQuadElement,
        float32View: Float32Array,
        uint32View: Uint32Array,
        index: number,
        textureId: number
    )
    {
        const texture = element.texture;
        const layerId = element.layerId;

        const wt = element.transform;

        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;

        const bounds = element.bounds;

        const w0 = bounds.maxX;
        const w1 = bounds.minX;
        const h0 = bounds.maxY;
        const h1 = bounds.minY;

        const uvs = texture.uvs;

        // _ _ _ _
        // a b g r
        const argb = element.color;

        const textureIdAndRound = (textureId << 16) | (element.roundPixels & 0xFFFF);

        float32View[index + 0] = (a * w1) + (c * h1) + tx;
        float32View[index + 1] = (d * h1) + (b * w1) + ty;

        float32View[index + 2] = uvs.x0;
        float32View[index + 3] = uvs.y0;

        uint32View[index + 4] = argb;
        uint32View[index + 5] = textureIdAndRound;
        float32View[index + 6] = layerId;

        // xy
        float32View[index + 7] = (a * w0) + (c * h1) + tx;
        float32View[index + 8] = (d * h1) + (b * w0) + ty;

        float32View[index + 9] = uvs.x1;
        float32View[index + 10] = uvs.y1;

        uint32View[index + 11] = argb;
        uint32View[index + 12] = textureIdAndRound;
        float32View[index + 13] = layerId;

        // xy
        float32View[index + 14] = (a * w0) + (c * h0) + tx;
        float32View[index + 15] = (d * h0) + (b * w0) + ty;

        float32View[index + 16] = uvs.x2;
        float32View[index + 17] = uvs.y2;

        uint32View[index + 18] = argb;
        uint32View[index + 19] = textureIdAndRound;
        float32View[index + 20] = layerId;

        // xy
        float32View[index + 21] = (a * w1) + (c * h0) + tx;
        float32View[index + 22] = (d * h0) + (b * w1) + ty;

        float32View[index + 23] = uvs.x3;
        float32View[index + 24] = uvs.y3;

        uint32View[index + 25] = argb;
        uint32View[index + 26] = textureIdAndRound;
        float32View[index + 27] = layerId;
    }
}

