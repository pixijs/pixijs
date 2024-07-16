import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../renderers/shared/state/State';
import { Batcher } from './Batcher';
import { BatchGeometry } from './BatchGeometry';

import type { Geometry } from '../../renderers/shared/geometry/Geometry';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { BatchPipe, InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { Batch, BatchableObject } from './Batcher';

export interface BatcherAdaptor<P extends BatcherPipe>
{
    start(batchPipe: P, geometry: Geometry): void
    init(batchPipe: P): void;
    execute(batchPipe: P, batch: Batch): void
    destroy(): void;
    contextChange?(): void;
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
    private _maxTextures: number;

    private _batches: Record<number, Batcher> = Object.create(null);
    private _geometries: Record<number, Geometry> = Object.create(null);
    private _adaptor: BatcherAdaptor<this>;

    private _activeBatch: Batcher;
    private _activeGeometry: Geometry;

    constructor(renderer: Renderer, adaptor: BatcherAdaptor<BatcherPipe>)
    {
        this.renderer = renderer;
        this._maxTextures = this.renderer.shader.maxTextures;
        this._adaptor = adaptor;

        this._adaptor.init(this);

        this.renderer.runners.contextChange.add(this);
    }

    protected contextChange(): void
    {
        const maxTextures = this.renderer.shader.maxTextures;

        if (this._maxTextures === maxTextures) return;

        this._maxTextures = maxTextures;

        for (const i in this._batches)
        {
            this._batches[i].destroy();
        }

        this._batches = Object.create(null);
    }

    protected _createBatcher(): Batcher
    {
        return new Batcher({
            maxTextures: this.renderer.shader.maxTextures,
        });
    }

    protected _createGeometry(): Geometry
    {
        return new BatchGeometry();
    }

    public buildStart(instructionSet: InstructionSet)
    {
        if (!this._batches[instructionSet.uid])
        {
            const batcher = this._createBatcher();

            this._batches[instructionSet.uid] = batcher;
            this._geometries[batcher.uid] = this._createGeometry();
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
