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
};

export default function generateUniformsSync(uniformData)
{
    let textureCount = 1;
    let func = `var value = null;
    var cacheValue = null
    var gl = renderer.gl`;

    for (const i in uniformData)
    {
        const data = uniformData[i];

        // TODO && uniformData[i].value !== 0 <-- do we still need this?
        if (data.type === 'float')
        {
            func += `\nif(uniformValues.${i} !== uniformData.${i}.value)
{
    uniformData.${i}.value = uniformValues.${i}
    gl.uniform1f(uniformData.${i}.location, uniformValues.${i})
}\n`;
        }
        else if (data.type === 'sampler2D')
        {
            func += `\nif (uniformValues.${i}.baseTexture)
{
    var location = renderer.bindTexture(uniformValues.${i}.baseTexture, ${textureCount++}, true);

    if(uniformData.${i}.value !== location)
    {
        uniformData.${i}.value = location;
        gl.uniform1i(uniformData.${i}.location, location);\n; // eslint-disable-line max-len
    }
}
else
{
    uniformData.${i}.value = ${textureCount};
    renderer.boundTextures[${textureCount}] = renderer.emptyTextures[${textureCount}];
    gl.activeTexture(gl.TEXTURE0 + ${textureCount++});

    uniformValues.${i}.bind();
}`;
        }
        else if (data.type === 'mat3')
        {
            func += `\nvalue = uniformValues.${i};
gl.uniformMatrix3fv(uniformData.${i}.location, false, (value.a === undefined) ? value : value.toArray(true));\n`;
        }
        else if (data.type === 'vec2')
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
            const template = GLSL_TO_SINGLE_SETTERS_CACHED[data.type].replace('location', `uniformData.${i}.location`);

            func += `\ncacheValue = uniformData.${i}.value;
value = uniformValues.${i};
${template};\n`;
        }
    }

    // console.log(' --------------- ')
    // console.log(func);

    return new Function('uniformData', 'uniformValues', 'renderer', func); // eslint-disable-line no-new-func
}
