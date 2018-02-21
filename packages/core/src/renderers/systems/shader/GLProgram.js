/**
 * Helper class to create a webGL Shader
 *
 * @class
 * @memberof PIXI.glCore
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

        this.uniformData = uniformData;
        this.uniformGroups = {};
    }

    /**
     * Destroys this shader
     * TODO
     */
    destroy()
    {
        this.uniformData = null;
        this.uniformGroups = null;
        this.program = null;
    }
}
