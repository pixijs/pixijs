'use strict';

exports.__esModule = true;
exports.default = generateUniformsSync;
// cv = CachedValue
// v = value
// ud = uniformData
// uv = uniformValue
// l = loaction
var GLSL_TO_SINGLE_SETTERS_CACHED = {

    float: '\n    if(cv !== v)\n    {\n        cv.v = v;\n        gl.uniform1f(location, v)\n    }',

    vec2: '\n    if(cv[0] !== v[0] || cv[1] !== v[1])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        gl.uniform2f(location, v[0], v[1])\n    }',

    vec3: '\n    if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n\n        gl.uniform3f(location, v[0], v[1], v[2])\n    }',

    vec4: 'gl.uniform4f(location, v[0], v[1], v[2], v[3])',

    int: 'gl.uniform1i(location, v)',
    ivec2: 'gl.uniform2i(location, v[0], v[1])',
    ivec3: 'gl.uniform3i(location, v[0], v[1], v[2])',
    ivec4: 'gl.uniform4i(location, v[0], v[1], v[2], v[3])',

    bool: 'gl.uniform1i(location, v)',
    bvec2: 'gl.uniform2i(location, v[0], v[1])',
    bvec3: 'gl.uniform3i(location, v[0], v[1], v[2])',
    bvec4: 'gl.uniform4i(location, v[0], v[1], v[2], v[3])',

    mat2: 'gl.uniformMatrix2fv(location, false, v)',
    mat3: 'gl.uniformMatrix3fv(location, false, v)',
    mat4: 'gl.uniformMatrix4fv(location, false, v)',

    sampler2D: 'gl.uniform1i(location, v)',
    samplerCube: 'gl.uniform1i(location, v)',
    sampler2DArray: 'gl.uniform1i(location, v)'
};

var GLSL_TO_ARRAY_SETTERS = {

    float: 'gl.uniform1fv(location, v)',

    vec2: 'gl.uniform2fv(location, v)',
    vec3: 'gl.uniform3fv(location, v)',
    vec4: 'gl.uniform4fv(location, v)',

    mat4: 'gl.uniformMatrix4fv(location, false, v)',
    mat3: 'gl.uniformMatrix3fv(location, false, v)',
    mat2: 'gl.uniformMatrix2fv(location, false, v)',

    int: 'gl.uniform1iv(location, v)',
    ivec2: 'gl.uniform2iv(location, v)',
    ivec3: 'gl.uniform3iv(location, v)',
    ivec4: 'gl.uniform4iv(location, v)',

    bool: 'gl.uniform1iv(location, v)',
    bvec2: 'gl.uniform2iv(location, v)',
    bvec3: 'gl.uniform3iv(location, v)',
    bvec4: 'gl.uniform4iv(location, v)',

    sampler2D: 'gl.uniform1iv(location, v)',
    samplerCube: 'gl.uniform1iv(location, v)',
    sampler2DArray: 'gl.uniform1iv(location, v)'
};

function generateUniformsSync(group, uniformData) {
    var textureCount = 0;
    var func = 'var v = null;\n    var cv = null\n    var gl = renderer.gl';

    for (var i in group.uniforms) {
        var data = uniformData[i];
        // console.log('generating upload...', group)

        if (!data) {
            if (group.uniforms[i].group) {
                func += '\n                    renderer.shader.syncUniformGroup(uv.' + i + ');\n                ';
            }

            continue;
        }

        // TODO && uniformData[i].value !== 0 <-- do we still need this?
        if (data.type === 'float' && data.size === 1) {
            func += '\n            if(uv.' + i + ' !== ud.' + i + '.value)\n            {\n                ud.' + i + '.value = uv.' + i + '\n                gl.uniform1f(ud.' + i + '.location, uv.' + i + ')\n            }\n';
        }
        /* eslint-disable max-len */
        else if ((data.type === 'sampler2D' || data.type === 'samplerCube' || data.type === 'sampler2DArray') && data.size === 1 && !data.isArray)
                /* eslint-disable max-len */
                {
                    func += '\n            renderer.texture.bind(uv.' + i + ', ' + textureCount + ');\n\n            if(ud.' + i + '.value !== ' + textureCount + ')\n            {\n                ud.' + i + '.value = ' + textureCount + ';\n                gl.uniform1i(ud.' + i + '.location, ' + textureCount + ');\n; // eslint-disable-line max-len\n            }\n';

                    textureCount++;
                } else if (data.type === 'mat3' && data.size === 1) {
                if (group.uniforms[i].a !== undefined) {
                    // TODO and some smart caching dirty ids here!
                    func += '\n                gl.uniformMatrix3fv(ud.' + i + '.location, false, uv.' + i + '.toArray(true));\n                \n';
                } else {
                    func += '\n                gl.uniformMatrix3fv(ud.' + i + '.location, false, uv.' + i + ');\n                \n';
                }
            } else if (data.type === 'vec2' && data.size === 1) {
                // TODO - do we need both here?
                // maybe we can get away with only using points?
                if (group.uniforms[i].x !== undefined) {
                    func += '\n                cv = ud.' + i + '.value;\n                v = uv.' + i + ';\n\n                if(cv[0] !== v.x || cv[1] !== v.y)\n                {\n                    cv[0] = v.x;\n                    cv[1] = v.y;\n                    gl.uniform2f(ud.' + i + '.location, v.x, v.y);\n                }\n';
                } else {
                    func += '\n                cv = ud.' + i + '.value;\n                v = uv.' + i + ';\n\n                if(cv[0] !== v[0] || cv[1] !== v[1])\n                {\n                    cv[0] = v[0];\n                    cv[1] = v[1];\n                    gl.uniform2f(ud.' + i + '.location, v[0], v[1]);\n                }\n                \n';
                }
            } else {
                var templateType = data.size === 1 ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS;

                var template = templateType[data.type].replace('location', 'ud.' + i + '.location');

                func += '\n            cv = ud.' + i + '.value;\n            v = uv.' + i + ';\n            ' + template + ';\n';
            }
    }

    // console.log(' --------------- ')
    // console.log(func);

    return new Function('ud', 'uv', 'renderer', func); // eslint-disable-line no-new-func
}
//# sourceMappingURL=generateUniformsSync.js.map