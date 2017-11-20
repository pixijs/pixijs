import { Shader, UniformGroup } from '@pixi/core';
import vertex from './texture.vert';

const fragTemplate = [
    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'varying float vTextureId;',
    'uniform sampler2D uSamplers[%count%];',

    'void main(void){',
    'vec4 color;',
    'float textureId = floor(vTextureId+0.5);',
    '%forloop%',
    'gl_FragColor = color * vColor;',
    '}',
].join('\n');

export default function generateMultiTextureShader(gl, maxTextures)
{
    const sampleValues = new Int32Array(maxTextures);

    for (let i = 0; i < maxTextures; i++)
    {
        sampleValues[i] = i;
    }

    const uniforms = {
        default: UniformGroup.from({ uSamplers: sampleValues }, true),
    };

    let fragmentSrc = fragTemplate;

    fragmentSrc = fragmentSrc.replace(/%count%/gi, maxTextures);
    fragmentSrc = fragmentSrc.replace(/%forloop%/gi, generateSampleSrc(maxTextures));

    const shader = Shader.from(vertex, fragmentSrc, uniforms);

    return shader;
}

function generateSampleSrc(maxTextures)
{
    let src = '';

    src += '\n';
    src += '\n';

    for (let i = 0; i < maxTextures; i++)
    {
        if (i > 0)
        {
            src += '\nelse ';
        }

        if (i < maxTextures - 1)
        {
            src += `if(textureId == ${i}.0)`;
        }

        src += '\n{';
        src += `\n\tcolor = texture2D(uSamplers[${i}], vTextureCoord);`;
        src += '\n}';
    }

    src += '\n';
    src += '\n';

    return src;
}
