import Shader from '../shader/Shader';
import Program from '../shader/Program';
import UniformGroup from '../shader/UniformGroup';

import vertex from './texture.vert';
import { Matrix } from '@pixi/math';

const fragTemplate = [
    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'varying float vTextureId;',
    'uniform sampler2D uSamplers[%count%];',

    'void main(void){',
    'vec4 color;',
    '%forloop%',
    'gl_FragColor = color * vColor;',
    '}',
].join('\n');

const defaultGroupCache = {};
const programCache = {};

export default function generateMultiTextureShader(gl, maxTextures)
{
    if (!programCache[maxTextures])
    {
        const sampleValues = new Int32Array(maxTextures);

        for (let i = 0; i < maxTextures; i++)
        {
            sampleValues[i] = i;
        }

        defaultGroupCache[maxTextures] = UniformGroup.from({ uSamplers: sampleValues }, true);

        let fragmentSrc = fragTemplate;

        fragmentSrc = fragmentSrc.replace(/%count%/gi, maxTextures);
        fragmentSrc = fragmentSrc.replace(/%forloop%/gi, generateSampleSrc(maxTextures));

        programCache[maxTextures] = new Program(vertex, fragmentSrc);
    }

    const uniforms = {
        tint: new Float32Array([1, 1, 1, 1]),
        translationMatrix: new Matrix(),
        default: defaultGroupCache[maxTextures],
    };

    const shader = new Shader(programCache[maxTextures], uniforms);

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
            src += `if(vTextureId < ${i}.5)`;
        }

        src += '\n{';
        src += `\n\tcolor = texture2D(uSamplers[${i}], vTextureCoord);`;
        src += '\n}';
    }

    src += '\n';
    src += '\n';

    return src;
}
