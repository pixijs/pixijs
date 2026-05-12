import { State } from '../../../rendering/renderers/shared/state/State';
import { GCManagedHash } from '../../../utils/data/GCManagedHash';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { color32BitToUniform } from '../gpu/colorToUniform';

import type { BatchableElement, Batcher } from '../../../rendering/batcher/shared/Batcher';
import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { GPUData } from '../../view/ViewContainer';
import type { AbstractGpuGraphicsContext } from './AbstractGpuGraphicsContext';
import type { AbstractGraphicsContextSystem } from './AbstractGraphicsContextSystem';
import type { Graphics } from './Graphics';
import type { GraphicsAdaptor } from './GraphicsAdaptorTypes';

/**
 * Batchable element with the subset of fields the abstract pipe needs:
 * renderable assignment, roundPixels, copyTo, and batcher reference.
 * @internal
 */
interface PipeBatchable extends BatchableElement
{
    renderable: Graphics;
    roundPixels: 0 | 1;
    _batcher: Batcher;
    copyTo(target: PipeBatchable): void;
}

/**
 * GPU data stored per-renderable per-renderer. Holds the batchable elements
 * cloned from the context's batches for this specific renderable instance.
 * @internal
 */
export class AbstractGraphicsGpuData<TBatchable extends PipeBatchable> implements GPUData
{
    public batches: TBatchable[] = [];

    public destroy(): void
    {
        this.batches.forEach((batch) =>
        {
            BigPool.return(batch as PoolItem);
        });

        this.batches.length = 0;
    }
}

/**
 * Abstract render pipe shared by GraphicsPipe and SmoothGraphicsPipe.
 * All method bodies are identical between the two; subclasses only provide
 * concrete types and the context system accessor.
 * @internal
 */
export abstract class AbstractGraphicsPipe<
    TGraphics extends Graphics,
    TBatchable extends PipeBatchable,
    TGpuContext extends AbstractGpuGraphicsContext<any, any>,
    TGpuData extends AbstractGraphicsGpuData<TBatchable> = AbstractGraphicsGpuData<TBatchable>,
> implements RenderPipe<TGraphics>
{
    public renderer: Renderer;
    public state: State = State.for2d();

    private _adaptor: GraphicsAdaptor;
    private readonly _managedGraphics: GCManagedHash<TGraphics>;

    constructor(renderer: Renderer, adaptor: GraphicsAdaptor, name: string)
    {
        this.renderer = renderer;
        this._adaptor = adaptor;
        this.renderer.runners.contextChange.add(this);
        this._managedGraphics = new GCManagedHash({ renderer, type: 'renderable', priority: -1, name });
    }

    protected abstract _getContextSystem(): AbstractGraphicsContextSystem<TGpuContext, any>;
    protected abstract _createGpuData(): TGpuData;
    protected abstract _batchableClass: new () => TBatchable;

    public contextChange(): void
    {
        this._adaptor.contextChange(this.renderer);
    }

    public validateRenderable(graphics: TGraphics): boolean
    {
        const context = graphics.context;
        const gpuData = (graphics._gpuData as unknown as Record<number, TGpuData>)[this.renderer.uid];
        const wasBatched = gpuData ? gpuData.batches.length > 0 : false;
        const gpuContext = this._getContextSystem().updateGpuContext(context);

        if (gpuContext.isBatchable || wasBatched !== gpuContext.isBatchable)
        {
            return true;
        }

        return false;
    }

    public addRenderable(graphics: TGraphics, instructionSet: InstructionSet): void
    {
        const gpuContext = this._getContextSystem().updateGpuContext(graphics.context);

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

    public updateRenderable(graphics: TGraphics): void
    {
        const gpuData = this._getGpuDataForRenderable(graphics);
        const batches = gpuData.batches;

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batch._batcher.updateElement(batch);
        }
    }

    public execute(graphics: TGraphics): void
    {
        if (!graphics.isRenderable) return;

        const renderer = this.renderer;
        const context = graphics.context;
        const contextSystem = this._getContextSystem();

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

    public destroy(): void
    {
        this._managedGraphics.destroy();
        this.renderer = null;

        this._adaptor.destroy();
        this._adaptor = null;
        this.state = null;
    }

    private _rebuild(graphics: TGraphics): void
    {
        const gpuData = this._getGpuDataForRenderable(graphics);
        const gpuContext = this._getContextSystem().updateGpuContext(graphics.context);

        gpuData.destroy();

        if (gpuContext.isBatchable)
        {
            this._updateBatchesForRenderable(graphics, gpuData);
        }
    }

    private _addToBatcher(graphics: TGraphics, instructionSet: InstructionSet): void
    {
        const batchPipe = this.renderer.renderPipes.batch;
        const batches = this._getGpuDataForRenderable(graphics).batches;

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batchPipe.addToBatch(batch, instructionSet);
        }
    }

    private _getGpuDataForRenderable(graphics: TGraphics): TGpuData
    {
        return (graphics._gpuData as unknown as Record<number, TGpuData>)[this.renderer.uid]
            || this._initGpuDataForRenderable(graphics);
    }

    private _initGpuDataForRenderable(graphics: TGraphics): TGpuData
    {
        const gpuData = this._createGpuData();

        (graphics._gpuData as unknown as Record<number, TGpuData>)[this.renderer.uid] = gpuData;

        this._managedGraphics.add(graphics);

        return gpuData;
    }

    private _updateBatchesForRenderable(graphics: TGraphics, gpuData: TGpuData): void
    {
        const context = graphics.context;
        const gpuContext = this._getContextSystem().getGpuContext(context);

        const roundPixels = (this.renderer._roundPixels | graphics._roundPixels) as 0 | 1;

        gpuData.batches = gpuContext.batches.map((batch: PipeBatchable) =>
        {
            const batchClone = BigPool.get(this._batchableClass);

            batch.copyTo(batchClone);

            batchClone.renderable = graphics;
            batchClone.roundPixels = roundPixels;

            return batchClone;
        });
    }
}
