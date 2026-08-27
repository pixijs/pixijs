import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../renderers/shared/state/State';
import { DefaultBatcher } from './DefaultBatcher';

import type { Geometry } from '../../renderers/shared/geometry/Geometry';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { BatchPipe, InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Shader } from '../../renderers/shared/shader/Shader';
import type { Renderer } from '../../renderers/types';
import type { Batch, BatchableElement, Batcher, BatcherOptions } from './Batcher';

/** @internal */
export interface BatcherAdaptor
{
    start(batchPipe: BatcherPipe, geometry: Geometry, shader: Shader): void
    init?(batchPipe: BatcherPipe): void;
    execute(batchPipe: BatcherPipe, batch: Batch): void
    contextChange?(): void;
}

/**
 * A pipe that batches elements into batches and sends them to the renderer.
 *
 * You can install new Batchers using ExtensionType.Batcher. Each render group will
 * have a default batcher and any required ones will be created on demand.
 * @category rendering
 * @advanced
 */
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

    private readonly _batchersByInstructionSet: Record<number, Record<string, Batcher>> = Object.create(null);

    /**
     * Batchers released by destroyed instruction sets, pooled for reuse by new
     * ones (keyed by batcher name). Reusing a batcher reuses its geometry and
     * the underlying GPU buffers across frames, instead of allocating fresh
     * ones for every rebuilt scene.
     */
    private readonly _batcherPool: Record<string, Batcher[]> = Object.create(null);

    private _adaptor: BatcherAdaptor;

    /** A record of all active batchers, keyed by their names */
    private _activeBatches: Record<string, Batcher> = Object.create(null);

    /** The currently active batcher being used to batch elements */
    private _activeBatch: Batcher;

    public static _availableBatchers: Record<string, new (options: BatcherOptions) => Batcher> = Object.create(null);

    /** How many released batchers to keep per batcher name for reuse. */
    private static readonly _maxPooledBatchers = 64;

    public static getBatcher(name: string, maxTextures: number): Batcher
    {
        return new this._availableBatchers[name as keyof typeof this._availableBatchers]({ maxTextures });
    }

    constructor(renderer: Renderer, adaptor: BatcherAdaptor)
    {
        this.renderer = renderer;
        this._adaptor = adaptor;

        this._adaptor.init?.(this);
    }

    public buildStart(instructionSet: InstructionSet)
    {
        let batchers = this._batchersByInstructionSet[instructionSet.uid];

        if (!batchers)
        {
            batchers = this._batchersByInstructionSet[instructionSet.uid] = Object.create(null);
            batchers.default ||= this._batcherPool.default?.pop() ?? new DefaultBatcher({
                maxTextures: this.renderer.limits.maxBatchableTextures,
            });
        }

        this._activeBatches = batchers;

        this._activeBatch = this._activeBatches.default;

        for (const i in this._activeBatches)
        {
            this._activeBatches[i].begin();
        }
    }

    public addToBatch(batchableObject: BatchableElement, instructionSet: InstructionSet)
    {
        if (this._activeBatch.name !== batchableObject.batcherName)
        {
            this._activeBatch.break(instructionSet);

            let batch = this._activeBatches[batchableObject.batcherName];

            if (!batch)
            {
                batch = this._activeBatches[batchableObject.batcherName]
                    = this._batcherPool[batchableObject.batcherName]?.pop()
                        ?? BatcherPipe.getBatcher(batchableObject.batcherName, this.renderer.limits.maxBatchableTextures);
                batch.begin();
            }

            this._activeBatch = batch;
        }

        this._activeBatch.add(batchableObject);
    }

    public break(instructionSet: InstructionSet)
    {
        this._activeBatch.break(instructionSet);
    }

    public buildEnd(instructionSet: InstructionSet)
    {
        this._activeBatch.break(instructionSet);

        const batches = this._activeBatches;

        for (const i in batches)
        {
            const batch = batches[i as keyof typeof batches];
            const geometry = batch.geometry;

            geometry.indexBuffer.setDataWithSize(batch.indexBuffer, batch.indexSize, true);

            geometry.buffers[0].setDataWithSize(batch.attributeBuffer.float32View, batch.attributeSize, false);
        }
    }

    public upload(instructionSet: InstructionSet)
    {
        const batchers = this._batchersByInstructionSet[instructionSet.uid];

        for (const i in batchers)
        {
            const batcher = batchers[i as keyof typeof batchers];
            const geometry = batcher.geometry;

            if (batcher.dirty)
            {
                batcher.dirty = false;

                geometry.buffers[0].update(batcher.attributeSize * 4);
            }
        }
    }

    /**
     * Called when an instruction set is destroyed: returns its batchers to the
     * pool so future instruction sets reuse them (geometry, buffers and all)
     * rather than allocating new ones every frame.
     * @param instructionSet - the destroyed instruction set
     */
    public destroyInstructionSet(instructionSet: InstructionSet)
    {
        // the pipe itself may already have been destroyed (renderer torn down
        // before the scene) - nothing to release then
        if (!this._batcherPool) return;

        const batchers = this._batchersByInstructionSet[instructionSet.uid];

        if (!batchers) return;

        delete this._batchersByInstructionSet[instructionSet.uid];

        // _activeBatches may still point at this record; drop it so the pipe's
        // own destroy() cannot double-destroy pooled batchers
        if (this._activeBatches === batchers)
        {
            this._activeBatches = Object.create(null);
        }

        for (const name in batchers)
        {
            const batcher = batchers[name];
            const pool = (this._batcherPool[name] ??= []);

            if (pool.length < BatcherPipe._maxPooledBatchers)
            {
                pool.push(batcher);
            }
            else
            {
                batcher.destroy();
            }
        }
    }

    public execute(batch: Batch)
    {
        if (batch.action === 'startBatch')
        {
            const batcher = batch.batcher;
            const geometry = batcher.geometry;
            const shader = batcher.shader;

            this._adaptor.start(this, geometry, shader);
        }

        this._adaptor.execute(this, batch);
    }

    public destroy()
    {
        this.state = null;
        this.renderer = null;

        this._adaptor = null;

        for (const i in this._activeBatches)
        {
            this._activeBatches[i].destroy();
        }

        this._activeBatches = null;

        for (const name in this._batcherPool)
        {
            const pool = this._batcherPool[name];

            for (let i = 0; i < pool.length; i++)
            {
                pool[i].destroy();
            }
        }

        (this._batcherPool as null) = null;
    }
}

extensions.handleByMap(ExtensionType.Batcher, BatcherPipe._availableBatchers);

extensions.add(DefaultBatcher);
