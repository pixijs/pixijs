import { defaultValue } from './defaultValue';

export interface IExtractedUniformData
{
    type: string;
    dirtyId: number;
    name: string;
    value: number|Float32Array|Int32Array|boolean|boolean[];
}

function extractUniformsFromString(string: string): {[key: string]: IExtractedUniformData}
{
    const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');

    const uniforms: {[key: string]: IExtractedUniformData} = {};
    let nameSplit: Array<string>;

    // clean the lines a little - remove extra spaces, tabs, etc.
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
                    dirtyId: 0,
                    name,
                    type,
                };
            }
        }
    }

    return uniforms;
}

export function extractUniformsFromSrc(vertexSrc: string, fragmentSrc: string): {[key: string]: IExtractedUniformData}
{
    const vertUniforms = extractUniformsFromString(vertexSrc);
    const fragUniforms = extractUniformsFromString(fragmentSrc);

    return Object.assign(vertUniforms, fragUniforms);
}
