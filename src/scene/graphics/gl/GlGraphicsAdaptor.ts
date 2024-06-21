import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { getMaxTexturesPerBatch } from '../../../rendering/batcher/gl/utils/maxRecommendedTextures';
import { compileHighShaderGlProgram } from '../../../rendering/high-shader/compileHighShaderToProgram';
import { colorBitGl } from '../../../rendering/high-shader/shader-bits/colorBit';
import { generateTextureBatchBitGl } from '../../../rendering/high-shader/shader-bits/generateTextureBatchBit';
import { localUniformBitGl } from '../../../rendering/high-shader/shader-bits/localUniformBit';
import { roundPixelsBitGl } from '../../../rendering/high-shader/shader-bits/roundPixelsBit';
import { getBatchSamplersUniformGroup } from '../../../rendering/renderers/gl/shader/getBatchSamplersUniformGroup';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';

import type { Batch } from '../../../rendering/batcher/shared/Batcher';
import type { WebGLRenderer } from '../../../rendering/renderers/gl/WebGLRenderer';
import type { Graphics } from '../shared/Graphics';
import type { GraphicsAdaptor, GraphicsPipe } from '../shared/GraphicsPipe';

/**
 * A GraphicsAdaptor that uses WebGL to render graphics.
 * @memberof rendering
 * @ignore
 */
export class GlGraphicsAdaptor implements GraphicsAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipesAdaptor,
        ],
        name: 'graphics',
    } as const;

    public shader: Shader;

    public init()
    {
        const uniforms = new UniformGroup({
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uRound: { value: 0, type: 'f32' },
        });

        const maxTextures = getMaxTexturesPerBatch();

        const glProgram = compileHighShaderGlProgram({
            name: 'graphics',
            bits: [
                colorBitGl,
                generateTextureBatchBitGl(maxTextures),
                localUniformBitGl,
                roundPixelsBitGl,
            ]
        });

        this.shader = new Shader({
            glProgram,
            resources: {
                localUniforms: uniforms,
                batchSamplers: getBatchSamplersUniformGroup(maxTextures),
            }
        });
    }

    public execute(graphicsPipe: GraphicsPipe, renderable: Graphics): void
    {
        const context = renderable.context;
        const shader = context.customShader || this.shader;
        const renderer = graphicsPipe.renderer as WebGLRenderer;
        const contextSystem = renderer.graphicsContext;

        const {
            geometry, instructions,
        } = contextSystem.getContextRenderData(context);

        // WebGL specific..
        shader.groups[0] = renderer.globalUniforms.bindGroup;

        renderer.state.set(graphicsPipe.state);

        renderer.shader.bind(shader);

        renderer.geometry.bind(geometry, shader.glProgram);

        const batches = instructions.instructions as Batch[];

        for (let i = 0; i < instructions.instructionSize; i++)
        {
            const batch = batches[i];

            if (batch.size)
            {
                for (let j = 0; j < batch.textures.textures.length; j++)
                {
                    renderer.texture.bind(batch.textures.textures[j], j);
                }

                renderer.geometry.draw('triangle-list', batch.size, batch.start);
            }
        }
    }

    public destroy(): void
    {
        this.shader.destroy(true);
        this.shader = null;
    }
}
