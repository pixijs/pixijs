/**
 * -----------------------------------------------------------------
 * The WebGPU flag namespaces - `GPUTextureUsage`, `GPUShaderStage` and friends -
 * are IDL namespaces rather than interfaces, and TypeScript 6's generated
 * `lib.dom` leaves them out entirely (so does TypeScript 7's). `@webgpu/types`
 * declares them, which is where they came from before this repo moved off it.
 *
 * They are values, not types, so they never reach the published declarations.
 * That is why this file stays internal to the repo and is not copied into
 * `lib/`: shipping ambient declarations would collide with `@webgpu/types` for
 * any consumer that still has it installed.
 * -----------------------------------------------------------------
 */

declare const GPUBufferUsage: {
    readonly MAP_READ: GPUFlagsConstant;
    readonly MAP_WRITE: GPUFlagsConstant;
    readonly COPY_SRC: GPUFlagsConstant;
    readonly COPY_DST: GPUFlagsConstant;
    readonly INDEX: GPUFlagsConstant;
    readonly VERTEX: GPUFlagsConstant;
    readonly UNIFORM: GPUFlagsConstant;
    readonly STORAGE: GPUFlagsConstant;
    readonly INDIRECT: GPUFlagsConstant;
    readonly QUERY_RESOLVE: GPUFlagsConstant;
};

declare const GPUColorWrite: {
    readonly RED: GPUFlagsConstant;
    readonly GREEN: GPUFlagsConstant;
    readonly BLUE: GPUFlagsConstant;
    readonly ALPHA: GPUFlagsConstant;
    readonly ALL: GPUFlagsConstant;
};

declare const GPUMapMode: {
    readonly READ: GPUFlagsConstant;
    readonly WRITE: GPUFlagsConstant;
};

declare const GPUShaderStage: {
    readonly VERTEX: GPUFlagsConstant;
    readonly FRAGMENT: GPUFlagsConstant;
    readonly COMPUTE: GPUFlagsConstant;
};

declare const GPUTextureUsage: {
    readonly COPY_SRC: GPUFlagsConstant;
    readonly COPY_DST: GPUFlagsConstant;
    readonly TEXTURE_BINDING: GPUFlagsConstant;
    readonly STORAGE_BINDING: GPUFlagsConstant;
    readonly RENDER_ATTACHMENT: GPUFlagsConstant;
    readonly TRANSIENT_ATTACHMENT: GPUFlagsConstant;
};
