var Shader = require('pixi-gl-core').GLShader;
var fs = require('fs');

function generateMultiTextureShader(gl, maxTextures)
{
    var vertexSrc = fs.readFileSync(__dirname + '/texture.vert', 'utf8');
    var fragmentSrc = 'precision lowp float;\n\n' + generateSampleSrc(maxTextures) + "\n\n" + fragTemplate

    fragmentSrc = fragmentSrc.replace(/\%\%/gi, '16');

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
    var src = 'vec4 getSampleFromArray(sampler2D textures[%%], int ndx, vec2 uv) {\n\nvec4 color;'

    src += '\n';
    src += '\n';
    
    for (var i = 0; i < maxTextures; i++) 
    {
        if(i > 0)src += '\nelse ';
        if(i < maxTextures-1)src += 'if(ndx == ' + i + ')';
        src += '\n{';
        src += '\n\tcolor = texture2D(textures['+i+'], uv);';
        src += '\n}';
    };

    src += '\n';
    src += '\n';
    src += 'return color;';
    src += '\n}';

    return src;
}

var fragTemplate = [

    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'varying float vTextureId;',
    'uniform sampler2D uSamplers[%%];',

    'void main(void){',
        'gl_FragColor = getSampleFromArray(uSamplers, int(vTextureId), vTextureCoord) * vColor;',
    '}'
].join('\n');

module.exports = generateMultiTextureShader;
