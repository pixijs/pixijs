import { Matrix } from '../../../maths/matrix/Matrix';
import {
    compileHighShaderGlProgram,
    compileHighShaderGpuProgram
} from '../../../rendering/high-shader/compileHighShaderToProgram';
import { localUniformBit, localUniformBitGl } from '../../../rendering/high-shader/shader-bits/localUniformBit';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { tilingBit, tilingBitGl } from './tilingBit';

import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { TextureShader } from '../../mesh/shared/MeshView';

interface TilingSpriteOptions
{
    texture: Texture;
}

export class TilingSpriteShader extends Shader implements TextureShader
{
    private _texture: Texture;

    constructor(options: TilingSpriteOptions)
    {
        const gpuProgram = compileHighShaderGpuProgram({
            name: 'tiling-sprite-shader',
            bits: [
                localUniformBit,
                tilingBit,
            ],
        });

        const glProgram = compileHighShaderGlProgram({
            name: 'tiling-sprite-shader',
            bits: [
                localUniformBitGl,
                tilingBitGl,
            ]
        });

        const tilingUniforms = new UniformGroup({
            uMapCoord: { value: new Matrix(), type: 'mat3x3<f32>' },
            uClampFrame: { value: new Float32Array([0, 0, 1, 1]), type: 'vec4<f32>' },
            uClampOffset: { value: new Float32Array([0, 0]), type: 'vec2<f32>' },
            uTextureTransform: { value: new Matrix(), type: 'mat3x3<f32>' },
            uSizeAnchor: { value: new Float32Array([100, 200, 0.5, 0.5]), type: 'vec4<f32>' },
        });

        super({
            glProgram,
            gpuProgram,
            resources: {
                tilingUniforms,
                uTexture: options.texture.source,
                uSampler: options.texture.source.style,
            }
        });
    }

    get texture(): Texture
    {
        return this._texture;
    }

    set texture(value: Texture)
    {
        if (this._texture === value) return;

        this._texture = value;

        this.resources.uTexture = value.source;
        this.resources.uSampler = value.source.style;
    }
}
