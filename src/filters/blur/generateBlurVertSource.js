
var generateVertBlurSource = function(kernelSize, x)
{
    var halfLength = Math.ceil(kernelSize/2);

    var vertSource = vertTemplate;

    var blurLoop = '';
    var template

    if(x)
    {
    	template = 'vBlurTexCoords[%index%] = aTextureCoord + vec2(%samlpeIndex% * strength, 0.0);'
    }
    else
    {
    	template = 'vBlurTexCoords[%index%] = aTextureCoord + vec2(0.0, %samlpeIndex% * strength);'

    }
    	

    for (var i = 0; i < kernelSize; i++) 
    {
    	var blur = template.replace('%index%', i);

    	value = i;
    	
    	if(i >= halfLength)
    	{
    		value = kernelSize - i - 1; 
    	}

    	blur = blur.replace('%samlpeIndex%', (i - (halfLength-1)) + ".0");
    	
    	blurLoop += blur;
    	blurLoop += '\n';
    };

    vertSource = vertSource.replace('%blur%', blurLoop)
    vertSource = vertSource.replace('%size%', kernelSize)

    return vertSource;
}

var vertTemplate = [
		
	'attribute vec2 aVertexPosition;',
	'attribute vec2 aTextureCoord;',

	'uniform float strength;',
	'uniform mat3 projectionMatrix;',

	'varying vec2 vTextureCoord;',
	'varying vec2 vBlurTexCoords[%size%];',

	'void main(void)',
	'{',
	    'gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);',
	    'vTextureCoord = aTextureCoord;',//TODO remove..
		'%blur%',
	'}'
].join('\n');

module.exports = generateVertBlurSource;