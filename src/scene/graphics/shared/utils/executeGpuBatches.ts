import { getTextureBatchBindGroup } from '../../../../rendering/batcher/gpu/getTextureBatchBindGroup';

import type { Batch, Batcher } from '../../../../rendering/batcher/shared/Batcher';
import type { GpuEncoderSystem } from '../../../../rendering/renderers/gpu/GpuEncoderSystem';
import type { WebGPURenderer } from '../../../../rendering/renderers/gpu/WebGPURenderer';
import type { Topology } from '../../../../rendering/renderers/shared/geometry/const';
import type { InstructionSet } from '../../../../rendering/renderers/shared/instructions/InstructionSet';
import type { Shader } from '../../../../rendering/renderers/shared/shader/Shader';
import type { State } from '../../../../rendering/renderers/shared/state/State';

/**
 * Shared GPU draw loop used by both GraphicsPipe and SmoothGraphicsPipe adaptors.
 * Sets geometry, bind groups, iterates batches with topology tracking, and issues indexed draws.
 * @param renderer - The WebGPU renderer
 * @param shader - The compiled shader to use
 * @param batcher - The batcher containing geometry
 * @param instructions - The instruction set with batch draw commands
 * @param state - The render state (blend mode, etc.)
 * @param maxTextures - Maximum batchable textures for bind group creation
 * @internal
 */
export function executeGpuBatches(
    renderer: WebGPURenderer,
    shader: Shader,
    batcher: Batcher,
    instructions: InstructionSet,
    state: State,
    maxTextures: number,
): void
{
    const encoder = renderer.encoder as GpuEncoderSystem;

    encoder.setGeometry(batcher.geometry, shader.gpuProgram);

    const globalUniformsBindGroup = renderer.globalUniforms.bindGroup;

    encoder.setBindGroup(0, globalUniformsBindGroup, shader.gpuProgram);

    const localBindGroup = renderer
        .renderPipes.uniformBatch.getUniformBindGroup(shader.resources.localUniforms, true);

    encoder.setBindGroup(2, localBindGroup, shader.gpuProgram);

    const batches = instructions.instructions as Batch[];

    let topology: Topology = null;

    for (let i = 0; i < instructions.instructionSize; i++)
    {
        const batch = batches[i];

        if (batch.topology !== topology)
        {
            topology = batch.topology;

            encoder.setPipelineFromGeometryProgramAndState(
                batcher.geometry,
                shader.gpuProgram,
                state,
                batch.topology
            );
        }

        shader.groups[1] = batch.bindGroup;

        if (!batch.gpuBindGroup)
        {
            const textureBatch = batch.textures;

            batch.bindGroup = getTextureBatchBindGroup(
                textureBatch.textures,
                textureBatch.count,
                maxTextures
            );

            batch.gpuBindGroup = renderer.bindGroup.getBindGroup(
                batch.bindGroup, shader.gpuProgram, 1
            );
        }

        encoder.setBindGroup(1, batch.bindGroup, shader.gpuProgram);

        encoder.renderPassEncoder.drawIndexed(batch.size, 1, batch.start);
    }
}
