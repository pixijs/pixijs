/** the vertex source code, an obj */
export type Vertex = {
    /** stick uniforms and functions in here all headers will be compiled at the top of the shader */
    header?: string;
    /** code will be added at the start of the shader */
    start?: string;
    /** code will be run here before lighting happens */
    main?: string;
    /** code here will to modify anything before it is passed to the fragment shader */
    end?: string;
};

export type Fragment = {
    /** stick uniforms and functions in here all headers will be compiled at the top of the shader */
    header?: string;
    /** code will be added at the start of the shader */
    start?: string;
    /** code will be run here before lighting happens */
    main?: string;
    /** code here will to modify anything before it is passed to the fragment shader */
    end?: string;
};

/**
 * HighShaderBit is a part of a shader.
 * it is used to compile HighShaders.
 *
 * Internally shaders are made up of many of these.
 * You can even write your own and compile them in.
 */
export interface HighShaderBit
{
    /** used to make the shader easier to understand! */
    name?: string;

    /** the snippets of vertex code */
    vertex?: Vertex;

    /** the snippets of fragment code */
    fragment?: Fragment;
}

/** source code to compile a shader. this can be directly used by pixi and should be good to go! */
export interface HighShaderSource
{
    fragment: string;
    vertex: string;
}
