var generateUniformsSync = function(uniformData)
{

    var textureCount = 1;
    var func = 'let value = null;'

    for (var i in uniformData)
    {
        let data = uniformData[i];

        // TODO && uniformData[i].value !== 0 <-- do we still need this?
        if(data.type === 'sampler2D')
        {
            func += '\ngl.uniform1iv(uniformData.'+i+'.location, renderer.bindTexture(uniformValues.' + i + ', ' + (textureCount++) + ', true) );\n'
        }
        else if (data.type === 'mat3')
        {
            func += '\nvalue = uniformValues.' + i + ';';
            func += '\ngl.uniformMatrix3fv(uniformData.'+i+'.location, false, (value.a !== undefined) ? value : value.toArray(true));\n'
        }
        else if (data.type === 'vec2')
        {
            func += '\nvalue = uniformValues.' + i + ';\n';
            func += '\nif(value.x !== undefined)gl.uniform2f(uniformData.'+i+'.location, value.x, value.y);'
            func += '\nelse gl.uniform2f(uniformData.'+i+'.location, value[0], value[1]);\n'

        }
        else
        {
            var template = GLSL_TO_SINGLE_SETTERS[data.type].replace('location', 'uniformData.'+i+'.location');
            func += '\nvalue = uniformValues.' + i + ';\n';
            func += template +'\n';
        }

    };

    console.log(func);

    return new Function('uniformData', 'uniformValues', 'gl', func);
}

var generateUniformsSyncCached = function(uniformData)
{

    var textureCount = 1;
    var func = 'let value = null; let cacheValue = null'

    for (var i in uniformData)
    {
        let data = uniformData[i];

        // TODO && uniformData[i].value !== 0 <-- do we still need this?
        if(data.type === 'sampler2D')
        {
            func += '\ngl.uniform1iv(uniformData.'+i+'.location, renderer.bindTexture(uniformValues.' + i + ', ' + (textureCount++) + ', true) );\n'
        }
        else if (data.type === 'mat3')
        {
            func += '\nvalue = uniformValues.' + i + ';';
            func += '\ngl.uniformMatrix3fv(uniformData.'+i+'.location, false, (value.a !== undefined) ? value : value.toArray(true));\n'
        }
        else if (data.type === 'vec2')
        {
            func += '\nvalue = uniformValues.' + i + ';\n';
            func += '\nif(value.x !== undefined)gl.uniform2f(uniformData.'+i+'.location, value.x, value.y);'
            func += '\nelse gl.uniform2f(uniformData.'+i+'.location, value[0], value[1]);\n'

        }
        else
        {
            var template = GLSL_TO_SINGLE_SETTERS_CACHED[data.type].replace('location', 'uniformData.'+i+'.location');
            func += '\ncacheValue = uniformData.' + i + '.value;\n';
            func += 'value = uniformValues.' + i + ';\n';
            func += template +'\n';
        }

    };

    console.log(func);

    return new Function('uniformData', 'uniformValues', 'gl', func);
}

var GLSL_TO_SINGLE_SETTERS = {

    'float':    'gl.uniform1f(location, value)',

    'vec2':     'gl.uniform2f(location, value[0], value[1])',
    'vec3':     'gl.uniform3f(location, value[0], value[1], value[2])',
    'vec4':     'gl.uniform4f(location, value[0], value[1], value[2], value[3])',

    'int':      'gl.uniform1i(location, value)',
    'ivec2':    'gl.uniform2i(location, value[0], value[1])',
    'ivec3':    'gl.uniform3i(location, value[0], value[1], value[2])',
    'ivec4':    'gl.uniform4i(location, value[0], value[1], value[2], value[3])',

    'bool':     'gl.uniform1i(location, value)',
    'bvec2':    'gl.uniform2i(location, value[0], value[1])',
    'bvec3':    'gl.uniform3i(location, value[0], value[1], value[2])',
    'bvec4':    'gl.uniform4i(location, value[0], value[1], value[2], value[3])',

    'mat2':     'gl.uniformMatrix2fv(location, false, value)',
    'mat3':     'gl.uniformMatrix3fv(location, false, value)',
    'mat4':     'gl.uniformMatrix4fv(location, false, value)',

    'sampler2D':'uniform1i(location, value)'
};

var GLSL_TO_SINGLE_SETTERS_CACHED = {

    'float':    `if(cacheValue !== value)
{
    cacheValue = value;
    gl.uniform1f(location, value)
}`

    'vec2':     `if(cacheValue[0] !== value[0] || cacheValue[1] !== value[1])
{
    cacheValue[0] = value[0];
    cacheValue[1] = value[1];
    gl.uniform2f(location, value[0], value[1])
}`
    'vec3':     `if(cacheValue[0] !== value[0] || cacheValue[1] !== value[1] || cacheValue[2] !== value[2])
{
    cacheValue[0] = value[0];
    cacheValue[1] = value[1];
    cacheValue[2] = value[2];
    gl.uniform3f(location, value[0], value[1], value[2])
}`,
    'vec4':     'gl.uniform4f(location, value[0], value[1], value[2], value[3])',

    'int':      'gl.uniform1i(location, value)',
    'ivec2':    'gl.uniform2i(location, value[0], value[1])',
    'ivec3':    'gl.uniform3i(location, value[0], value[1], value[2])',
    'ivec4':    'gl.uniform4i(location, value[0], value[1], value[2], value[3])',

    'bool':     'gl.uniform1i(location, value)',
    'bvec2':    'gl.uniform2i(location, value[0], value[1])',
    'bvec3':    'gl.uniform3i(location, value[0], value[1], value[2])',
    'bvec4':    'gl.uniform4i(location, value[0], value[1], value[2], value[3])',

    'mat2':     'gl.uniformMatrix2fv(location, false, value)',
    'mat3':     'gl.uniformMatrix3fv(location, false, value)',
    'mat4':     'gl.uniformMatrix4fv(location, false, value)',

    'sampler2D':'uniform1i(location, value)'
};

var GLSL_TO_ARRAY_SETTERS = {

    'float':    'uniform1fv(location, value)',

    'vec2':     'uniform2fv(location, value)',
    'vec3':     'uniform3fv(location, value)',
    'vec4':     'uniform4fv(location, value)',

    'int':      'uniform1iv(location, value)',
    'ivec2':    'uniform2iv(location, value)',
    'ivec3':    'uniform3iv(location, value)',
    'ivec4':    'uniform4iv(location, value)',

    'bool':     'uniform1iv(location, value)',
    'bvec2':    'uniform2iv(location, value)',
    'bvec3':    'uniform3iv(location, value)',
    'bvec4':    'uniform4iv(location, value)',

    'sampler2D':'uniform1iv(location, value)'
};

module.exports = generateUniformsSyncCached;
