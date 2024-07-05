/// <reference types="@webgpu/types" />

declare module '*.wgsl'
{
    const shader: 'string';

    export default shader;
}

declare module '*.vert'
{
    const shader: 'string';

    export default shader;
}

declare module '*.frag'
{
    const shader: 'string';

    export default shader;
}
