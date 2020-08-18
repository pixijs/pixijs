import type { Dict } from '@pixi/utils';

export class IGLUniformData
{
    location: WebGLUniformLocation;
    value: number | boolean | Float32Array | Int32Array | Uint32Array | boolean[];
}

/**
 * Helper class to create a WebGL Program
 *
 * @class
 * @memberof PIXI
 */
export class GLProgram
{
    public program: WebGLProgram;
    public uniformData: Dict<any>;
    public uniformGroups: Dict<any>;
    /**
     * Makes a new Pixi program
     *
     * @param {WebGLProgram} program - webgl program
     * @param {Object} uniformData - uniforms
     */
    constructor(program: WebGLProgram, uniformData: {[key: string]: IGLUniformData})
    {
        /**
         * The shader program
         *
         * @member {WebGLProgram}
         */
        this.program = program;

        /**
         * holds the uniform data which contains uniform locations
         * and current uniform values used for caching and preventing unneeded GPU commands
         * @member {Object}
         */
        this.uniformData = uniformData;

        /**
         * uniformGroups holds the various upload functions for the shader. Each uniform group
         * and program have a unique upload function generated.
         * @member {Object}
         */
        this.uniformGroups = {};
    }

    /**
     * Destroys this program
     */
    destroy(): void
    {
        this.uniformData = null;
        this.uniformGroups = null;
        this.program = null;
    }
}
