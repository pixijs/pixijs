import type { Dict } from '../../../../../utils/types';
import type { VertexFormat } from '../../../shared/geometry/const';

let GL_TABLE: Dict<string> = null;

const GL_TO_GLSL_TYPES: Dict<string> = {
    FLOAT:       'float',
    FLOAT_VEC2:  'vec2',
    FLOAT_VEC3:  'vec3',
    FLOAT_VEC4:  'vec4',

    INT:         'int',
    INT_VEC2:    'ivec2',
    INT_VEC3:    'ivec3',
    INT_VEC4:    'ivec4',

    UNSIGNED_INT:         'uint',
    UNSIGNED_INT_VEC2:    'uvec2',
    UNSIGNED_INT_VEC3:    'uvec3',
    UNSIGNED_INT_VEC4:    'uvec4',

    BOOL:        'bool',
    BOOL_VEC2:   'bvec2',
    BOOL_VEC3:   'bvec3',
    BOOL_VEC4:   'bvec4',

    FLOAT_MAT2:  'mat2',
    FLOAT_MAT3:  'mat3',
    FLOAT_MAT4:  'mat4',

    SAMPLER_2D:              'sampler2D',
    INT_SAMPLER_2D:          'sampler2D',
    UNSIGNED_INT_SAMPLER_2D: 'sampler2D',
    SAMPLER_CUBE:              'samplerCube',
    INT_SAMPLER_CUBE:          'samplerCube',
    UNSIGNED_INT_SAMPLER_CUBE: 'samplerCube',
    SAMPLER_2D_ARRAY:              'sampler2DArray',
    INT_SAMPLER_2D_ARRAY:          'sampler2DArray',
    UNSIGNED_INT_SAMPLER_2D_ARRAY: 'sampler2DArray',
};

const GLSL_TO_VERTEX_TYPES: Record<string, VertexFormat> = {

    float: 'float32',
    vec2: 'float32x2',
    vec3: 'float32x3',
    vec4: 'float32x4',

    int: 'sint32',
    ivec2: 'sint32x2',
    ivec3: 'sint32x3',
    ivec4: 'sint32x4',

    uint: 'uint32',
    uvec2: 'uint32x2',
    uvec3: 'uint32x3',
    uvec4: 'uint32x4',

    bool: 'uint32',
    bvec2: 'uint32x2',
    bvec3: 'uint32x3',
    bvec4: 'uint32x4',
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

export function mapGlToVertexFormat(gl: any, type: number): VertexFormat
{
    const typeValue = mapType(gl, type);

    return GLSL_TO_VERTEX_TYPES[typeValue] || 'float32';
}
