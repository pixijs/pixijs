import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { getMaxTexturesPerBatch } from '../../../rendering/batcher/gl/utils/maxRecommendedTextures';
import { getTextureBatchBindGroup } from '../../../rendering/batcher/gpu/getTextureBatchBindGroup';
import { compileHighShaderGpuProgram } from '../../../rendering/high-shader/compileHighShaderToProgram';
import { colorBit } from '../../../rendering/high-shader/shader-bits/colorBit';
import { generateTextureBatchBit } from '../../../rendering/high-shader/shader-bits/generateTextureBatchBit';
import { localUniformBitGroup2 } from '../../../rendering/high-shader/shader-bits/localUniformBit';
import { roundPixelsBit } from '../../../rendering/high-shader/shader-bits/roundPixelsBit';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';

import type { Batch } from '../../../rendering/batcher/shared/Batcher';
import type { GpuEncoderSystem } from '../../../rendering/renderers/gpu/GpuEncoderSystem';
import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';
import type { Graphics } from '../shared/Graphics';
import type { GraphicsAdaptor, GraphicsPipe } from '../shared/GraphicsPipe';

/**
 * A GraphicsAdaptor that uses the GPU to render graphics.
 * @memberof rendering
 * @ignore
 */
export class GpuGraphicsAdaptor implements GraphicsAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUPipesAdaptor,
        ],
        name: 'graphics',
    } as const;

    public shader: Shader;

    public init()
    {
        const localUniforms = new UniformGroup({
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uRound: { value: 0, type: 'f32' },
        });

        const gpuProgram = compileHighShaderGpuProgram({
            name: 'graphics',
            bits: [
                colorBit,
                generateTextureBatchBit(getMaxTexturesPerBatch()),

                localUniformBitGroup2,
                roundPixelsBit
            ]
        });

        this.shader = new Shader({
            gpuProgram,
            resources: {
                // added on the fly!
                localUniforms,
            },
        });
    }

    public execute(graphicsPipe: GraphicsPipe, renderable: Graphics): void
    {
        const context = renderable.context;
        const shader = context.customShader || this.shader;
        const renderer = graphicsPipe.renderer as WebGPURenderer;
        const contextSystem = renderer.graphicsContext;

        const {
            geometry, instructions
        } = contextSystem.getContextRenderData(context);

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
            .renderPipes.uniformBatch.getUniformBindGroup(shader.resources.localUniforms, true);

        encoder.setBindGroup(2, localBindGroup, shader.gpuProgram);

        const batches = instructions.instructions as Batch[];

        for (let i = 0; i < instructions.instructionSize; i++)
        {
            const batch = batches[i];

            shader.groups[1] = batch.bindGroup;

            if (!batch.gpuBindGroup)
            {
                const textureBatch = batch.textures;

                batch.bindGroup = getTextureBatchBindGroup(textureBatch.textures, textureBatch.count);
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
        this.shader.destroy(true);
        this.shader = null;
    }
}
