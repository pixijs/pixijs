/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Parsers, each one of these will take a look at the type of shader property and uniform.
// if they pass the test function then the code function is called that returns a the shader upload code for that uniform.
// Shader upload code is automagically generated with these parsers.
// If no parser is valid then the default upload functions are used.
// exposing Parsers means that custom upload logic can be added to pixi's shaders.
// A good example would be a pixi rectangle can be directly set on a uniform.
// If the shader sees it it knows how to upload the rectangle structure as a vec4
// format is as follows:
//
// {
//     test: (data, uniform) => {} <--- test is this code should be used for this uniform
//     code: (name, uniform) => {} <--- returns the string of the piece of code that uploads the uniform
//     codeUbo: (name, uniform) => {} <--- returns the string of the piece of code that uploads the
//                                         uniform to a uniform buffer
// }

export interface IUniformParser
{
    test(data: unknown, uniform: any): boolean;
    code(name: string, uniform: any): string;
    codeUbo?(name: string, uniform: any): string;
}

export const uniformParsers: IUniformParser[] = [

    // a float cache layer
    {
        test: (data: any): boolean =>
            data.type === 'float' && data.size === 1 && !data.isArray,
        code: (name: string): string =>
            `
            if(uv["${name}"] !== ud["${name}"].value)
            {
                ud["${name}"].value = uv["${name}"]
                gl.uniform1f(ud["${name}"].location, uv["${name}"])
            }
            `,
    },
    // handling samplers
    {
        test: (data: any, uniform: any): boolean =>
            // eslint-disable-next-line max-len,no-eq-null,eqeqeq
            (data.type === 'sampler2D' || data.type === 'samplerCube' || data.type === 'sampler2DArray') && data.size === 1 && !data.isArray && (uniform == null || uniform.castToBaseTexture !== undefined),
        code: (name: string): string => `t = syncData.textureCount++;

            renderer.texture.bind(uv["${name}"], t);

            if(ud["${name}"].value !== t)
            {
                ud["${name}"].value = t;
                gl.uniform1i(ud["${name}"].location, t);\n; // eslint-disable-line max-len
            }`,
    },
    // uploading pixi matrix object to mat3
    {
        test: (data: any, uniform: any): boolean =>
            data.type === 'mat3' && data.size === 1 && !data.isArray && uniform.a !== undefined,
        code: (name: string): string =>

            // TODO and some smart caching dirty ids here!
            `
            gl.uniformMatrix3fv(ud["${name}"].location, false, uv["${name}"].toArray(true));
            `,
        codeUbo: (name: string): string =>
            `
                var ${name}_matrix = uv.${name}.toArray(true);

                data[offset] = ${name}_matrix[0];
                data[offset+1] = ${name}_matrix[1];
                data[offset+2] = ${name}_matrix[2];
        
                data[offset + 4] = ${name}_matrix[3];
                data[offset + 5] = ${name}_matrix[4];
                data[offset + 6] = ${name}_matrix[5];
        
                data[offset + 8] = ${name}_matrix[6];
                data[offset + 9] = ${name}_matrix[7];
                data[offset + 10] = ${name}_matrix[8];
            `
        ,

    },
    // uploading a pixi point as a vec2 with caching layer
    {
        test: (data: any, uniform: any): boolean =>
            data.type === 'vec2' && data.size === 1 && !data.isArray && uniform.x !== undefined,
        code: (name: string): string =>
            `
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v.x || cv[1] !== v.y)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    gl.uniform2f(ud["${name}"].location, v.x, v.y);
                }`,
        codeUbo: (name: string): string =>
            `
                v = uv.${name};

                data[offset] = v.x;
                data[offset+1] = v.y;
            `
    },
    // caching layer for a vec2
    {
        test: (data: any): boolean =>
            data.type === 'vec2' && data.size === 1 && !data.isArray,
        code: (name: string): string =>
            `
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v[0] || cv[1] !== v[1])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    gl.uniform2f(ud["${name}"].location, v[0], v[1]);
                }
            `,
    },
    // upload a pixi rectangle as a vec4 with caching layer
    {
        test: (data: any, uniform: any): boolean =>
            data.type === 'vec4' && data.size === 1 && !data.isArray && uniform.width !== undefined,

        code: (name: string): string =>
            `
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    cv[2] = v.width;
                    cv[3] = v.height;
                    gl.uniform4f(ud["${name}"].location, v.x, v.y, v.width, v.height)
                }`,
        codeUbo: (name: string): string =>
            `
                    v = uv.${name};

                    data[offset] = v.x;
                    data[offset+1] = v.y;
                    data[offset+2] = v.width;
                    data[offset+3] = v.height;
                `
    },
    // a caching layer for vec4 uploading
    {
        test: (data: any): boolean =>
            data.type === 'vec4' && data.size === 1 && !data.isArray,
        code: (name: string): string =>
            `
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    cv[2] = v[2];
                    cv[3] = v[3];

                    gl.uniform4f(ud["${name}"].location, v[0], v[1], v[2], v[3])
                }`,
    },
];

