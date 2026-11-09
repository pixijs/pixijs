import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { AbstractGpuGraphicsAdaptor } from '../../graphics/gpu/AbstractGpuGraphicsAdaptor';
import { getSmoothGpuProgram } from '../shared/batcher/SmoothShader';

import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';
import type { Renderer } from '../../../rendering/renderers/types';
import type { GraphicsContext } from '../../graphics/shared/GraphicsContext';
import type { SmoothGraphicsContextRenderData } from '../shared/SmoothGraphicsContextSystem';

/**
 * Draws the {@link SmoothGraphics} contexts that aren't batched with WebGPU.
 * @category rendering
 * @internal
 */
export class GpuSmoothGraphicsAdaptor extends AbstractGpuGraphicsAdaptor<SmoothGraphicsContextRenderData>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUPipesAdaptor,
        ],
        name: 'smoothGraphics',
    } as const;

    private _texturedShader: Shader;

    public contextChange(renderer: Renderer): void
    {
        const localUniforms = new UniformGroup({
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uRound: { value: 0, type: 'f32' },
        });

        const maxTextures = this._maxTextures = renderer.limits.maxBatchableTextures;

        // both shaders share the uniform group, so the pipe only has to update this.shader
        this.shader = new Shader({
            gpuProgram: getSmoothGpuProgram({ name: 'smooth-local', maxTextures, localUniforms: true }),
            resources: { localUniforms },
        });
        this._texturedShader = new Shader({
            gpuProgram: getSmoothGpuProgram({
                name: 'smooth-local-textured', maxTextures, localUniforms: true, textured: true,
            }),
            resources: { localUniforms },
        });
    }

    protected _getRenderData(renderer: WebGPURenderer, context: GraphicsContext): SmoothGraphicsContextRenderData
    {
        return renderer.smoothGraphicsContext.getContextRenderData(context);
    }

    protected override _getShader(renderData: SmoothGraphicsContextRenderData): Shader
    {
        return renderData.textured ? this._texturedShader : this.shader;
    }

    public override destroy(): void
    {
        this._texturedShader.destroy();
        this._texturedShader = null;
        super.destroy();
    }
}
