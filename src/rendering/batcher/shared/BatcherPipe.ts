import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../renderers/shared/state/State';
import { getBatchedGeometry } from '../gpu/getBatchedGeometry';
import { Batcher } from './Batcher';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Geometry } from '../../renderers/shared/geometry/Geometry';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { BatchPipe, InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { Batch, BatchableObject } from './Batcher';

export interface BatcherAdaptor
{
    init(): void;
    execute(batchPipe: BatcherPipe, batch: Batch): void
    destroy(): void;
}

// eslint-disable-next-line max-len
export class BatcherPipe implements InstructionPipe<Batch>, BatchPipe
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererPipes,
            ExtensionType.WebGPURendererPipes,
            ExtensionType.CanvasRendererPipes,
        ],
        name: 'batch',
    };

    toUpdate: BatchableObject[] = [];
    instructionSet: InstructionSet;
    activeBatcher: {
        geometry: Geometry;
        batcher: Batcher
    };

    // shader: GpuShader;
    state: State = State.for2d();
    lastBatch: number;
    private _batches: Record<number, {
        geometry: Geometry;
        batcher: Batcher
    }> = {};
    renderer: Renderer;
    adaptor: BatcherAdaptor;

    constructor(renderer: Renderer, adaptor: BatcherAdaptor)
    {
        this.renderer = renderer;
        this.adaptor = adaptor;

        this.adaptor.init();
    }

    buildStart(instructionSet: InstructionSet)
    {
        this.lastBatch = 0;

        if (!this._batches[instructionSet.uid])
        {
            this._batches[instructionSet.uid] = {
                batcher: new Batcher(),
                geometry: getBatchedGeometry(),
            };
        }

        this._batches[instructionSet.uid].batcher.begin();
    }

    addToBatch(batchableObject: BatchableObject, instructionSet: InstructionSet)
    {
        this._batches[instructionSet.uid].batcher.add(batchableObject);
    }

    break(instructionSet: InstructionSet)
    {
        const batcher = this._batches[instructionSet.uid].batcher;

        const hardBreak = instructionSet.instructionSize > 0 && (instructionSet.lastInstruction().type !== 'batch');

        batcher.break(hardBreak);

        while (this.lastBatch < batcher.batchIndex)
        {
            const batch = batcher.batches[this.lastBatch++];

            // TODO feel we can avoid this check...
            if (batch.elementSize !== 0)
            {
                batch.batchParent = this._batches[instructionSet.uid];

                instructionSet.instructions[instructionSet.instructionSize++] = batch;
            }
        }
    }

    buildEnd(instructionSet: InstructionSet)
    {
        this.break(instructionSet);

        const { geometry, batcher } = this._batches[instructionSet.uid];

        if (batcher.elementSize === 0) return;

        batcher.finish();

        geometry.indexBuffer.data = batcher.indexBuffer;

        geometry.buffers[0].data = batcher.attributeBuffer.float32View;

        geometry.indexBuffer.update(batcher.indexSize * 4);
    }

    upload(instructionSet: InstructionSet)
    {
        const activeBatcher = this._batches[instructionSet.uid];

        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (activeBatcher && activeBatcher.batcher.dirty)
        {
            activeBatcher.batcher.dirty = false;

            const attributeBuffer = activeBatcher.geometry.buffers[0];

            attributeBuffer.update(activeBatcher.batcher.attributeSize * 4);
            this.renderer.buffer.updateBuffer(attributeBuffer);
        }
    }

    execute(batch: Batch)
    {
        this.adaptor.execute(this, batch);
    }

    destroy()
    {
        this.toUpdate = null;
        this.instructionSet = null;
        this.activeBatcher = null;
        this.state = null;
        this._batches = null;
        this.renderer = null;

        this.adaptor.destroy();
        this.adaptor = null;

        for (const i in this._batches)
        {
            const batchData = this._batches[i];

            batchData.batcher.destroy();
            batchData.geometry.destroy();
        }
    }
}
