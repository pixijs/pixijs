var core = require('../../core')

var GAUSSIAN_VALUES = {
	5:[0.06136, 0.24477, 0.38774],
	7:[0.00598, 0.060626, 0.241843, 0.383103],
	9:[0.000229, 0.005977, 0.060598, 0.241732, 0.382928],
	11:[0.000003, 0.000229, 0.005977, 0.060598, 0.24173, 0.382925],
	13:[0.0, 0.000003, 0.000229, 0.005977, 0.060598, 0.24173, 0.382925]
}

var generateFragBlurSource = function(kernelSize)
{
    var kernel = GAUSSIAN_VALUES[kernelSize];
    var halfLength = kernel.length;

    var fragSource = fragTemplate;

    var blurLoop = '';
    var template = 'gl_FragColor += texture2D(uSampler, vBlurTexCoords[%index%]) * %value%;' 

    for (var i = 0; i < kernelSize; i++) 
    {
    	var blur = template.replace('%index%', i);

    	value = i;
    	
    	if(i >= halfLength)
    	{
    		value = kernelSize - i - 1; 
    	}


    	blur = blur.replace('%value%', kernel[value]);
    	
    	blurLoop += blur;
    	blurLoop += '\n';
    };

    fragSource = fragSource.replace('%blur%', blurLoop)
    fragSource = fragSource.replace('%size%', kernelSize)


    return fragSource;
}

var fragTemplate = [
		
	'precision mediump float;',

	'varying vec2 vBlurTexCoords[%size%];',
	'uniform sampler2D uSampler;',

	'void main(void)',
	'{',
	'	gl_FragColor = vec4(0.0);',
	'	%blur%',
	'}'

].join('\n');

module.exports = generateFragBlurSource;