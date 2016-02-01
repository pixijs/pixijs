var defaultValue = require('pixi-gl-core/lib/shader/defaultValue');

function extractUniformsFromSrc(vertexSrc, fragmentSrc, mask)
{
    var vertUniforms = extractUniformsFromString(vertexSrc, mask);
    var fragUniforms = extractUniformsFromString(fragmentSrc, mask);

    return Object.assign(vertUniforms, fragUniforms);
}


function extractUniformsFromString(string, mask)
{
    var maskRegex = new RegExp('^(projectionMatrix|uSampler)$');

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

            if(!name.match(maskRegex))
            {     
                uniforms[name] = {
                    value:defaultValue(type),
                    name:name,
                    type:type
                }
            }
        }
    };
    
    console.log(uniforms)
    return uniforms;
}

module.exports = extractUniformsFromSrc;