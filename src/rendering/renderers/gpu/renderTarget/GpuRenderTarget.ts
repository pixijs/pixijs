import type { TextureSource } from '../../shared/texture/sources/TextureSource';

export class GpuRenderTarget
{
    public contexts: GPUCanvasContext[] = [];
    public msaaTextures: TextureSource[] = [];
    public msaa: boolean;
    public msaaSamples = 1;
    public width: number;
    public height: number;
    public descriptor: GPURenderPassDescriptor;
}
