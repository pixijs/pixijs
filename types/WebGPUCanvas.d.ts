/**
 * -----------------------------------------------------------------
 * TypeScript 6 declares the WebGPU types in its own `lib.dom`, but it
 * does not add the `getContext('webgpu')` overload to HTMLCanvasElement.
 *
 * That overload is what `@webgpu/types` supplies on TypeScript 5, and
 * without it HTMLCanvasElement no longer satisfies `ICanvas`. This file
 * restores just that overload, so it is shipped to consumers on
 * TypeScript 6 in place of the `@webgpu/types` reference.
 * -----------------------------------------------------------------
 */

interface HTMLCanvasElement
{
    getContext(contextId: 'webgpu'): GPUCanvasContext | null;
}
