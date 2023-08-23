import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../renderers/shared/state/State';
import { getBatchedGeometry } from '../gpu/getBatchedGeometry';
import { Batcher } from './Batcher';

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
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'batch',
    } as const;

    public state: State = State.for2d();
    public renderer: Renderer;

    private _lastBatch: number;
    private _batches: Record<number, {
        geometry: Geometry;
        batcher: Batcher
    }> = Object.create(null);
    private _adaptor: BatcherAdaptor;

    constructor(renderer: Renderer, adaptor: BatcherAdaptor)
    {
        this.renderer = renderer;
        this._adaptor = adaptor;

        this._adaptor.init();
    }

    public buildStart(instructionSet: InstructionSet)
    {
        this._lastBatch = 0;

        if (!this._batches[instructionSet.uid])
        {
            this._batches[instructionSet.uid] = {
                batcher: new Batcher(),
                geometry: getBatchedGeometry(),
            };
        }

        this._batches[instructionSet.uid].batcher.begin();
    }

    public addToBatch(batchableObject: BatchableObject, instructionSet: InstructionSet)
    {
        this._batches[instructionSet.uid].batcher.add(batchableObject);
    }

    public break(instructionSet: InstructionSet)
    {
        const batcher = this._batches[instructionSet.uid].batcher;

        const hardBreak = instructionSet.instructionSize > 0 && (instructionSet.lastInstruction().type !== 'batch');

        batcher.break(hardBreak);

        while (this._lastBatch < batcher.batchIndex)
        {
            const batch = batcher.batches[this._lastBatch++];

            // TODO feel we can avoid this check...
            if (batch.elementSize !== 0)
            {
                batch.batchParent = this._batches[instructionSet.uid];

                instructionSet.instructions[instructionSet.instructionSize++] = batch;
            }
        }
    }

    public buildEnd(instructionSet: InstructionSet)
    {
        this.break(instructionSet);

        const { geometry, batcher } = this._batches[instructionSet.uid];

        if (batcher.elementSize === 0) return;

        batcher.finish();

        geometry.indexBuffer.data = batcher.indexBuffer;

        geometry.buffers[0].data = batcher.attributeBuffer.float32View;

        geometry.indexBuffer.update(batcher.indexSize * 4);
    }

    public upload(instructionSet: InstructionSet)
    {
        const activeBatcher = this._batches[instructionSet.uid];

        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (activeBatcher && activeBatcher.batcher.dirty)
        {
            activeBatcher.batcher.dirty = false;

            const attributeBuffer = activeBatcher.geometry.buffers[0];

            attributeBuffer.update(activeBatcher.batcher.attributeSize * 4);
        }
    }

    public execute(batch: Batch)
    {
        this._adaptor.execute(this, batch);
    }

    public destroy()
    {
        this.state = null;
        this._batches = null;
        this.renderer = null;

        this._adaptor.destroy();
        this._adaptor = null;

        for (const i in this._batches)
        {
            const batchData = this._batches[i];

            batchData.batcher.destroy();
            batchData.geometry.destroy();
        }
    }
}
