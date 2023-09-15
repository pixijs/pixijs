import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/Matrix';
import { MAX_TEXTURES } from '../../batcher/shared/const';
import { compileHighShaderGlProgram } from '../../high-shader/compileHighShaderToProgram';
import { colorBitGl } from '../../high-shader/shader-bits/colorBit';
import { generateTextureBatchBitGl } from '../../high-shader/shader-bits/generateTextureBatchBit';
import { localUniformBitGl } from '../../high-shader/shader-bits/localUniformBit';
import { batchSamplersUniformGroup } from '../../renderers/gl/shader/batchSamplersUniformGroup';
import { Shader } from '../../renderers/shared/shader/Shader';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { color32BitToUniform } from '../gpu/colorToUniform';

import type { WebGLRenderer } from '../../renderers/gl/WebGLRenderer';
import type { Renderable } from '../../renderers/shared/Renderable';
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
            geometry, batches,
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

        for (let i = 0; i < batches.length; i++)
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
