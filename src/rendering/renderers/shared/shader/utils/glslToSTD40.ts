export const GLSL_TO_STD40_SIZE: Record<string, number> = {
    float:  4,
    vec2:   8,
    vec3:   12,
    vec4:   16,

    int:      4,
    ivec2:    8,
    ivec3:    12,
    ivec4:    16,

    uint:     4,
    uvec2:    8,
    uvec3:    12,
    uvec4:    16,

    bool:     4,
    bvec2:    8,
    bvec3:    12,
    bvec4:    16,

    mat2:     16 * 2,
    mat3:     16 * 3,
    mat4:     16 * 4,
};
