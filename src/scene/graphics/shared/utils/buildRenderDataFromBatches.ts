import { getTextureBatchBindGroup } from '../../../../rendering/batcher/gpu/getTextureBatchBindGroup';

import type { BatchableElement, Batcher } from '../../../../rendering/batcher/shared/Batcher';
import type { InstructionSet } from '../../../../rendering/renderers/shared/instructions/InstructionSet';

/** @internal */
type GraphicsBatchElement = BatchableElement & { applyTransform: boolean };

/**
 * Shared batcher feed-and-upload routine used by both GraphicsContextSystem
 * and SmoothGraphicsContextSystem when building non-batchable render data.
 *
 * Disables per-element transforms, ensures buffer capacity, feeds all elements
 * through the batcher, uploads geometry, and creates texture bind groups.
 * @param batcher - The batcher to feed elements into
 * @param instructions - The instruction set to populate with draw commands
 * @param batches - The batchable elements to process
 * @param vertexSize - Total vertex buffer size needed
 * @param indexSize - Total index buffer size needed
 * @param maxTextures - Maximum batchable textures for bind group creation
 * @internal
 */
export function buildRenderDataFromBatches(
    batcher: Batcher,
    instructions: InstructionSet,
    batches: GraphicsBatchElement[],
    vertexSize: number,
    indexSize: number,
    maxTextures: number,
): void
{
    for (let i = 0; i < batches.length; i++)
    {
        batches[i].applyTransform = false;
    }

    batcher.ensureAttributeBuffer(vertexSize);
    batcher.ensureIndexBuffer(indexSize);

    batcher.begin();

    for (let i = 0; i < batches.length; i++)
    {
        batcher.add(batches[i]);
    }

    batcher.finish(instructions);

    const geometry = batcher.geometry;

    geometry.indexBuffer.setDataWithSize(batcher.indexBuffer, batcher.indexSize, true);
    geometry.buffers[0].setDataWithSize(batcher.attributeBuffer.float32View, batcher.attributeSize, true);

    const drawBatches = batcher.batches;

    for (let i = 0; i < drawBatches.length; i++)
    {
        const batch = drawBatches[i];

        batch.bindGroup = getTextureBatchBindGroup(
            batch.textures.textures,
            batch.textures.count,
            maxTextures
        );
    }
}
