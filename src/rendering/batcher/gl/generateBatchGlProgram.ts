import { GlProgram } from '../../renderers/gl/shader/GlProgram';

export function generateBatchGlProgram({ vertexSrc, fragmentSrc, maxTextures, name }: {
    vertexSrc: string;
    fragmentSrc: string;
    maxTextures: number;
    name?: string;
}): GlProgram
{
    if (fragmentSrc.indexOf('%count%') < 0)
    {
        throw new Error('Fragment template must contain "%count%".');
    }

    if (fragmentSrc.indexOf('%forloop%') < 0)
    {
        throw new Error('Fragment template must contain "%forloop%".');
    }

    const samplerSrc = generateSampleSrc(maxTextures);

    fragmentSrc = fragmentSrc.replace(/%count%/gi, `${maxTextures}`);
    fragmentSrc = fragmentSrc.replace(/%forloop%/gi, samplerSrc);

    name = name ? `${name}-` : '';

    const program = new GlProgram({ vertex: vertexSrc, fragment: fragmentSrc, name: `${name}batch` });

    return program;
}

function generateSampleSrc(maxTextures: number): string
{
    const src = [];

    for (let i = 0; i < maxTextures; i++)
    {
        if (i > 0)
        {
            src.push('else');
        }

        if (i < maxTextures - 1)
        {
            src.push(`if(vTextureId < ${i}.5)`);
        }

        src.push('{');
        src.push(`\toutColor = texture(uSamplers[${i}], vTextureCoord);`);
        src.push('}');
    }

    return src.join('\n');
}
