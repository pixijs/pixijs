var Shader = require('pixi-gl-core').GLShader;
var fs = require('fs');

function generateMultiTextureShader(gl, maxTextures)
{
    var vertexSrc = fs.readFileSync(__dirname + '/texture.vert', 'utf8');
    var fragmentSrc = fragTemplate

    fragmentSrc = fragmentSrc.replace(/\%\%/gi, maxTextures);
    fragmentSrc = fragmentSrc.replace(/\%forloop\%/gi, generateSampleSrc(maxTextures));

    var shader = new Shader(gl, vertexSrc, fragmentSrc);

    var sampleValues = [];
    for (var i = 0; i < maxTextures; i++) {
        sampleValues[i] = i;
    };

    shader.bind();
    shader.uniforms.uSamplers = sampleValues;

    return shader;
}

function generateSampleSrc(maxTextures)
{
    var src = ''

    src += '\n';
    src += '\n';
    
    for (var i = 0; i < maxTextures; i++) 
    {
        if(i > 0)src += '\nelse ';
        if(i < maxTextures-1)src += 'if(ndx == ' + i + ')';
        src += '\n{';
        src += '\n\tcolor = texture2D(uSamplers['+i+'], vTextureCoord);';
        src += '\n}';
    };

    src += '\n';
    src += '\n';

    return src;
}

var fragTemplate = [

    'precision lowp float;',
    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'varying float vTextureId;',
    'uniform sampler2D uSamplers[%%];',

    'void main(void){',
        'vec4 color;',
        'int ndx = int(vTextureId);',
        '%forloop%',
        'gl_FragColor = color * vColor;',
    '}'
].join('\n');

module.exports = generateMultiTextureShader;
