import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../renderers/shared/state/State';
import { getTextureBatchBindGroup } from './getTextureBatchBindGroup';

import type { GpuEncoderSystem } from '../../renderers/gpu/GpuEncoderSystem';
import type { WebGPURenderer } from '../../renderers/gpu/WebGPURenderer';
import type { Geometry } from '../../renderers/shared/geometry/Geometry';
import type { Shader } from '../../renderers/shared/shader/Shader';
import type { Batch } from '../shared/Batcher';
import type { BatcherAdaptor, BatcherPipe } from '../shared/BatcherPipe';

const tempState = State.for2d();

/**
 * A BatcherAdaptor that uses the GPU to render batches.
 * @memberof rendering
 * @ignore
 */
export class GpuBatchAdaptor implements BatcherAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUPipesAdaptor,
        ],
        name: 'batch',
    } as const;

    private _shader: Shader;
    private _geometry: Geometry;

    public start(batchPipe: BatcherPipe, geometry: Geometry, shader: Shader): void
    {
        const renderer = batchPipe.renderer as WebGPURenderer;
        const encoder = renderer.encoder as GpuEncoderSystem;
        const program = shader.gpuProgram;

        this._shader = shader;
        this._geometry = geometry;

        encoder.setGeometry(geometry, program);

        tempState.blendMode = 'normal';

        // this just initiates the pipeline, so we can then set bind groups on it
        renderer.pipeline.getPipeline(
            geometry,
            program,
            tempState
        );

        const globalUniformsBindGroup = renderer.globalUniforms.bindGroup;

        // low level - we need to reset the bind group at location 1 to null
        // this is because we directly manipulate the bound buffer in the execute function for
        // performance reasons.
        // setting it to null ensures that the next bind group we set at location 1 will
        // be the one we want.
        encoder.resetBindGroup(1);

        encoder.setBindGroup(0, globalUniformsBindGroup, program);
    }

    public execute(batchPipe: BatcherPipe, batch: Batch): void
    {
        const program = this._shader.gpuProgram;
        const renderer = batchPipe.renderer as WebGPURenderer;
        const encoder = renderer.encoder as GpuEncoderSystem;

        if (!batch.bindGroup)
        {
            const textureBatch = batch.textures;

            batch.bindGroup = getTextureBatchBindGroup(textureBatch.textures, textureBatch.count);
        }

        tempState.blendMode = batch.blendMode;

        const gpuBindGroup = renderer.bindGroup.getBindGroup(
            batch.bindGroup, program, 1
        );

        const pipeline = renderer.pipeline.getPipeline(
            this._geometry,
            program,
            tempState,
            batch.topology
        );

        batch.bindGroup._touch(renderer.textureGC.count);

        encoder.setPipeline(pipeline);

        encoder.renderPassEncoder.setBindGroup(1, gpuBindGroup);
        encoder.renderPassEncoder.drawIndexed(batch.size, 1, batch.start);
    }
}
