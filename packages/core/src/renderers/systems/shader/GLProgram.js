/**
 * Helper class to create a webGL Program
 *
 * @class
 * @private
 */
export default class GLProgram
{
    constructor(program, uniformData)
    {
        /**
         * The shader program
         *
         * @member {WebGLProgram}
         */
        this.program = program;

        /**
         * holds the uniform data which contains uniform locations
         * and current uniform values used for caching and preventing undeed GPU commands
         * @type {Object}
         */
        this.uniformData = uniformData;

        /**
         * uniformGroups holds the various upload functions for the shader. Each uniform group
         * and program have a unique upload function generated.
         * @type {Object}
         */
        this.uniformGroups = {};
    }

    /**
     * Destroys this program
     * TODO
     */
    destroy()
    {
        this.uniformData = null;
        this.uniformGroups = null;
        this.program = null;
    }
}
