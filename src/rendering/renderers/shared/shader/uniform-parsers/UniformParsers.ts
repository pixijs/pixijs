export const _uniformParser = {};
// type UniformParser = {
//     test: (data: any, uniform: any) => boolean;
//     uploadUniform: (name: string, _cv: any, ud: any, uv: any, _v: any, _t: any, gl: any, _renderer: any): void =>

// };

// export const customUniformParsers: UniformParser[] = [
//     {
//         test: (data: any): boolean =>
//             data.type === 'float' && data.size === 1 && !data.isArray,
//         uploadUniform: (name: string, _cv: any, ud: any, uv: any, _v: any, _t: any, gl: any, _renderer: any): void =>
//         {
//             if (uv[name] !== ud[name].value)
//             {
//                 ud[name].value = uv[name];
//                 gl.uniform1f(ud[name].location, uv[name]);
//             }
//         },
//         uploadStd140: (name: string, _cv: any, ud: any, uv: any, _v: any, _t: any, gl: any, _renderer: any): void =>
//         {

//         },
//         uploadWgsl: (name: string, _cv: any, ud: any, uv: any, _v: any, _t: any, gl: any, _renderer: any): void =>
//         {

//         }
//     },
// ];
