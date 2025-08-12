import type { TextureSource } from '../../shared/texture/sources/TextureSource';

const typeSymbol = Symbol.for('pixijs.GpuRenderTarget');

/**
 * A class which holds the canvas contexts and textures for a render target.
 * @category rendering
 * @ignore
 */
export class GpuRenderTarget
{
    /**
     * Type symbol used to identify instances of GpuRenderTarget.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GpuRenderTarget.
     * @param obj - The object to check.
     * @returns True if the object is a GpuRenderTarget, false otherwise.
     */
    public static isGpuRenderTarget(obj: any): obj is GpuRenderTarget
    {
        return !!obj && !!obj[typeSymbol];
    }

    public contexts: GPUCanvasContext[] = [];
    public msaaTextures: TextureSource[] = [];
    public msaa: boolean;
    public msaaSamples = 1;
    public width: number;
    public height: number;
    public descriptor: GPURenderPassDescriptor;
}
