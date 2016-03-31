var defaultValue = require('pixi-gl-core/lib/shader/defaultValue');
var mapSize = require('pixi-gl-core/lib/shader/mapSize');

function extractUniformsFromSrc(vertexSrc, fragmentSrc, mask)
{
    var vertUniforms = extractUniformsFromString(vertexSrc, mask);
    var fragUniforms = extractUniformsFromString(fragmentSrc, mask);

    return Object.assign(vertUniforms, fragUniforms);
}


function extractUniformsFromString(string)
{
    var maskRegex = new RegExp('^(projectionMatrix|uSampler|filterArea)$');

    var uniforms = {};
    var nameSplit;


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
            var size = mapSize(type);

            if(name.indexOf('[') > -1)
            {
                // array!
                nameSplit = name.split(/\[|\]/);
                name = nameSplit[0];
                size *= Number(nameSplit[1]);
            }

            if(!name.match(maskRegex))
            {
                uniforms[name] = {
                    value:defaultValue(type, size),
                    name:name,
                    type:type
                };
            }
        }
    }

    return uniforms;
}

module.exports = extractUniformsFromSrc;
