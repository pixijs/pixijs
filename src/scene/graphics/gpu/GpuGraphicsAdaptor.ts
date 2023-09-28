import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { getTextureBatchBindGroup } from '../../../rendering/batcher/gpu/getTextureBatchBindGroup';
import { MAX_TEXTURES } from '../../../rendering/batcher/shared/const';
import { compileHighShaderGpuProgram } from '../../../rendering/high-shader/compileHighShaderToProgram';
import { colorBit } from '../../../rendering/high-shader/shader-bits/colorBit';
import { generateTextureBatchBit } from '../../../rendering/high-shader/shader-bits/generateTextureBatchBit';
import { roundPixelsBit } from '../../../rendering/high-shader/shader-bits/roundPixelsBit';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';

import type { Batch } from '../../../rendering/batcher/shared/Batcher';
import type { GpuEncoderSystem } from '../../../rendering/renderers/gpu/GpuEncoderSystem';
import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';
import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { GraphicsAdaptor, GraphicsPipe } from '../shared/GraphicsPipe';
import type { GraphicsView } from '../shared/GraphicsView';

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
            transformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uRound: { value: 0, type: 'f32' },
        });

        const localUniformBit2 = {
            name: 'local-uniform-bit',
            vertex: {
                header: /* wgsl */`
        
                    struct LocalUniforms {
                        uTransformMatrix:mat3x3<f32>,
                        uColor:vec4<f32>,
                        uRound:f32,
                    }
        
                    @group(2) @binding(0) var<uniform> localUniforms : LocalUniforms;
                `,
                main: /* wgsl */`
                    vColor *= localUniforms.uColor;
                    modelMatrix *= localUniforms.uTransformMatrix;
                `,
                end: /* wgsl */`
                    if(localUniforms.uRound == 1)
                    {
                        vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                    }
                `
            },
        };

        const gpuProgram = compileHighShaderGpuProgram({
            name: 'graphics',
            bits: [
                colorBit,
                generateTextureBatchBit(MAX_TEXTURES),
                localUniformBit2,
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

        this.shader.addResource('globalUniforms', 0, 0);
    }

    public execute(graphicsPipe: GraphicsPipe, renderable: Renderable<GraphicsView>): void
    {
        const context = renderable.view.context;
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
