import { GlProgram } from '../../renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../renderers/gpu/shader/GpuProgram';
import { Shader } from '../../renderers/shared/shader/Shader';
import programFrag from '../gl/mesh-default.frag';
import programVert from '../gl/mesh-default.vert';
import programWgsl from '../gpu/mesh-default.wgsl';

import type { Texture } from '../../renderers/shared/texture/Texture';
import type { TextureShader } from './MeshView';

interface MeshShaderOptions
{
    texture: Texture;
}

export class MeshShader extends Shader implements TextureShader
{
    private _texture: Texture;

    constructor(options: MeshShaderOptions)
    {
        const glProgram = GlProgram.from({
            vertex: programVert,
            fragment: programFrag,
            name: 'mesh-default',
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

        super({
            glProgram,
            gpuProgram,
            resources: {
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
