let GL_TABLE: {[x: string]: string} = null;

const GL_TO_GLSL_TYPES: {[x: string]: string} = {
    FLOAT:       'float',
    FLOAT_VEC2:  'vec2',
    FLOAT_VEC3:  'vec3',
    FLOAT_VEC4:  'vec4',

    INT:         'int',
    INT_VEC2:    'ivec2',
    INT_VEC3:    'ivec3',
    INT_VEC4:    'ivec4',

    BOOL:        'bool',
    BOOL_VEC2:   'bvec2',
    BOOL_VEC3:   'bvec3',
    BOOL_VEC4:   'bvec4',

    FLOAT_MAT2:  'mat2',
    FLOAT_MAT3:  'mat3',
    FLOAT_MAT4:  'mat4',

    SAMPLER_2D:  'sampler2D',
    SAMPLER_CUBE:  'samplerCube',
    SAMPLER_2D_ARRAY:  'sampler2DArray',
};

export function mapType(gl: any, type: number): string
{
    if (!GL_TABLE)
    {
        const typeNames = Object.keys(GL_TO_GLSL_TYPES);

        GL_TABLE = {};

        for (let i = 0; i < typeNames.length; ++i)
        {
            const tn = typeNames[i];

            GL_TABLE[gl[tn]] = GL_TO_GLSL_TYPES[tn];
        }
    }

    return GL_TABLE[type];
}
