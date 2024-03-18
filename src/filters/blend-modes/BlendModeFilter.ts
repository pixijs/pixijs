import { GlProgram } from '../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../rendering/renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../rendering/renderers/shared/shader/UniformGroup';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { Filter } from '../Filter';
import blendTemplateFrag from './blend-template.frag';
import blendTemplateVert from './blend-template.vert';
import blendTemplate from './blend-template.wgsl';

export interface BlendModeFilterOptions
{
    source?: string;
    gpu?: {
        functions?: string;
        main?: string;
    }
    gl?: {
        functions?: string;
        main?: string;
    }
}

export class BlendModeFilter extends Filter
{
    constructor(options: BlendModeFilterOptions)
    {
        const gpuOptions = options.gpu;

        const gpuSource = compileBlendModeShader({ source: blendTemplate, ...gpuOptions });

        const gpuProgram = GpuProgram.from({
            vertex: {
                source: gpuSource,
                entryPoint: 'mainVertex',
            },
            fragment: {
                source: gpuSource,
                entryPoint: 'mainFragment',
            },
        });

        const glOptions = options.gl;

        const glSource = compileBlendModeShader({ source: blendTemplateFrag, ...glOptions });

        const glProgram = GlProgram.from({
            vertex: blendTemplateVert,
            fragment: glSource
        });

        const uniformGroup = new UniformGroup({
            uBlend: {
                value: 1,
                type: 'f32'
            }
        });

        super({
            gpuProgram,
            glProgram,
            blendRequired: true,
            resources: {
                blendUniforms: uniformGroup,
                uBackTexture: Texture.EMPTY
            }
        });
    }
}

function compileBlendModeShader(options: {source: string, functions?: string, main?: string}): string
{
    const { source, functions, main } = options;

    return source.replace('{FUNCTIONS}', functions).replace('{MAIN}', main);
}
