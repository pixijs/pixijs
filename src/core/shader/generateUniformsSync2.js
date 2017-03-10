const GLSL_TO_SINGLE_SETTERS_CACHED = {

    float:    `if(cacheValue !== value)
{
    cacheValue.value = value;
    gl.uniform1f(location, value)
}`,

    vec2:     `if(cacheValue[0] !== value[0] || cacheValue[1] !== value[1])
{
    cacheValue[0] = value[0];
    cacheValue[1] = value[1];
    gl.uniform2f(location, value[0], value[1])
}`,
    vec3:     `if(cacheValue[0] !== value[0] || cacheValue[1] !== value[1] || cacheValue[2] !== value[2])
{
    cacheValue[0] = value[0];
    cacheValue[1] = value[1];
    cacheValue[2] = value[2];

    gl.uniform3f(location, value[0], value[1], value[2])
}`,
    vec4:     'gl.uniform4f(location, value[0], value[1], value[2], value[3])',

    int:      'gl.uniform1i(location, value)',
    ivec2:    'gl.uniform2i(location, value[0], value[1])',
    ivec3:    'gl.uniform3i(location, value[0], value[1], value[2])',
    ivec4:    'gl.uniform4i(location, value[0], value[1], value[2], value[3])',

    bool:     'gl.uniform1i(location, value)',
    bvec2:    'gl.uniform2i(location, value[0], value[1])',
    bvec3:    'gl.uniform3i(location, value[0], value[1], value[2])',
    bvec4:    'gl.uniform4i(location, value[0], value[1], value[2], value[3])',

    mat2:     'gl.uniformMatrix2fv(location, false, value)',
    mat3:     'gl.uniformMatrix3fv(location, false, value)',
    mat4:     'gl.uniformMatrix4fv(location, false, value)',

    sampler2D: 'uniform1i(location, value)',
    samplerCube: 'uniform1i(location, value)',
};

const GLSL_TO_ARRAY_SETTERS = {

    float:    `gl.uniform1fv(location, value)`,

    vec2:     `gl.uniform2fv(location, value)`,
    vec3:     `gl.uniform3fv(location, value)`,
    vec4:     'gl.uniform4fv(location, value)',

    int:      'gl.uniform1iv(location, value)',
    ivec2:    'gl.uniform2iv(location, value)',
    ivec3:    'gl.uniform3iv(location, value)',
    ivec4:    'gl.uniform4iv(location, value)',

    bool:     'gl.uniform1iv(location, value)',
    bvec2:    'gl.uniform2iv(location, value)',
    bvec3:    'gl.uniform3iv(location, value)',
    bvec4:    'gl.uniform4iv(location, value)',

    sampler2D: 'uniform1i(location, value)',
    samplerCube: 'uniform1i(location, value)',
};

export default function generateUniformsSync2(group, uniformData)
{
    let textureCount = 0;
    let func = `var value = null;
    var cacheValue = null
    var gl = renderer.gl`;


    for (const i in group.uniforms)
    {
        const data = uniformData[i];
        //group.uniforms[i];
         console.log(i, data);
        if(!data)
        {
            if(group.uniforms[i].group)
            {
                func += `
                    renderer.shaderManager.syncUniformGroup(uniformValues.${i});
                `
            }

            continue;
        }

        // TODO && uniformData[i].value !== 0 <-- do we still need this?
        if (data.type === 'float' && data.size === 1)
        {
            func += `\nif(uniformValues.${i} !== uniformData.${i}.value)
{
    uniformData.${i}.value = uniformValues.${i}
    gl.uniform1f(uniformData.${i}.location, uniformValues.${i})
}\n`;
        }
        else if ( (data.type === 'sampler2D' || data.type === 'samplerCube') && data.size === 1)
        {
            func += `\nif (uniformValues.${i}.baseTexture)
{
    var location = renderer.bindTexture(uniformValues.${i}.baseTexture, ${textureCount}, false);

    if(uniformData.${i}.value !== location)
    {
        uniformData.${i}.value = location;
        gl.uniform1i(uniformData.${i}.location, location);\n; // eslint-disable-line max-len
    }
}
else if(uniformValues.${i}._new)
{
    renderer.texture.bind(uniformValues.${i}, ${textureCount})
    if(uniformData.${i}.value !== ${textureCount})
    {
        uniformData.${i}.value = ${textureCount};
        gl.uniform1i(uniformData.${i}.location, ${textureCount});\n; // eslint-disable-line max-len
    }
}
else
{
    uniformData.${i}.value = ${textureCount};
    renderer.boundTextures[${textureCount}] = renderer.emptyTextures[${textureCount}];
    gl.activeTexture(gl.TEXTURE0 + ${textureCount});

    uniformValues.${i}.bind();
}`;
            textureCount++;
        }
        else if (data.type === 'mat3' && data.size === 1)
        {
            func += `\nvalue = uniformValues.${i};
gl.uniformMatrix3fv(uniformData.${i}.location, false, (value.a === undefined) ? value : value.toArray(true));\n`;
        }
        else if (data.type === 'vec2' && data.size === 1)
        {
            // TODO - do we need both here?
            // maybe we can get away with only using points?
            func += `\ncacheValue = uniformData.${i}.value;
value = uniformValues.${i};

if(value.x !== undefined)
{
    if(cacheValue[0] !== value.x || cacheValue[1] !== value.y)
    {
        cacheValue[0] = value.x;
        cacheValue[1] = value.y;
        gl.uniform2f(uniformData.${i}.location, value.x, value.y);
    }
}
else
{
    if(cacheValue[0] !== value[0] || cacheValue[1] !== value[1])
    {
        cacheValue[0] = value[0];
        cacheValue[1] = value[1];
        gl.uniform2f(uniformData.${i}.location, value[0], value[1]);
    }
}\n`;
        }
        else
        {
            const templateType = (data.size === 1) ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS;

            const template =  templateType[data.type].replace('location', `uniformData.${i}.location`);

            func += `\ncacheValue = uniformData.${i}.value;
value = uniformValues.${i};
${template};\n`;
        }
    }

    //console.log(' --------------- ')
    //console.log(func);

    return new Function('uniformData', 'uniformValues', 'renderer', func); // eslint-disable-line no-new-func
}
