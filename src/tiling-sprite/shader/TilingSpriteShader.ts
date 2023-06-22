import { Matrix } from '../../maths/Matrix';
import { GlProgram } from '../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../rendering/renderers/gpu/shader/GpuProgram';
import { Shader } from '../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../rendering/renderers/shared/shader/UniformGroup';
import programFrag from './tiling-sprite.frag';
import programVert from './tiling-sprite.vert';
import programWgsl from './tiling-sprite.wgsl';

import type { TextureShader } from '../../rendering/mesh/shared/MeshView';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';

interface TilingSpriteOptions
{
    texture: Texture;
}

export class TilingSpriteShader extends Shader implements TextureShader
{
    private _texture: Texture;

    constructor(options: TilingSpriteOptions)
    {
        const glProgram = GlProgram.from({
            vertex: programVert,
            fragment: programFrag,
            name: 'tiling-sprite',
        });

        const gpuProgram = GpuProgram.from({
            vertex: {
                source: programWgsl,
                entryPoint: 'mainVertex',
            },
            fragment: {
                source: programWgsl,
                entryPoint: 'mainFragment',
            }
        });

        // This is added automatically by the mesh pixi and the mesh renderer...
        // const localUniforms = new UniformGroup({
        //     color: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
        //     transformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
        // });

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
                uSampler: options.texture.style,
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
        this.resources.uSampler = value.style;
    }
}
