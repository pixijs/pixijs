var glCore = require('pixi-gl-core');

var fragTemplate = [
    'precision mediump float;',
    'void main(void){',
        'float test = 0.1;',
        '%forloop%',
        'gl_FragColor = vec4(0.0);',
    '}'
].join('\n');

var checkMaxIfStatmentsInShader = function(maxIfs, gl)
{
    var createTempContext = !gl;

    if(createTempContext)
    {
        var tinyCanvas = document.createElement('canvas');
        tinyCanvas.width = 1;
        tinyCanvas.height = 1;

        gl = glCore.createContext(tinyCanvas);
    }

    var shader = gl.createShader(gl.FRAGMENT_SHADER);

    while(true)
    {
        var fragmentSrc = fragTemplate.replace(/%forloop%/gi, generateIfTestSrc(maxIfs));

        gl.shaderSource(shader, fragmentSrc);
        gl.compileShader(shader);

        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        {
            maxIfs = (maxIfs/2)|0;
        }
        else
        {
            // valid!
            break;
        }
    }

    if(createTempContext)
    {
        // get rid of context
        if(gl.getExtension('WEBGL_lose_context'))
        {
            gl.getExtension('WEBGL_lose_context').loseContext();
        }
    }

    return maxIfs;
};



function generateIfTestSrc(maxIfs)
{
    var src = '';

    for (var i = 0; i < maxIfs; i++)
    {
        if(i > 0)
        {
            src += '\nelse ';
        }

        if(i < maxIfs-1)
        {
            src += 'if(test == ' + i + '.0){}';
        }
    }

    return src;
}

module.exports = checkMaxIfStatmentsInShader;
