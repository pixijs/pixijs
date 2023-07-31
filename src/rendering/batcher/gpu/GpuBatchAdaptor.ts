import { ExtensionType } from '../../../extensions/Extensions';
import { Shader } from '../../renderers/shared/shader/Shader';
import { MAX_TEXTURES } from '../shared/const';
import { generateDefaultBatchProgram } from './generateDefaultBatchProgram';
import { getTextureBatchBindGroup } from './getTextureBatchBindGroup';

import type { GpuEncoderSystem } from '../../renderers/gpu/GpuEncoderSystem';
import type { Batch } from '../shared/Batcher';
import type { BatcherAdaptor, BatcherPipe } from '../shared/BatcherPipe';

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

    public init()
    {
        this._shader = new Shader({
            gpuProgram: generateDefaultBatchProgram(MAX_TEXTURES),
            groups: {
                // these will be dynamically allocated
            },
        });
    }

    public execute(batchPipe: BatcherPipe, batch: Batch): void
    {
        batchPipe.state.blendMode = batch.blendMode;

        if (!batch.textures.bindGroup)
        {
            batch.textures.bindGroup = getTextureBatchBindGroup(batch.textures.textures);
        }

        const program = this._shader.gpuProgram;

        const encoder = batchPipe.renderer.encoder as GpuEncoderSystem;
        const globalUniformsBindGroup = batchPipe.renderer.globalUniforms.bindGroup;

        // create a state objects we need...
        this._shader.groups[1] = batch.textures.bindGroup;

        const activeBatcher = batch.batchParent;

        // TODO.. prolly should cache this?
        // or add it to the instructions?
        encoder.setPipelineFromGeometryProgramAndState(
            activeBatcher.geometry,
            program,
            batchPipe.state
        );

        encoder.setGeometry(activeBatcher.geometry);
        encoder.setBindGroup(0, globalUniformsBindGroup, program);
        encoder.setBindGroup(1, batch.textures.bindGroup, program);

        // TODO move this to a draw function on the pipe!
        encoder.renderPassEncoder.drawIndexed(batch.size, 1, batch.start);
    }

    public destroy(): void
    {
        this._shader.destroy(true);
        this._shader = null;
    }
}
