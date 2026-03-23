import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../../rendering/renderers/shared/state/State';
import { GCManagedHash } from '../../../utils/data/GCManagedHash';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { color32BitToUniform } from '../../graphics/gpu/colorToUniform';
import { type GraphicsAdaptor } from '../../graphics/shared/GraphicsAdaptorTypes';
import { type GPUData } from '../../view/ViewContainer';
import { BatchableSmoothGraphics } from './BatchableSmoothGraphics';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { GpuSmoothGraphicsContext } from './GpuSmoothGraphicsContext';
import type { SmoothGraphics } from './SmoothGraphics';
import type { SmoothGraphicsContextSystem } from './SmoothGraphicsContextSystem';

/** @internal */
export class SmoothGraphicsGpuData implements GPUData
{
    public batches: BatchableSmoothGraphics[] = [];
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
 * Render pipe for smooth HHAA graphics.
 * Handles both batchable (small geometry) and non-batchable (large geometry) paths.
 * @category rendering
 * @internal
 */
export class SmoothGraphicsPipe implements RenderPipe<SmoothGraphics>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
        ],
        name: 'smoothGraphics',
    } as const;

    public renderer: Renderer;
    public state: State = State.for2d();

    private _adaptor: GraphicsAdaptor;
    private readonly _managedGraphics: GCManagedHash<SmoothGraphics>;

    constructor(renderer: Renderer, adaptor: GraphicsAdaptor)
    {
        this.renderer = renderer;
        this._adaptor = adaptor;
        this.renderer.runners.contextChange.add(this);
        this._managedGraphics = new GCManagedHash({
            renderer, type: 'renderable', priority: -1, name: 'smoothGraphics'
        });
    }

    public contextChange(): void
    {
        this._adaptor.contextChange(this.renderer);
    }

    public validateRenderable(graphics: SmoothGraphics): boolean
    {
        const context = graphics.context;

        const wasBatched = !!graphics._gpuData;

        const contextSystem = this.renderer.smoothGraphicsContext as SmoothGraphicsContextSystem;
        const gpuContext = contextSystem.updateGpuContext(context);

        if (gpuContext.isBatchable || wasBatched !== gpuContext.isBatchable)
        {
            return true;
        }

        return false;
    }

    public addRenderable(graphics: SmoothGraphics, instructionSet: InstructionSet)
    {
        const contextSystem = this.renderer.smoothGraphicsContext as SmoothGraphicsContextSystem;
        const gpuContext = contextSystem.updateGpuContext(graphics.context);

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

    public updateRenderable(graphics: SmoothGraphics)
    {
        const gpuData = this._getGpuDataForRenderable(graphics);

        const batches = gpuData.batches;

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batch._batcher.updateElement(batch);
        }
    }

    public execute(graphics: SmoothGraphics)
    {
        if (!graphics.isRenderable) return;

        const renderer = this.renderer;
        const context = graphics.context;
        const contextSystem = renderer.smoothGraphicsContext as SmoothGraphicsContextSystem;

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

    private _rebuild(graphics: SmoothGraphics)
    {
        const gpuData = this._getGpuDataForRenderable(graphics);

        const contextSystem = this.renderer.smoothGraphicsContext as SmoothGraphicsContextSystem;
        const gpuContext = contextSystem.updateGpuContext(graphics.context);

        gpuData.destroy();

        if (gpuContext.isBatchable)
        {
            this._updateBatchesForRenderable(graphics, gpuData);
        }
    }

    private _addToBatcher(graphics: SmoothGraphics, instructionSet: InstructionSet)
    {
        const batchPipe = this.renderer.renderPipes.batch;

        const batches = this._getGpuDataForRenderable(graphics).batches;

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            batchPipe.addToBatch(batch, instructionSet);
        }
    }

    private _getGpuDataForRenderable(graphics: SmoothGraphics): SmoothGraphicsGpuData
    {
        return graphics._gpuData[this.renderer.uid] as unknown as SmoothGraphicsGpuData
            || this._initGpuDataForRenderable(graphics);
    }

    private _initGpuDataForRenderable(graphics: SmoothGraphics): SmoothGraphicsGpuData
    {
        const gpuData = new SmoothGraphicsGpuData();

        (graphics._gpuData as unknown as Record<number, SmoothGraphicsGpuData>)[this.renderer.uid] = gpuData;

        this._managedGraphics.add(graphics);

        return gpuData;
    }

    private _updateBatchesForRenderable(graphics: SmoothGraphics, gpuData: SmoothGraphicsGpuData)
    {
        const context = graphics.context;
        const contextSystem = this.renderer.smoothGraphicsContext as SmoothGraphicsContextSystem;
        const gpuContext: GpuSmoothGraphicsContext = contextSystem.getGpuContext(context);

        const roundPixels = (this.renderer._roundPixels | graphics._roundPixels) as 0 | 1;

        gpuData.batches = gpuContext.batches.map((batch) =>
        {
            const batchClone = BigPool.get(BatchableSmoothGraphics);

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
