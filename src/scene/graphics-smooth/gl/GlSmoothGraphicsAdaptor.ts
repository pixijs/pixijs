import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { getBatchSamplersUniformGroup } from '../../../rendering/renderers/gl/shader/getBatchSamplersUniformGroup';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { AbstractGlGraphicsAdaptor } from '../../graphics/gl/AbstractGlGraphicsAdaptor';
import { getSmoothGlProgram } from '../shared/batcher/SmoothShader';

import type { WebGLRenderer } from '../../../rendering/renderers/gl/WebGLRenderer';
import type { Renderer } from '../../../rendering/renderers/types';
import type { GraphicsContext } from '../../graphics/shared/GraphicsContext';
import type { SmoothGraphicsContextRenderData } from '../shared/SmoothGraphicsContextSystem';

/**
 * Draws the {@link SmoothGraphics} contexts that aren't batched with WebGL.
 * @category rendering
 * @internal
 */
export class GlSmoothGraphicsAdaptor extends AbstractGlGraphicsAdaptor<SmoothGraphicsContextRenderData>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipesAdaptor,
        ],
        name: 'smoothGraphics',
    } as const;

    private _texturedShader: Shader;

    public contextChange(renderer: Renderer): void
    {
        const uniforms = new UniformGroup({
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uRound: { value: 0, type: 'f32' },
        });

        const maxTextures = renderer.limits.maxBatchableTextures;
        const batchSamplers = getBatchSamplersUniformGroup(maxTextures);

        // both shaders share the uniform group, so the pipe only has to update this.shader
        this.shader = new Shader({
            glProgram: getSmoothGlProgram({ name: 'smooth-local', maxTextures, localUniforms: true }),
            resources: { localUniforms: uniforms, batchSamplers },
        });
        this._texturedShader = new Shader({
            glProgram: getSmoothGlProgram({
                name: 'smooth-local-textured', maxTextures, localUniforms: true, textured: true,
            }),
            resources: { localUniforms: uniforms, batchSamplers },
        });
    }

    protected _getRenderData(renderer: WebGLRenderer, context: GraphicsContext): SmoothGraphicsContextRenderData
    {
        return renderer.smoothGraphicsContext.getContextRenderData(context);
    }

    protected override _getShader(renderData: SmoothGraphicsContextRenderData): Shader
    {
        return renderData.textured ? this._texturedShader : this.shader;
    }

    public override destroy(): void
    {
        // the programs are shared by every renderer, see getSmoothGlProgram()
        this._texturedShader.destroy();
        this._texturedShader = null;
        this.shader.destroy();
        this.shader = null;
    }
}
