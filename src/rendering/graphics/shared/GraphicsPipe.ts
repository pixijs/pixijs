import { ExtensionType } from '../../../extensions/Extensions';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { State } from '../../renderers/shared/state/State';
import { BatchableGraphics } from './BatchableGraphics';

import type { PoolItem } from '../../../utils/pool/Pool';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { BatchPipe, RenderPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Shader } from '../../renderers/shared/shader/Shader';
import type { GpuGraphicsContext, GraphicsContextSystem } from './GraphicsContextSystem';
import type { GraphicsView } from './GraphicsView';

export interface GraphicsAdaptor
{
    init(): void;
    execute(graphicsPipe: GraphicsPipe, renderable: Renderable<GraphicsView>): void;
    destroy(): void;
}

export interface GraphicsInstruction extends Instruction
{
    type: 'graphics';
    renderable: Renderable<GraphicsView>;
}

export interface GraphicsSystem
{
    graphicsContext: GraphicsContextSystem;
    renderPipes: {
        batch: BatchPipe
    }
}

export class GraphicsPipe implements RenderPipe<GraphicsView>
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLRendererPipes,
            ExtensionType.WebGPURendererPipes,
            ExtensionType.CanvasRendererPipes,
        ],
        name: 'graphics',
    } as const;

    renderer: GraphicsSystem;
    shader: Shader;
    state: State = State.for2d();

    // batchable graphics list, used to render batches
    private renderableBatchesHash: Record<number, BatchableGraphics[]> = {};
    private adaptor: GraphicsAdaptor;

    constructor(renderer: GraphicsSystem, adaptor: GraphicsAdaptor)
    {
        this.renderer = renderer;

        this.adaptor = adaptor;
        this.adaptor.init();
    }

    validateRenderable(renderable: Renderable<GraphicsView>): boolean
    {
        // assume context is dirty..

        const context = renderable.view.context;

        const wasBatched = !!this.renderableBatchesHash[renderable.uid];

        const gpuContext = this.renderer.graphicsContext.updateGpuContext(context);

        if (gpuContext.isBatchable || wasBatched !== gpuContext.isBatchable)
        {
            // TODO what if they are the same size??
            return true;
        }

        return false;
    }

    addRenderable(renderable: Renderable<GraphicsView>, instructionSet: InstructionSet)
    {
        const gpuContext = this.renderer.graphicsContext.updateGpuContext(renderable.view.context);

        // need to get batches here.. as we need to know if we can batch or not..
        // this also overrides the current batches..

        if (renderable.view.didUpdate)
        {
            renderable.view.didUpdate = false;

            this.rebuild(renderable);
        }

        if (gpuContext.isBatchable)
        {
            this.addToBatcher(renderable, instructionSet);
        }
        else
        {
            this.renderer.renderPipes.batch.break(instructionSet);
            instructionSet.add({
                type: 'graphics',
                renderable
            } as GraphicsInstruction);
        }
    }

    updateRenderable(renderable: Renderable<GraphicsView>)
    {
        const batches = this.renderableBatchesHash[renderable.uid];

        if (batches)
        {
            for (let i = 0; i < batches.length; i++)
            {
                const batch = batches[i];

                batch.batcher.updateElement(batch);
            }
        }
    }

    execute({ renderable }: GraphicsInstruction)
    {
        if (!renderable.isRenderable) return;

        this.adaptor.execute(this, renderable);
    }

    rebuild(renderable: Renderable<GraphicsView>)
    {
        const wasBatched = !!this.renderableBatchesHash[renderable.uid];

        const gpuContext = this.renderer.graphicsContext.updateGpuContext(renderable.view.context);

        // TODO POOL the old batches!

        if (wasBatched)
        {
            this.removeBatchForRenderable(renderable.uid);
        }

        if (gpuContext.isBatchable)
        {
            this.initBatchesForRenderable(renderable);
        }

        renderable.view.batched = gpuContext.isBatchable;
    }

    // Batchable graphics functions

    private addToBatcher(renderable: Renderable<GraphicsView>, instructionSet: InstructionSet)
    {
        const batchPipe = this.renderer.renderPipes.batch;

        const batches = this.getBatchesForRenderable(renderable);

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batchPipe.addToBatch(batch, instructionSet);
        }
    }

    private getBatchesForRenderable(renderable: Renderable<GraphicsView>): BatchableGraphics[]
    {
        return this.renderableBatchesHash[renderable.uid] || this.initBatchesForRenderable(renderable);
    }

    private initBatchesForRenderable(renderable: Renderable<GraphicsView>): BatchableGraphics[]
    {
        const context = renderable.view.context;

        const gpuContext: GpuGraphicsContext = this.renderer.graphicsContext.getGpuContext(context);

        const batches = gpuContext.batches.map((batch) =>
        {
            // TODO pool this!!
            const batchClone = BigPool.get(BatchableGraphics);

            batch.copyTo(batchClone);

            batchClone.renderable = renderable;

            return batchClone;
        });

        this.renderableBatchesHash[renderable.uid] = batches;

        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        renderable.on('destroyed', () =>
        {
            this.destroyRenderable(renderable);
        });

        return batches;
    }

    destroyRenderable(renderable: Renderable<GraphicsView>)
    {
        this.removeBatchForRenderable(renderable.uid);
    }

    private removeBatchForRenderable(renderableUid: number)
    {
        this.renderableBatchesHash[renderableUid].forEach((batch) =>
        {
            BigPool.return(batch as PoolItem);
        });

        this.renderableBatchesHash[renderableUid] = null;
    }

    destroy()
    {
        this.renderer = null;
        this.shader.destroy();
        this.shader = null;

        this.adaptor.destroy();
        this.adaptor = null;
        this.state = null;

        for (const i in this.renderableBatchesHash)
        {
            this.removeBatchForRenderable(i as unknown as number);
        }

        this.renderableBatchesHash = null;
    }
}
