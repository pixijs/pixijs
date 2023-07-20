import { Matrix } from '../../../maths/Matrix';
import { MAX_TEXTURES } from '../../batcher/shared/const';
import { batchSamplersUniformGroup } from '../../renderers/gl/shader/batchSamplersUniformGroup';
import { Shader } from '../../renderers/shared/shader/Shader';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { generateDefaultSdfBatchGlProgram } from './generateDefaultSdfBatchGlProgram';
import { generateDefaultSdfBatchProgram } from './generateDefaultSdfBatchProgram';

export class SdfShader extends Shader
{
    constructor()
    {
        const uniforms = new UniformGroup({
            color: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            transformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            distance: { value: 4, type: 'f32' },
        });

        super({
            glProgram: generateDefaultSdfBatchGlProgram(MAX_TEXTURES),
            gpuProgram: generateDefaultSdfBatchProgram(MAX_TEXTURES),
            resources: {
                localUniforms: uniforms,
                batchSamplers: batchSamplersUniformGroup,
            }
        });
    }
}
