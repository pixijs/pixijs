var Shader = require('../../Shader');
var glslify  = require('glslify');

var fragTemplate = [
    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'varying float vTextureId;',
    'uniform sampler2D uSamplers[%count%];',

    'void main(void){',
        'vec4 color;',
        '%forloop%',
        'gl_FragColor = color * vColor;',
    '}'
].join('\n');

function generateMultiTextureShader(gl, maxTextures)
{
    var vertexSrc = glslify('./texture.vert');
    var fragmentSrc = fragTemplate;

    fragmentSrc = fragmentSrc.replace(/%count%/gi, maxTextures);
    fragmentSrc = fragmentSrc.replace(/%forloop%/gi, generateSampleSrc(maxTextures));

    var shader = new Shader(gl, vertexSrc, fragmentSrc);

    var sampleValues = [];
    for (var i = 0; i < maxTextures; i++)
    {
        sampleValues[i] = i;
    }

    shader.bind();
    shader.uniforms.uSamplers = sampleValues;

    return shader;
}

function generateSampleSrc(maxTextures)
{
    var src = '';

    src += '\n';
    src += '\n';

    for (var i = 0; i < maxTextures; i++)
    {
        if(i > 0)
        {
            src += '\nelse ';
        }

        if(i < maxTextures-1)
        {
            src += 'if(vTextureId == ' + i + '.0)';
        }

        src += '\n{';
        src += '\n\tcolor = texture2D(uSamplers['+i+'], vTextureCoord);';
        src += '\n}';
    }

    src += '\n';
    src += '\n';

    return src;
}



module.exports = generateMultiTextureShader;
