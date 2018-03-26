import glCore from 'pixi-gl-core';

const defaultValue = glCore.shader.defaultValue;

export default function extractUniformsFromSrc(vertexSrc, fragmentSrc, mask)
{
    const vertUniforms = extractUniformsFromString(vertexSrc, mask);
    const fragUniforms = extractUniformsFromString(fragmentSrc, mask);

    return Object.assign(vertUniforms, fragUniforms);
}

function extractUniformsFromString(string)
{
    const maskRegex = new RegExp('^(projectionMatrix|uSampler|filterArea|filterClamp)$');

    const uniforms = {};
    let nameSplit;

    // clean the lines a little - remove extra spaces / tabs etc
    // then split along ';'
    const lines = string.replace(/\s+/g, ' ')
                .split(/\s*;\s*/);

    // loop through..
    for (let i = 0; i < lines.length; i++)
    {
        const line = lines[i].trim();

        if (line.indexOf('uniform') > -1)
        {
            const splitLine = line.split(' ');
            const type = splitLine[1];

            let name = splitLine[2];
            let size = 1;

            if (name.indexOf('[') > -1)
            {
                // array!
                nameSplit = name.split(/\[|]/);
                name = nameSplit[0];
                size *= Number(nameSplit[1]);
            }

            if (!name.match(maskRegex))
            {
                uniforms[name] = {
                    value: defaultValue(type, size),
                    name,
                    type,
                };
            }
        }
    }

    return uniforms;
}
