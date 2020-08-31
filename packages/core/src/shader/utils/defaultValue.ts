function booleanArray(size: number): Array<boolean>
{
    const array = new Array(size);

    for (let i = 0; i < array.length; i++)
    {
        array[i] = false;
    }

    return array;
}

/**
 * @method defaultValue
 * @memberof PIXI.glCore.shader
 * @param {string} type - Type of value
 * @param {number} size
 * @private
 */
export function defaultValue(type: string, size: number): number|Float32Array|Int32Array|Uint32Array|boolean|boolean[]
{
    switch (type)
    {
        case 'float':
            return 0;

        case 'vec2':
            return new Float32Array(2 * size);

        case 'vec3':
            return new Float32Array(3 * size);

        case 'vec4':
            return new Float32Array(4 * size);

        case 'int':
        case 'uint':
        case 'sampler2D':
        case 'sampler2DArray':
            return 0;

        case 'ivec2':
            return new Int32Array(2 * size);

        case 'ivec3':
            return new Int32Array(3 * size);

        case 'ivec4':
            return new Int32Array(4 * size);

        case 'uvec2':
            return new Uint32Array(2 * size);

        case 'uvec3':
            return new Uint32Array(3 * size);

        case 'uvec4':
            return new Uint32Array(4 * size);

        case 'bool':
            return false;

        case 'bvec2':

            return booleanArray(2 * size);

        case 'bvec3':
            return booleanArray(3 * size);

        case 'bvec4':
            return booleanArray(4 * size);

        case 'mat2':
            return new Float32Array([1, 0,
                0, 1]);

        case 'mat3':
            return new Float32Array([1, 0, 0,
                0, 1, 0,
                0, 0, 1]);

        case 'mat4':
            return new Float32Array([1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1]);
    }

    return null;
}
