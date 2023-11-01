import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../renderers/shared/state/State';
import { BatchGeometry } from '../gpu/BatchGeometry';
import { Batcher } from './Batcher';

import type { Geometry } from '../../renderers/shared/geometry/Geometry';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { BatchPipe, InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { Batch, BatchableObject } from './Batcher';

export interface BatcherAdaptor
{
    start(batchPipe: BatcherPipe, geometry: Geometry): void
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

    private _batches: Record<number, Batcher> = Object.create(null);
    private _geometries: Record<number, BatchGeometry> = Object.create(null);
    private _adaptor: BatcherAdaptor;

    private _activeBatch: Batcher;
    private _activeGeometry: Geometry;

    constructor(renderer: Renderer, adaptor: BatcherAdaptor)
    {
        this.renderer = renderer;
        this._adaptor = adaptor;

        this._adaptor.init();
    }

    public buildStart(instructionSet: InstructionSet)
    {
        if (!this._batches[instructionSet.uid])
        {
            const batcher = new Batcher();

            this._batches[instructionSet.uid] = batcher;
            this._geometries[batcher.uid] = new BatchGeometry();
        }

        this._activeBatch = this._batches[instructionSet.uid];
        this._activeGeometry = this._geometries[this._activeBatch.uid];

        this._activeBatch.begin();
    }

    public addToBatch(batchableObject: BatchableObject)
    {
        this._activeBatch.add(batchableObject);
    }

    public break(instructionSet: InstructionSet)
    {
        this._activeBatch.break(instructionSet);
    }

    public buildEnd(instructionSet: InstructionSet)
    {
        const activeBatch = this._activeBatch;
        const geometry = this._activeGeometry;

        activeBatch.finish(instructionSet);

        geometry.indexBuffer.setDataWithSize(activeBatch.indexBuffer, activeBatch.indexSize, true);

        geometry.buffers[0].setDataWithSize(activeBatch.attributeBuffer.float32View, activeBatch.attributeSize, false);
    }

    public upload(instructionSet: InstructionSet)
    {
        const batcher = this._batches[instructionSet.uid];
        const geometry = this._geometries[batcher.uid];

        if (batcher.dirty)
        {
            batcher.dirty = false;
            geometry.buffers[0].update(batcher.attributeSize * 4);
        }
    }

    public execute(batch: Batch)
    {
        if (batch.action === 'startBatch')
        {
            const batcher = batch.batcher;
            const geometry = this._geometries[batcher.uid];

            this._adaptor.start(this, geometry);
        }

        this._adaptor.execute(this, batch);
    }

    public destroy()
    {
        this.state = null;
        this.renderer = null;

        this._adaptor.destroy();
        this._adaptor = null;

        for (const i in this._batches)
        {
            this._batches[i].destroy();
        }

        this._batches = null;

        for (const i in this._geometries)
        {
            this._geometries[i].destroy();
        }

        this._geometries = null;
    }
}
