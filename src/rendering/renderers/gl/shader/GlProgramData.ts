/**
 * @private
 */
export class IGLUniformData
{
    public location: WebGLUniformLocation;
    public value: number | boolean | Float32Array | Int32Array | Uint32Array | boolean[];
}

/**
 * Helper class to create a WebGL Program
 * @private
 */
export class GlProgramData
{
    /** The shader program. */
    public program: WebGLProgram;

    /**
     * Holds the uniform data which contains uniform locations
     * and current uniform values used for caching and preventing unneeded GPU commands.
     */
    public uniformData: Record<string, any>;

    /**
     * UniformGroups holds the various upload functions for the shader. Each uniform group
     * and program have a unique upload function generated.
     */
    public uniformGroups: Record<string, any>;

    /** A hash that stores where UBOs are bound to on the program. */
    public uniformBlockBindings: Record<string, any>;

    /** A hash for lazily-generated uniform uploading functions. */
    public uniformSync: Record<string, any>;

    /**
     * A place where dirty ticks are stored for groups
     * If a tick here does not match with the Higher level Programs tick, it means
     * we should re upload the data.
     */
    public uniformDirtyGroups: Record<string, any>;

    /**
     * Makes a new Pixi program.
     * @param program - webgl program
     * @param uniformData - uniforms
     */
    constructor(program: WebGLProgram, uniformData: {[key: string]: IGLUniformData})
    {
        this.program = program;
        this.uniformData = uniformData;
        this.uniformGroups = {};
        this.uniformDirtyGroups = {};
        this.uniformBlockBindings = {};
    }

    /** Destroys this program. */
    public destroy(): void
    {
        this.uniformData = null;
        this.uniformGroups = null;
        this.uniformDirtyGroups = null;
        this.uniformBlockBindings = null;
        this.program = null;
    }
}
