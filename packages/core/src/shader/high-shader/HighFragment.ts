/**
 * the vertex source code, an obj
 */
export type Vertex = {
    /**
     * stick uniforms and functions in here
     * all headers will be compiled at the top of the shader
     */
    header?: string;
    /**
     * code will be added at the start of the shader
     */
    start?: string;
    /**
     * code will be run here before lighting happens
     */
    main?: string;
    /**
     * code here will to modify anything before it is passed to the fragment shader
     */
    end?: string;
};

export type Fragment = {
    /**
     * stick uniforms and functions in here
     * all headers will be compiled at the top of the shader
     */
    header?: string;
    /**
     * code will be run here before the material properties have been calculated
     */
    main?: string;
    /**
     * code here will to modify anything before a fragment is passed to be rendered
     */
    end?: string;
};

/**
 * HighFragment is a part of a shader.
 * it is used to compile HighShaders.
 *
 * Internally Odie materials are made up of many of these.
 * You can even write your own and compile them in.
 */
export interface HighFragment
{
    /**
     * used to make the shader easier to understand!
     */
    name?: string;

    /**
     * the snippets of vertex code
     */
    vertex?: Vertex;

    vertex2?: Vertex;

    /**
     * the snippets of fragment code
     */
    fragment?: Fragment;

    fragment2?: Fragment;

    /**
     * used internally to cache shaders
     */
    cache?: number;
}

/**
 * source code to compile a shader.
 * this can be directly used by pixi and should be good to go!
 */
export interface ShaderSource
{
    name?: string;
    fragment: string;
    vertex: string;
}
