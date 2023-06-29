import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/Matrix';
import { batchSamplersUniformGroup } from '../../renderers/gl/shader/batchSamplersUniformGroup';
import { Shader } from '../../renderers/shared/shader/Shader';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { MAX_TEXTURES } from '../shared/const';
import { generateDefaultBatchGlProgram } from './generateDefaultBatchGlProgram';

import type { WebGLRenderer } from '../../renderers/gl/WebGLRenderer';
import type { Batch } from '../shared/Batcher';
import type { BatcherAdaptor, BatcherPipe } from '../shared/BatcherPipe';

export class GlBatchAdaptor implements BatcherAdaptor
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLPipesAdaptor,
        ],
        name: 'batch',
    } as const;
    shader: Shader;
    didUpload = false;

    init()
    {
        const uniforms = new UniformGroup({
            tint: { value: new Float32Array([1, 1, 1, 1]), type: 'f32' },
            translationMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
        });

        this.shader = new Shader({
            glProgram: generateDefaultBatchGlProgram(MAX_TEXTURES),
            resources: {
                uniforms,
                batchSamplers: batchSamplersUniformGroup,
            }
        });
    }

    execute(batchPipe: BatcherPipe, batch: Batch): void
    {
        const renderer = batchPipe.renderer as WebGLRenderer;

        batchPipe.state.blendMode = batch.blendMode;

        renderer.state.set(batchPipe.state);

        renderer.shader.bind(this.shader, this.didUpload);

        this.didUpload = true;

        const activeBatcher = batch.batchParent;

        renderer.geometry.bind(activeBatcher.geometry, this.shader.glProgram);

        for (let i = 0; i < batch.textures.textures.length; i++)
        {
            renderer.texture.bind(batch.textures.textures[i], i);
        }

        renderer.shader.bindUniformBlock(renderer.globalUniforms.uniformGroup, 'globalUniforms', 0);

        renderer.geometry.draw('triangle-list', batch.size, batch.start);
    }

    destroy(): void
    {
        this.shader.destroy(true);
        this.shader = null;
    }
}
