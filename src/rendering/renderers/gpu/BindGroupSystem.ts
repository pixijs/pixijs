import { ExtensionType } from '../../../extensions/Extensions';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Buffer } from '../shared/buffer/Buffer';
import type { BufferResource } from '../shared/buffer/BufferResource';
import type { UniformGroup } from '../shared/shader/UniformGroup';
import type { ISystem } from '../shared/system/ISystem';
import type { TextureSource } from '../shared/texture/sources/TextureSource';
import type { TextureStyle } from '../shared/texture/TextureStyle';
import type { GPU } from './GpuDeviceSystem';
import type { BindGroup } from './shader/BindGroup';
import type { BindResource } from './shader/BindResource';
import type { GpuProgram } from './shader/GpuProgram';
import type { WebGPURenderer } from './WebGPURenderer';

export class BindGroupSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGPURendererSystem,
        ],
        name: 'bindGroup',
    };

    private readonly renderer: WebGPURenderer;

    private hash: Record<string, GPUBindGroup> = {};
    private gpu: GPU;

    // TODO implement a way to tidy up unused bind groups!
    // private bindGroupCount = 0;

    constructor(renderer: WebGPURenderer)
    {
        this.renderer = renderer;
    }

    protected contextChange(gpu: GPU): void
    {
        this.gpu = gpu;
    }

    getBindGroup(bindGroup: BindGroup, program: GpuProgram, groupIndex: number): GPUBindGroup
    {
        bindGroup.updateKey();

        const gpuBindGroup = this.hash[bindGroup.key] || this.createBindGroup(bindGroup, program, groupIndex);

        // TODO update the usageTick - and destroy unused ones!
        // bindGroup.usageTick

        return gpuBindGroup;
    }

    private createBindGroup(group: BindGroup, program: GpuProgram, groupIndex: number): GPUBindGroup
    {
        // this.bindGroupCount++;

        const device = this.gpu.device;
        const groupLayout = program.layout[groupIndex];
        const entries: GPUBindGroupEntry[] = [];

        for (const j in groupLayout)
        {
            const resource: BindResource = group.resources[j] ?? group.resources[groupLayout[j]];
            let gpuResource: GPUSampler | GPUTextureView | GPUExternalTexture | GPUBufferBinding;
            // TODO make this dynamic..

            if (resource.resourceType === 'uniformGroup')
            {
                const uniformGroup = resource as UniformGroup;

                this.renderer.uniformBuffer.updateUniformGroup(uniformGroup as UniformGroup);

                const buffer = uniformGroup.buffer;

                gpuResource = {
                    buffer: this.renderer.buffer.getGPUBuffer(buffer),
                    offset: 0,
                    size: buffer.descriptor.size,
                };
            }
            else if (resource.resourceType === 'buffer')
            {
                const buffer = resource as Buffer;

                gpuResource = {
                    buffer: this.renderer.buffer.getGPUBuffer(buffer),
                    offset: 0,
                    size: buffer.descriptor.size,
                };
            }
            else if (resource.resourceType === 'bufferResource')
            {
                const bufferResource = resource as BufferResource;

                gpuResource = {
                    buffer: this.renderer.buffer.getGPUBuffer(bufferResource.buffer),
                    offset: bufferResource.offset,
                    size: bufferResource.size,
                };
            }
            else if (resource.resourceType === 'textureSampler')
            {
                const sampler = resource as TextureStyle;

                gpuResource = this.renderer.texture.getGpuSampler(sampler);
            }
            else if (resource.resourceType === 'textureSource')
            {
                const texture = resource as TextureSource;

                gpuResource = this.renderer.texture.getGpuSource(texture).createView({

                });
            }

            entries.push({
                binding: groupLayout[j],
                resource: gpuResource,
            });
        }

        const gpuBindGroup = device.createBindGroup({
            layout: program._gpuLayout.bindGroups[groupIndex],
            entries,
        });

        this.hash[group.key] = gpuBindGroup;

        return gpuBindGroup;
    }

    destroy(): void
    {
        // boom!
    }
}
