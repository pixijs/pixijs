import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { compileHighShaderGlProgram } from '../../high-shader/compileHighShaderToProgram';
import { colorBitGl } from '../../high-shader/shader-bits/colorBit';
import { generateTextureBatchBitGl } from '../../high-shader/shader-bits/generateTextureBatchBit';
import { roundPixelsBitGl } from '../../high-shader/shader-bits/roundPixelsBit';
import { batchSamplersUniformGroup } from '../../renderers/gl/shader/batchSamplersUniformGroup';
import { Shader } from '../../renderers/shared/shader/Shader';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { State } from '../../renderers/shared/state/State';
import { MAX_TEXTURES } from '../shared/const';

import type { WebGLRenderer } from '../../renderers/gl/WebGLRenderer';
import type { Geometry } from '../../renderers/shared/geometry/Geometry';
import type { Batch } from '../shared/Batcher';
import type { BatcherAdaptor, BatcherPipe } from '../shared/BatcherPipe';

export class GlBatchAdaptor implements BatcherAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipesAdaptor,
        ],
        name: 'batch',
    } as const;

    private _shader: Shader;
    private _didUpload = false;
    private readonly _tempState = State.for2d();

    public init()
    {
        const uniforms = new UniformGroup({
            tint: { value: new Float32Array([1, 1, 1, 1]), type: 'f32' },
            translationMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
        });

        const glProgram = compileHighShaderGlProgram({
            name: 'batch',
            bits: [
                colorBitGl,
                generateTextureBatchBitGl(MAX_TEXTURES),
                roundPixelsBitGl,
            ]
        });

        this._shader = new Shader({
            glProgram,
            resources: {
                uniforms,
                batchSamplers: batchSamplersUniformGroup,
            }
        });
    }

    public start(batchPipe: BatcherPipe, geometry: Geometry): void
    {
        const renderer = batchPipe.renderer as WebGLRenderer;

        renderer.shader.bind(this._shader, this._didUpload);

        renderer.shader.bindUniformBlock(renderer.globalUniforms.uniformGroup, 'globalUniforms', 0);

        renderer.geometry.bind(geometry, this._shader.glProgram);
    }

    public execute(batchPipe: BatcherPipe, batch: Batch): void
    {
        const renderer = batchPipe.renderer as WebGLRenderer;

        this._didUpload = true;

        this._tempState.blendMode = batch.blendMode;

        renderer.state.set(this._tempState);

        const textures = batch.textures.textures;

        for (let i = 0; i < textures.length; i++)
        {
            renderer.texture.bind(textures[i], i);
        }

        renderer.geometry.draw('triangle-list', batch.size, batch.start);
    }

    public destroy(): void
    {
        this._shader.destroy(true);
        this._shader = null;
    }
}
