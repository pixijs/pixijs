let defaultValue = require('pixi-gl-core').shader.defaultValue;

function extractUniformsFromSrc(vertexSrc, fragmentSrc, mask)
{
    let vertUniforms = extractUniformsFromString(vertexSrc, mask);
    let fragUniforms = extractUniformsFromString(fragmentSrc, mask);

    return Object.assign(vertUniforms, fragUniforms);
}


function extractUniformsFromString(string)
{
    let maskRegex = new RegExp('^(projectionMatrix|uSampler|filterArea)$');

    let uniforms = {};
    let nameSplit;


    // clean the lines a little - remove extra spaces / teabs etc
    // then split along ';'
    let lines = string.replace(/\s+/g,' ')
                .split(/\s*;\s*/);

    // loop through..
    for (let i = 0; i < lines.length; i++)
    {
        let line = lines[i].trim();

        if(line.indexOf('uniform') > -1)
        {
            let splitLine = line.split(' ');
            let type = splitLine[1];

            let name = splitLine[2];
            let size = 1;

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
