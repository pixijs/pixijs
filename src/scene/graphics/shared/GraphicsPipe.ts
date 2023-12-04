import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../../rendering/renderers/shared/state/State';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { color32BitToUniform } from '../gpu/colorToUniform';
import { BatchableGraphics } from './BatchableGraphics';

import type { Instruction } from '../../../rendering/renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { BatchPipe, RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { GpuGraphicsContext, GraphicsContextSystem } from './GraphicsContextSystem';
import type { GraphicsView } from './GraphicsView';

export interface GraphicsAdaptor
{
    shader: Shader;
    init(): void;
    execute(graphicsPipe: GraphicsPipe, renderable: Renderable<GraphicsView>): void;
    destroy(): void;
}

export interface GraphicsInstruction extends Instruction
{
    renderPipeId: 'graphics';
    renderable: Renderable<GraphicsView>;
}

export interface GraphicsSystem
{
    graphicsContext: GraphicsContextSystem;
    renderPipes: {
        batch: BatchPipe
    }
    _roundPixels: 0 | 1;
}

export class GraphicsPipe implements RenderPipe<GraphicsView>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'graphics',
    } as const;

    public renderer: GraphicsSystem;
    public state: State = State.for2d();

    // batchable graphics list, used to render batches
    private _renderableBatchesHash: Record<number, BatchableGraphics[]> = Object.create(null);
    private _adaptor: GraphicsAdaptor;

    constructor(renderer: GraphicsSystem, adaptor: GraphicsAdaptor)
    {
        this.renderer = renderer;

        this._adaptor = adaptor;
        this._adaptor.init();
    }

    public validateRenderable(renderable: Renderable<GraphicsView>): boolean
    {
        // assume context is dirty..

        const context = renderable.view.context;

        const wasBatched = !!this._renderableBatchesHash[renderable.uid];

        const gpuContext = this.renderer.graphicsContext.updateGpuContext(context);

        if (gpuContext.isBatchable || wasBatched !== gpuContext.isBatchable)
        {
            // TODO what if they are the same size??
            return true;
        }

        return false;
    }

    public addRenderable(renderable: Renderable<GraphicsView>, instructionSet: InstructionSet)
    {
        const gpuContext = this.renderer.graphicsContext.updateGpuContext(renderable.view.context);

        // need to get batches here.. as we need to know if we can batch or not..
        // this also overrides the current batches..

        if (renderable.view._didUpdate)
        {
            renderable.view._didUpdate = false;

            this._rebuild(renderable);
        }

        if (gpuContext.isBatchable)
        {
            this._addToBatcher(renderable, instructionSet);
        }
        else
        {
            this.renderer.renderPipes.batch.break(instructionSet);
            instructionSet.add({
                renderPipeId: 'graphics',
                renderable
            } as GraphicsInstruction);
        }
    }

    public updateRenderable(renderable: Renderable<GraphicsView>)
    {
        const batches = this._renderableBatchesHash[renderable.uid];

        if (batches)
        {
            for (let i = 0; i < batches.length; i++)
            {
                const batch = batches[i];

                batch.batcher.updateElement(batch);
            }
        }
    }

    public destroyRenderable(renderable: Renderable<GraphicsView>)
    {
        this._removeBatchForRenderable(renderable.uid);
    }

    public execute({ renderable }: GraphicsInstruction)
    {
        if (!renderable.isRenderable) return;

        const renderer = this.renderer;
        const context = renderable.view.context;
        const contextSystem = renderer.graphicsContext;

        // early out if there is no actual visual stuff...
        if (!contextSystem.getGpuContext(context).batches.length)
        { return; }

        const shader = context.customShader || this._adaptor.shader;

        this.state.blendMode = renderable.rgBlendMode;

        const localUniforms = shader.resources.localUniforms.uniforms;

        localUniforms.uTransformMatrix = renderable.rgTransform;
        localUniforms.uRound = renderer._roundPixels | renderable.view.roundPixels;

        color32BitToUniform(
            renderable.rgColorAlpha,
            localUniforms.uColor,
            0
        );

        this._adaptor.execute(this, renderable);
    }

    private _rebuild(renderable: Renderable<GraphicsView>)
    {
        const wasBatched = !!this._renderableBatchesHash[renderable.uid];

        const gpuContext = this.renderer.graphicsContext.updateGpuContext(renderable.view.context);

        // TODO POOL the old batches!

        if (wasBatched)
        {
            this._removeBatchForRenderable(renderable.uid);
        }

        if (gpuContext.isBatchable)
        {
            this._initBatchesForRenderable(renderable);
        }

        renderable.view.batched = gpuContext.isBatchable;
    }

    private _addToBatcher(renderable: Renderable<GraphicsView>, instructionSet: InstructionSet)
    {
        const batchPipe = this.renderer.renderPipes.batch;

        const batches = this._getBatchesForRenderable(renderable);

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batchPipe.addToBatch(batch, instructionSet);
        }
    }

    private _getBatchesForRenderable(renderable: Renderable<GraphicsView>): BatchableGraphics[]
    {
        return this._renderableBatchesHash[renderable.uid] || this._initBatchesForRenderable(renderable);
    }

    private _initBatchesForRenderable(renderable: Renderable<GraphicsView>): BatchableGraphics[]
    {
        const context = renderable.view.context;

        const gpuContext: GpuGraphicsContext = this.renderer.graphicsContext.getGpuContext(context);

        const roundPixels = (this.renderer._roundPixels | renderable.view.roundPixels) as 0 | 1;

        const batches = gpuContext.batches.map((batch) =>
        {
            // TODO pool this!!
            const batchClone = BigPool.get(BatchableGraphics);

            batch.copyTo(batchClone);

            batchClone.renderable = renderable;

            batchClone.roundPixels = roundPixels;

            return batchClone;
        });

        this._renderableBatchesHash[renderable.uid] = batches;

        // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
        renderable.on('destroyed', () =>
        {
            this.destroyRenderable(renderable);
        });

        return batches;
    }

    private _removeBatchForRenderable(renderableUid: number)
    {
        this._renderableBatchesHash[renderableUid].forEach((batch) =>
        {
            BigPool.return(batch as PoolItem);
        });

        this._renderableBatchesHash[renderableUid] = null;
    }

    public destroy()
    {
        this.renderer = null;

        this._adaptor.destroy();
        this._adaptor = null;
        this.state = null;

        for (const i in this._renderableBatchesHash)
        {
            this._removeBatchForRenderable(i as unknown as number);
        }

        this._renderableBatchesHash = null;
    }
}
