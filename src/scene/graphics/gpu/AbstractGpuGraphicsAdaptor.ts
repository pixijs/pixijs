import { getTextureBatchBindGroup } from '../../../rendering/batcher/gpu/getTextureBatchBindGroup';

import type { Batch } from '../../../rendering/batcher/shared/Batcher';
import type { GpuEncoderSystem } from '../../../rendering/renderers/gpu/GpuEncoderSystem';
import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';
import type { Topology } from '../../../rendering/renderers/shared/geometry/const';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import type { Renderer } from '../../../rendering/renderers/types';
import type { AbstractGraphicsContextRenderData } from '../shared/AbstractGraphicsContextSystem';
import type { GraphicsAdaptor, GraphicsPipeLike } from '../shared/AbstractGraphicsPipe';
import type { Graphics } from '../shared/Graphics';
import type { GraphicsContext } from '../shared/GraphicsContext';

/**
 * WebGPU adaptor shared by {@link Graphics} and {@link SmoothGraphics}: draws a context that isn't batched.
 * Subclasses create the shader and give access to the render data of a context.
 * @category rendering
 * @ignore
 */
export abstract class AbstractGpuGraphicsAdaptor<
    TRenderData extends AbstractGraphicsContextRenderData = AbstractGraphicsContextRenderData,
> implements GraphicsAdaptor
{
    public shader: Shader;

    protected _maxTextures = 0;

    public abstract contextChange(renderer: Renderer): void;

    /**
     * Returns the render data of a context that isn't batched.
     * @param renderer - The renderer
     * @param context - The context
     */
    protected abstract _getRenderData(renderer: WebGPURenderer, context: GraphicsContext): TRenderData;

    /**
     * Returns the shader used when the context has no custom shader.
     * @param _renderData - The render data of the context
     */
    protected _getShader(_renderData: TRenderData): Shader
    {
        return this.shader;
    }

    public execute(graphicsPipe: GraphicsPipeLike, renderable: Graphics): void
    {
        const context = renderable.context;
        const renderer = graphicsPipe.renderer as WebGPURenderer;
        const renderData = this._getRenderData(renderer, context);
        const { batcher, instructions } = renderData;
        const shader = context.customShader || this._getShader(renderData);

        // WebGPU specific...

        // TODO perf test this a bit...
        const encoder = renderer.encoder as GpuEncoderSystem;

        encoder.setGeometry(batcher.geometry, shader.gpuProgram);

        const globalUniformsBindGroup = renderer.globalUniforms.bindGroup;

        encoder.setBindGroup(0, globalUniformsBindGroup, shader.gpuProgram);

        const localBindGroup = renderer.renderPipes.uniformBatch.getUniformBindGroup(shader.resources.localUniforms, true);

        encoder.setBindGroup(2, localBindGroup, shader.gpuProgram);

        // custom shaders (e.g. DashLineShader) can declare groups after the local uniforms
        const layout = shader.gpuProgram.layout;

        for (let i = 3; i < layout.length; i++)
        {
            const bindGroup = shader.groups[i];

            if (!layout[i] || !bindGroup) continue;

            for (const key in bindGroup.resources)
            {
                const resource = bindGroup.resources[key] as UniformGroup;

                if (resource?.isUniformGroup)
                {
                    renderer.ubo.updateUniformGroup(resource);
                }
            }

            encoder.setBindGroup(i, bindGroup, shader.gpuProgram);
        }

        const batches = instructions.instructions as Batch[];

        let topology: Topology = null;

        for (let i = 0; i < instructions.instructionSize; i++)
        {
            const batch = batches[i];

            if (batch.topology !== topology)
            {
                topology = batch.topology;

                encoder.setPipelineFromGeometryProgramAndState(
                    batcher.geometry,
                    shader.gpuProgram,
                    graphicsPipe.state,
                    batch.topology,
                    shader._overrides
                );
            }

            shader.groups[1] = batch.bindGroup;

            if (!batch.gpuBindGroup)
            {
                const textureBatch = batch.textures;

                batch.bindGroup = getTextureBatchBindGroup(
                    textureBatch.textures,
                    textureBatch.count,
                    this._maxTextures
                );

                batch.gpuBindGroup = renderer.bindGroup.getBindGroup(
                    batch.bindGroup, shader.gpuProgram, 1
                );
            }

            encoder.setBindGroup(1, batch.bindGroup, shader.gpuProgram);

            encoder.renderPassEncoder.drawIndexed(batch.size, 1, batch.start);
        }
    }

    public destroy(): void
    {
        // the program comes from the shared GpuProgram cache and is used by every WebGPU renderer,
        // so only the per-renderer shader is destroyed here
        this.shader.destroy();
        this.shader = null;
    }
}
