import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/Matrix';
import { MAX_TEXTURES } from '../../batcher/shared/const';
import { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import { Shader } from '../../renderers/shared/shader/Shader';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { color32BitToUniform } from './colorToUniform';
import { generateDefaultGraphicsBatchProgram } from './generateDefaultGraphicsBatchProgram';

import type { GpuEncoderSystem } from '../../renderers/gpu/GpuEncoderSystem';
import type { WebGPURenderer } from '../../renderers/gpu/WebGPURenderer';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { GraphicsAdaptor, GraphicsPipe } from '../shared/GraphicsPipe';
import type { GraphicsView } from '../shared/GraphicsView';

export class GpuGraphicsAdaptor implements GraphicsAdaptor
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGPURendererPipesAdaptor,
        ],
        name: 'graphics',
    } as const;
    shader: Shader;

    init()
    {
        const localUniforms = new UniformGroup({
            color: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            transformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
        });

        this.shader = new Shader({
            gpuProgram: generateDefaultGraphicsBatchProgram(MAX_TEXTURES),
            groups: {
                // added on the fly!
                2: new BindGroup({ 0: localUniforms }),
            },
        });
    }

    execute(graphicsPipe: GraphicsPipe, renderable: Renderable<GraphicsView>): void
    {
        const context = renderable.view.context;
        const shader = context.customShader || this.shader;
        const renderer = graphicsPipe.renderer as WebGPURenderer;
        const contextSystem = renderer.graphicsContext;

        // early out if there is no actual visual stuff...
        if (!contextSystem.getGpuContext(context).batches.length)
        { return; }

        const {
            geometry, batches
        } = contextSystem.getContextRenderData(context);

        graphicsPipe.state.blendMode = renderable.layerBlendMode;

        const localUniforms = shader.resources.localUniforms;

        shader.resources.localUniforms.uniforms.transformMatrix = renderable.layerTransform;

        color32BitToUniform(
            renderable.layerColor,
            localUniforms.uniforms.color,
            0
        );

        // WebGPU specific...

        // TODO perf test this a bit...
        const encoder = renderer.encoder as GpuEncoderSystem;

        encoder.setPipelineFromGeometryProgramAndState(
            geometry,
            shader.gpuProgram,
            graphicsPipe.state
        );

        encoder.setGeometry(geometry);

        const globalUniformsBindGroup = renderer.globalUniforms.bindGroup;

        encoder.setBindGroup(0, globalUniformsBindGroup, shader.gpuProgram);

        const localBindGroup = (renderer as WebGPURenderer)
            .renderPipes.uniformBatch.getUniformBindGroup(localUniforms, true);

        encoder.setBindGroup(2, localBindGroup, shader.gpuProgram);

        for (let i = 0; i < batches.length; i++)
        {
            const batch = batches[i];

            shader.groups[1] = batch.textures.bindGroup;

            encoder.setBindGroup(1, batch.textures.bindGroup, shader.gpuProgram);

            encoder.renderPassEncoder.drawIndexed(batch.size, 1, batch.start);
        }
    }

    destroy(): void
    {
        this.shader.destroy(true);
        this.shader = null;
    }
}
