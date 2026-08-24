/**
 * -----------------------------------------------------------------
 * TypeScript 6 declares the WebGPU types in its own `lib.dom`, but it does not
 * add the `getContext('webgpu')` overload to either canvas element: both still
 * end on `getContext(contextId: string): RenderingContext | null`.
 *
 * That overload is what `@webgpu/types` supplies on TypeScript 5, and without
 * it neither HTMLCanvasElement nor OffscreenCanvas satisfies `ICanvas`. This
 * file restores just those two overloads. It is used by this repo, and shipped
 * to consumers on TypeScript 6 in place of the `@webgpu/types` reference.
 * -----------------------------------------------------------------
 */

declare global
{
    interface HTMLCanvasElement
    {
        getContext(contextId: 'webgpu'): GPUCanvasContext | null;
    }

    interface OffscreenCanvas
    {
        getContext(contextId: 'webgpu'): GPUCanvasContext | null;
    }
}

export {};
