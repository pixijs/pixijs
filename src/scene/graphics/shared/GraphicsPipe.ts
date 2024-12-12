import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../../rendering/renderers/shared/state/State';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { color32BitToUniform } from '../gpu/colorToUniform';
import { BatchableGraphics } from './BatchableGraphics';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { BatchPipe, RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { RenderableGCSystem } from '../../../rendering/renderers/shared/texture/RenderableGCSystem';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { Container } from '../../container/Container';
import type { Graphics } from './Graphics';
import type { GpuGraphicsContext, GraphicsContextSystem } from './GraphicsContextSystem';

export interface GraphicsAdaptor
{
    shader: Shader;
    init(): void;
    execute(graphicsPipe: GraphicsPipe, renderable: Graphics): void;
    destroy(): void;
}
export interface GraphicsSystem
{
    graphicsContext: GraphicsContextSystem;
    renderableGC: RenderableGCSystem;
    renderPipes: {
        batch: BatchPipe
    }
    _roundPixels: 0 | 1;
}

export class GraphicsPipe implements RenderPipe<Graphics>
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
    private _graphicsBatchesHash: Record<number, BatchableGraphics[]> = Object.create(null);
    private _adaptor: GraphicsAdaptor;
    private readonly _destroyRenderableBound = this.destroyRenderable.bind(this) as (renderable: Container) => void;

    constructor(renderer: GraphicsSystem, adaptor: GraphicsAdaptor)
    {
        this.renderer = renderer;

        this._adaptor = adaptor;
        this._adaptor.init();

        this.renderer.renderableGC.addManagedHash(this, '_graphicsBatchesHash');
    }

    public validateRenderable(graphics: Graphics): boolean
    {
        // assume context is dirty..

        const context = graphics.context;

        const wasBatched = !!this._graphicsBatchesHash[graphics.uid];

        const gpuContext = this.renderer.graphicsContext.updateGpuContext(context);

        if (gpuContext.isBatchable || wasBatched !== gpuContext.isBatchable)
        {
            // TODO what if they are the same size??
            return true;
        }

        return false;
    }

    public addRenderable(graphics: Graphics, instructionSet: InstructionSet)
    {
        const gpuContext = this.renderer.graphicsContext.updateGpuContext(graphics.context);

        // need to get batches here.. as we need to know if we can batch or not..
        // this also overrides the current batches..

        if (graphics.didViewUpdate)
        {
            this._rebuild(graphics);
        }

        if (gpuContext.isBatchable)
        {
            this._addToBatcher(graphics, instructionSet);
        }
        else
        {
            this.renderer.renderPipes.batch.break(instructionSet);
            instructionSet.add(graphics);
        }
    }

    public updateRenderable(graphics: Graphics)
    {
        const batches = this._graphicsBatchesHash[graphics.uid];

        if (batches)
        {
            for (let i = 0; i < batches.length; i++)
            {
                const batch = batches[i];

                batch._batcher.updateElement(batch);
            }
        }
    }

    public destroyRenderable(graphics: Graphics)
    {
        if (this._graphicsBatchesHash[graphics.uid])
        {
            this._removeBatchForRenderable(graphics.uid);
        }

        graphics.off('destroyed', this._destroyRenderableBound);
    }

    public execute(graphics: Graphics)
    {
        if (!graphics.isRenderable) return;

        const renderer = this.renderer;
        const context = graphics.context;
        const contextSystem = renderer.graphicsContext;

        // early out if there is no actual visual stuff...
        if (!contextSystem.getGpuContext(context).batches.length)
        { return; }

        const shader = context.customShader || this._adaptor.shader;

        this.state.blendMode = graphics.groupBlendMode;

        const localUniforms = shader.resources.localUniforms.uniforms;

        localUniforms.uTransformMatrix = graphics.groupTransform;
        localUniforms.uRound = renderer._roundPixels | graphics._roundPixels;

        color32BitToUniform(
            graphics.groupColorAlpha,
            localUniforms.uColor,
            0,
        );

        this._adaptor.execute(this, graphics);
    }

    private _rebuild(graphics: Graphics)
    {
        const wasBatched = !!this._graphicsBatchesHash[graphics.uid];

        const gpuContext = this.renderer.graphicsContext.updateGpuContext(graphics.context);

        // TODO POOL the old batches!

        if (wasBatched)
        {
            this._removeBatchForRenderable(graphics.uid);
        }

        if (gpuContext.isBatchable)
        {
            this._initBatchesForRenderable(graphics);
        }

        graphics.batched = gpuContext.isBatchable;
    }

    private _addToBatcher(graphics: Graphics, instructionSet: InstructionSet)
    {
        const batchPipe = this.renderer.renderPipes.batch;

        const batches = this._getBatchesForRenderable(graphics);

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batchPipe.addToBatch(batch, instructionSet);
        }
    }

    private _getBatchesForRenderable(graphics: Graphics): BatchableGraphics[]
    {
        return this._graphicsBatchesHash[graphics.uid] || this._initBatchesForRenderable(graphics);
    }

    private _initBatchesForRenderable(graphics: Graphics): BatchableGraphics[]
    {
        const context = graphics.context;

        const gpuContext: GpuGraphicsContext = this.renderer.graphicsContext.getGpuContext(context);

        const roundPixels = (this.renderer._roundPixels | graphics._roundPixels) as 0 | 1;

        const batches = gpuContext.batches.map((batch) =>
        {
            const batchClone = BigPool.get(BatchableGraphics);

            batch.copyTo(batchClone);

            batchClone.renderable = graphics;

            batchClone.roundPixels = roundPixels;

            return batchClone;
        });

        if (this._graphicsBatchesHash[graphics.uid] === undefined)
        {
            // TODO perhaps manage this outside this pipe? (a bit like how we update / add)
            graphics.on('destroyed', this._destroyRenderableBound);
        }

        this._graphicsBatchesHash[graphics.uid] = batches;

        return batches;
    }

    private _removeBatchForRenderable(graphicsUid: number)
    {
        this._graphicsBatchesHash[graphicsUid].forEach((batch) =>
        {
            BigPool.return(batch as PoolItem);
        });

        this._graphicsBatchesHash[graphicsUid] = null;
    }

    public destroy()
    {
        this.renderer = null;

        this._adaptor.destroy();
        this._adaptor = null;
        this.state = null;

        for (const i in this._graphicsBatchesHash)
        {
            this._removeBatchForRenderable(i as unknown as number);
        }

        this._graphicsBatchesHash = null;
    }
}
