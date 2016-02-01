
/**
 * The default vertex shader source
 *
 * @static
 * @constant
 */
var defaultVertexSrc = [
    'precision lowp float;',
    'attribute vec2 aVertexPosition;',
    'attribute vec2 aTextureCoord;',

    'uniform mat3 projectionMatrix;',
    'uniform mat3 otherMatrix;',
    'varying vec2 vTextureCoord;',
    'varying vec2 vFilterCoord;',

    'void main(void){',
    '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
    '   vFilterCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;',
    '   vTextureCoord = aTextureCoord ;',
    '}'
].join('\n');

/**
 * The default fragment shader source
 *
 * @static
 * @constant
 */
var defaultFragmentSrc = [
    'precision lowp float;',

    'struct Matty{',
       '    float some;',
        '   float dohave;',
        'float them;',
    '};',

    'varying vec2   vTextureCoord;',
    'varying vec2    vFilterCoord;',
    'uniform sampler2D uSampler;',
    'uniform sampler2D filterSampler;',
    'uniform Matty thing;',

    'void main(void){',
    '   vec4 masky = texture2D(filterSampler, vFilterCoord);',
    '   vec4 sample = texture2D(uSampler, vTextureCoord);',
    '   vec4 color;',
    '   if(mod(vFilterCoord.x, 1.0) > 0.5){',
    '   ',
    '     color = vec4(1.0, 0.0, 0.0, 1.0) + thing.some;',
    '   }',
    '   else',
    '   {',
    '     color = vec4(0.0, 1.0, 0.0, 1.0) ;',
    '   }',
   // '   gl_FragColor = vec4(mod(vFilterCoord.x, 1.5), vFilterCoord.y,0.0,1.0);',
    '   gl_FragColor = mix(sample, masky, 0.5);',
    '   gl_FragColor *= sample.a;',
    '}'
].join('\n');

//clean out white space tabs
var lines = defaultFragmentSrc.replace(/\s+/g,' ')
            .split(/\s*;\s*/);

function extractUniforms(vertexSrc, fragmentSrc)
{
    var fragUniforms = extractUniformsFromString(defaultFragmentSrc);
    var vertUniforms = extractUniformsFromString(defaultVertexSrc);

    return Object.assign(fragUniforms, vertUniforms);
}

function mergeObject(object1, object2)
{
    return Object.assign({}, object1, object2);
}


function extractUniformsFromString(string)
{
    var uniforms = {};

    // clean the lines a little - remove extra spaces / teabs etc
    // then split along ';'
    var lines = string.replace(/\s+/g,' ')
                .split(/\s*;\s*/);


    // loop through..
    for (var i = 0; i < lines.length; i++) 
    {
        var line = lines[i].trim();
        
        if(line.indexOf('uniform') > -1)
        {
            var splitLine = line.split(' ');
            var type = splitLine[1];
            var name = splitLine[2];
            console.log(name + " is of type " + type);
            uniforms[name] = 0;
        }

        return uniforms;
    };
}
//console.log(lines);
