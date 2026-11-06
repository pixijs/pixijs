import { State } from '../../../rendering/renderers/shared/state/State';
import { GCManagedHash } from '../../../utils/data/GCManagedHash';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { color32BitToUniform } from '../gpu/colorToUniform';

import type { BatchableElement, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { Renderer } from '../../../rendering/renderers/types';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { GPUData } from '../../view/ViewContainer';
import type { Graphics } from './Graphics';
import type { GraphicsContext } from './GraphicsContext';

/** @internal */
export interface GraphicsPipeLike
{
    renderer: Renderer;
    state: State;
}

/** @internal */
export interface GraphicsAdaptor
{
    shader: Shader;
    contextChange(renderer: Renderer): void;
    execute(graphicsPipe: GraphicsPipeLike, renderable: Graphics): void;
    destroy(): void;
}

/**
 * The part of a batchable graphics element the pipe needs to clone it for a renderable.
 * @internal
 */
export interface PipeBatchable extends BatchableElement
{
    renderable: Graphics;
    roundPixels: 0 | 1;
    _batcher: Batcher;
    copyTo(target: PipeBatchable): void;
}

/**
 * The part of a graphics context system the pipe uses.
 * @internal
 */
export interface GraphicsContextSystemLike<TBatchable extends PipeBatchable>
{
    updateGpuContext(context: GraphicsContext): { isBatchable: boolean; batches: TBatchable[] };
    getGpuContext(context: GraphicsContext): { batches: TBatchable[] };
}

/**
 * The batches of a graphics object, cloned from the batches of its context.
 * @internal
 */
export class GraphicsGpuData<TBatchable extends PipeBatchable = PipeBatchable> implements GPUData
{
    public batches: TBatchable[] = [];
    public batched = false;
    public destroy()
    {
        this.batches.forEach((batch) =>
        {
            BigPool.return(batch as PoolItem);
        });

        this.batches.length = 0;
    }
}

/**
 * Render pipe shared by {@link Graphics} and {@link SmoothGraphics}.
 * Small contexts are added to the batcher, the others are rendered by the adaptor.
 * Subclasses provide the context system and the batchable element class.
 * @internal
 */
export abstract class AbstractGraphicsPipe<TBatchable extends PipeBatchable> implements RenderPipe<Graphics>
{
    public renderer: Renderer;
    public state: State = State.for2d();

    private _adaptor: GraphicsAdaptor;
    private readonly _managedGraphics: GCManagedHash<Graphics>;

    constructor(renderer: Renderer, adaptor: GraphicsAdaptor, name: string)
    {
        this.renderer = renderer;
        this._adaptor = adaptor;
        this.renderer.runners.contextChange.add(this);
        this._managedGraphics = new GCManagedHash({ renderer, type: 'renderable', priority: -1, name });
    }

    /** The system that builds the batches of the contexts rendered by this pipe. */
    protected abstract get _contextSystem(): GraphicsContextSystemLike<TBatchable>;
    /** The class of the batchable elements of the contexts rendered by this pipe. */
    protected abstract readonly _batchableClass: new () => TBatchable;

    public contextChange(): void
    {
        this._adaptor.contextChange(this.renderer);
    }

    public validateRenderable(graphics: Graphics): boolean
    {
        // assume context is dirty..
        const context = graphics.context;

        const wasBatched = !!graphics._gpuData;

        const gpuContext = this._contextSystem.updateGpuContext(context);

        if (gpuContext.isBatchable || wasBatched !== gpuContext.isBatchable)
        {
            // TODO what if they are the same size??
            return true;
        }

        return false;
    }

    public addRenderable(graphics: Graphics, instructionSet: InstructionSet)
    {
        const gpuContext = this._contextSystem.updateGpuContext(graphics.context);

        // need to get batches here.. as we need to know if we can batch or not..
        // this also overrides the current batches..
        // also rebuild when this renderer has no batches yet, e.g. the graphics was first rendered elsewhere
        if (graphics.didViewUpdate || !graphics._gpuData[this.renderer.uid])
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
        const gpuData = this._getGpuDataForRenderable(graphics);

        const batches = gpuData.batches;

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batch._batcher.updateElement(batch);
        }
    }

    public execute(graphics: Graphics)
    {
        if (!graphics.isRenderable) return;

        const renderer = this.renderer;
        const context = graphics.context;

        // early out if there is no actual visual stuff...
        if (!this._contextSystem.getGpuContext(context).batches.length)
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
        const gpuData = this._getGpuDataForRenderable(graphics);

        const gpuContext = this._contextSystem.updateGpuContext(graphics.context);

        // free up the batches..
        gpuData.destroy();

        if (gpuContext.isBatchable)
        {
            this._updateBatchesForRenderable(graphics, gpuData);
        }
    }

    private _addToBatcher(graphics: Graphics, instructionSet: InstructionSet)
    {
        const batchPipe = this.renderer.renderPipes.batch;

        const batches = this._getGpuDataForRenderable(graphics).batches;

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batchPipe.addToBatch(batch, instructionSet);
        }
    }

    private _getGpuDataForRenderable(graphics: Graphics): GraphicsGpuData<TBatchable>
    {
        return (graphics._gpuData[this.renderer.uid] as GraphicsGpuData<TBatchable>)
            || this._initGpuDataForRenderable(graphics);
    }

    private _initGpuDataForRenderable(graphics: Graphics): GraphicsGpuData<TBatchable>
    {
        const gpuData = new GraphicsGpuData<TBatchable>();

        graphics._gpuData[this.renderer.uid] = gpuData;

        this._managedGraphics.add(graphics);

        return gpuData;
    }

    private _updateBatchesForRenderable(graphics: Graphics, gpuData: GraphicsGpuData<TBatchable>)
    {
        const gpuContext = this._contextSystem.getGpuContext(graphics.context);

        const roundPixels = (this.renderer._roundPixels | graphics._roundPixels) as 0 | 1;

        gpuData.batches = gpuContext.batches.map((batch) =>
        {
            const batchClone = BigPool.get(this._batchableClass);

            batch.copyTo(batchClone);

            batchClone.renderable = graphics;

            batchClone.roundPixels = roundPixels;

            return batchClone;
        });
    }

    public destroy()
    {
        this._managedGraphics.destroy();
        this.renderer = null;

        this._adaptor.destroy();
        this._adaptor = null;
        this.state = null;
    }
}
