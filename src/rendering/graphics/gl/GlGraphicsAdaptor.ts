import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/Matrix';
import { MAX_TEXTURES } from '../../batcher/shared/const';
import { batchSamplersUniformGroup } from '../../renderers/gl/shader/batchSamplersUniformGroup';
import { Shader } from '../../renderers/shared/shader/Shader';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { color32BitToUniform } from '../gpu/colorToUniform';
import { generateDefaultGraphicsBatchGlProgram } from './generateDefaultGraphicsBatchGlProgram';

import type { WebGLRenderer } from '../../renderers/gl/WebGLRenderer';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { GraphicsAdaptor, GraphicsPipe } from '../shared/GraphicsPipe';
import type { GraphicsView } from '../shared/GraphicsView';

export class GlGraphicsAdaptor implements GraphicsAdaptor
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLPipesAdaptor,
        ],
        name: 'graphics',
    } as const;

    shader: Shader;

    init()
    {
        const uniforms = new UniformGroup({
            color: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            transformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
        });

        // uniforms.default.static = true;

        this.shader = new Shader({
            glProgram: generateDefaultGraphicsBatchGlProgram(MAX_TEXTURES),
            resources: {
                localUniforms: uniforms,
                batchSamplers: batchSamplersUniformGroup,
            }
        });
    }

    execute(graphicsPipe: GraphicsPipe, renderable: Renderable<GraphicsView>): void
    {
        const context = renderable.view.context;
        const shader = context.customShader || this.shader;
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

        localUniforms.transformMatrix = renderable.layerTransform;

        color32BitToUniform(
            renderable.layerColor,
            localUniforms.color,
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

    destroy(): void
    {
        this.shader.destroy(true);
        this.shader = null;
    }
}
