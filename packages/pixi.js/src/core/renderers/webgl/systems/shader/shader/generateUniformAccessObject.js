const getterTemplate = [
    'return this.data.%%.value;',
].join('\n');

const setterTemplate = [
    'this.data.%%.value = value;',
    'var location = this.data.%%.location;',
].join('\n');

const GLSL_TO_SINGLE_SETTERS = {

    float:    'uniform1f(location, value)',

    vec2:     'uniform2f(location, value[0], value[1])',
    vec3:     'uniform3f(location, value[0], value[1], value[2])',
    vec4:     'uniform4f(location, value[0], value[1], value[2], value[3])',

    int:      'uniform1i(location, value)',
    ivec2:    'uniform2i(location, value[0], value[1])',
    ivec3:    'uniform3i(location, value[0], value[1], value[2])',
    ivec4:    'uniform4i(location, value[0], value[1], value[2], value[3])',

    bool:     'uniform1i(location, value)',
    bvec2:    'uniform2i(location, value[0], value[1])',
    bvec3:    'uniform3i(location, value[0], value[1], value[2])',
    bvec4:    'uniform4i(location, value[0], value[1], value[2], value[3])',

    mat2:     'uniformMatrix2fv(location, false, value)',
    mat3:     'uniformMatrix3fv(location, false, value)',
    mat4:     'uniformMatrix4fv(location, false, value)',

    sampler2D: 'uniform1i(location, value)',
    samplerCube: 'uniform1i(location, value)',

};

const GLSL_TO_ARRAY_SETTERS = {

    float:    'uniform1fv(location, value)',

    vec2:     'uniform2fv(location, value)',
    vec3:     'uniform3fv(location, value)',
    vec4:     'uniform4fv(location, value)',

    int:      'uniform1iv(location, value)',
    ivec2:    'uniform2iv(location, value)',
    ivec3:    'uniform3iv(location, value)',
    ivec4:    'uniform4iv(location, value)',

    bool:     'uniform1iv(location, value)',
    bvec2:    'uniform2iv(location, value)',
    bvec3:    'uniform3iv(location, value)',
    bvec4:    'uniform4iv(location, value)',

    sampler2D: 'uniform1iv(location, value)',
    samplerCube: 'uniform1i(location, value)',
};

/**
 * Extracts the attributes
 * @method generateUniformAccessObject
 * @memberof PIXI.glCore.shader
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param uniforms {Array} @mat ?
 * @return attributes {Object}
 */
export default function generateUniformAccessObject(gl, uniformData)
{
    // this is the object we will be sending back.
    // an object hierachy will be created for structs
    const uniforms = { data: {} };

    uniforms.gl = gl;

    const uniformKeys = Object.keys(uniformData);

    for (let i = 0; i < uniformKeys.length; i++)
    {
        const fullName = uniformKeys[i];

        const nameTokens = fullName.split('.');
        const name = nameTokens[nameTokens.length - 1];

        const uniformGroup = getUniformGroup(nameTokens, uniforms);

        const uniform =  uniformData[fullName];

        uniformGroup.data[name] = uniform;

        uniformGroup.gl = gl;

        Object.defineProperty(uniformGroup, name, {
            get: generateGetter(name),
            set: generateSetter(name, uniform),
        });
    }

    return uniforms;
}

function generateGetter(name)
{
    const template = getterTemplate.replace('%%', name);

    return new Function(template); // eslint-disable-line no-new-func
}

function generateSetter(name, uniform)
{
    let template = setterTemplate.replace(/%%/g, name);
    let setTemplate;

    if (uniform.size === 1)
    {
        setTemplate = GLSL_TO_SINGLE_SETTERS[uniform.type];
    }
    else
    {
        setTemplate = GLSL_TO_ARRAY_SETTERS[uniform.type];
    }

    if (setTemplate)
    {
        template += `\nthis.gl.${setTemplate};`;
    }

    return new Function('value', template); // eslint-disable-line no-new-func
}

function getUniformGroup(nameTokens, uniform)
{
    let cur = uniform;

    for (let i = 0; i < nameTokens.length - 1; i++)
    {
        const o = cur[nameTokens[i]] || { data: {} };

        cur[nameTokens[i]] = o;
        cur = o;
    }

    return cur;
}
