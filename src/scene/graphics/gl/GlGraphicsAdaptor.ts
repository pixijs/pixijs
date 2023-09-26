import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { MAX_TEXTURES } from '../../../rendering/batcher/shared/const';
import { compileHighShaderGlProgram } from '../../../rendering/high-shader/compileHighShaderToProgram';
import { colorBitGl } from '../../../rendering/high-shader/shader-bits/colorBit';
import { generateTextureBatchBitGl } from '../../../rendering/high-shader/shader-bits/generateTextureBatchBit';
import { localUniformBitGl } from '../../../rendering/high-shader/shader-bits/localUniformBit';
import { batchSamplersUniformGroup } from '../../../rendering/renderers/gl/shader/batchSamplersUniformGroup';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { color32BitToUniform } from '../gpu/colorToUniform';

import type { Batch } from '../../../rendering/batcher/shared/Batcher';
import type { WebGLRenderer } from '../../../rendering/renderers/gl/WebGLRenderer';
import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { GraphicsAdaptor, GraphicsPipe } from '../shared/GraphicsPipe';
import type { GraphicsView } from '../shared/GraphicsView';

export class GlGraphicsAdaptor implements GraphicsAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipesAdaptor,
        ],
        name: 'graphics',
    } as const;

    private _shader: Shader;

    public init()
    {
        const uniforms = new UniformGroup({
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
        });

        const glProgram = compileHighShaderGlProgram({
            name: 'graphics',
            bits: [
                colorBitGl,
                generateTextureBatchBitGl(MAX_TEXTURES),
                localUniformBitGl,
            ]
        });

        this._shader = new Shader({
            glProgram,
            resources: {
                localUniforms: uniforms,
                batchSamplers: batchSamplersUniformGroup,
            }
        });
    }

    public execute(graphicsPipe: GraphicsPipe, renderable: Renderable<GraphicsView>): void
    {
        const context = renderable.view.context;
        const shader = context.customShader || this._shader;
        const renderer = graphicsPipe.renderer as WebGLRenderer;
        const contextSystem = renderer.graphicsContext;

        if (!contextSystem.updateGpuContext(context).batches.length)
        { return; }

        const {
            geometry, instructions,
        } = contextSystem.getContextRenderData(context);

        const state = graphicsPipe.state;

        state.blendMode = renderable.layerBlendMode;

        renderer.state.set(graphicsPipe.state);

        const localUniforms = shader.resources.localUniforms.uniforms;

        localUniforms.uTransformMatrix = renderable.layerTransform;

        color32BitToUniform(
            renderable.layerColor,
            localUniforms.uColor,
            0
        );

        // WebGL specific..

        renderer.shader.bind(shader);
        renderer.shader.bindUniformBlock(renderer.globalUniforms.uniformGroup, 'globalUniforms');

        // renderer.

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
        this._shader.destroy(true);
        this._shader = null;
    }
}
