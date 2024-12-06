// TODO add more types as required
export const UNIFORM_TYPES_VALUES = [
    'f32',
    'i32',
    'vec2<f32>',
    'vec3<f32>',
    'vec4<f32>',
    'mat2x2<f32>',
    'mat3x3<f32>',
    'mat4x4<f32>',
    'mat3x2<f32>',
    'mat4x2<f32>',
    'mat2x3<f32>',
    'mat4x3<f32>',
    'mat2x4<f32>',
    'mat3x4<f32>',
    'vec2<i32>',
    'vec3<i32>',
    'vec4<i32>',
] as const;

/** useful for checking if a type is supported - a map of supported types with a true value. */
export const UNIFORM_TYPES_MAP = UNIFORM_TYPES_VALUES.reduce((acc, type) =>
{
    acc[type] = true;

    return acc;
}, {} as Record<UNIFORM_TYPES, boolean>);

export type UNIFORM_TYPES_SINGLE = typeof UNIFORM_TYPES_VALUES[number];

type OPTIONAL_SPACE = ' ' | '';

export type UNIFORM_TYPES_ARRAY = `array<${UNIFORM_TYPES_SINGLE},${OPTIONAL_SPACE}${number}>`;

export type UNIFORM_TYPES = UNIFORM_TYPES_SINGLE | UNIFORM_TYPES_ARRAY;

export interface UniformData
{
    /** the value of the uniform, this could be any object - a parser will figure out how to write it to the buffer */
    value: unknown;
    type: UNIFORM_TYPES;
    /** the size of the variable (eg 2 for vec2, 3 for vec3, 4 for vec4) */
    size?: number;
    name?: string;
}

export interface UboElement
{
    data: UniformData;
    offset: number;
    size: number;
}

export interface UboLayout
{
    uboElements: UboElement[];
    /** float32 size // TODO change to bytes */
    size: number;
}

export type UniformsSyncCallback = (...args: any[]) => void;
