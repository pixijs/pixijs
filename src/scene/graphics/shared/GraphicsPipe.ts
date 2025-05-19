import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../../rendering/renderers/shared/state/State';
import { type Renderer } from '../../../rendering/renderers/types';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { color32BitToUniform } from '../gpu/colorToUniform';
import { BatchableGraphics } from './BatchableGraphics';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { Graphics } from './Graphics';
import type { GpuGraphicsContext } from './GraphicsContextSystem';

/** @internal */
export interface GraphicsAdaptor
{
    shader: Shader;
    contextChange(renderer: Renderer): void;
    execute(graphicsPipe: GraphicsPipe, renderable: Graphics): void;
    destroy(): void;
}

/** @internal */
export class GraphicsGpuData
{
    public batches: BatchableGraphics[] = [];
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

/** @internal */
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

    public renderer: Renderer;
    public state: State = State.for2d();

    private _adaptor: GraphicsAdaptor;

    constructor(renderer: Renderer, adaptor: GraphicsAdaptor)
    {
        this.renderer = renderer;

        this._adaptor = adaptor;

        this.renderer.runners.contextChange.add(this);
    }

    public contextChange(): void
    {
        this._adaptor.contextChange(this.renderer);
    }

    public validateRenderable(graphics: Graphics): boolean
    {
        // assume context is dirty..
        const context = graphics.context;

        const wasBatched = !!graphics._gpuData;

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
        const gpuData = this._getGpuDataForRenderable(graphics);

        const gpuContext = this.renderer.graphicsContext.updateGpuContext(graphics.context);

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

    private _getGpuDataForRenderable(graphics: Graphics): GraphicsGpuData
    {
        return graphics._gpuData[this.renderer.uid] || this._initGpuDataForRenderable(graphics);
    }

    private _initGpuDataForRenderable(graphics: Graphics): GraphicsGpuData
    {
        const gpuData = new GraphicsGpuData();

        graphics._gpuData[this.renderer.uid] = gpuData;

        return gpuData;
    }

    private _updateBatchesForRenderable(graphics: Graphics, gpuData: GraphicsGpuData)
    {
        const context = graphics.context;

        const gpuContext: GpuGraphicsContext = this.renderer.graphicsContext.getGpuContext(context);

        const roundPixels = (this.renderer._roundPixels | graphics._roundPixels) as 0 | 1;

        gpuData.batches = gpuContext.batches.map((batch) =>
        {
            const batchClone = BigPool.get(BatchableGraphics);

            batch.copyTo(batchClone);

            batchClone.renderable = graphics;

            batchClone.roundPixels = roundPixels;

            return batchClone;
        });
    }

    public destroy()
    {
        this.renderer = null;

        this._adaptor.destroy();
        this._adaptor = null;
        this.state = null;
    }
}
