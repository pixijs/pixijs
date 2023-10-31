import { ExtensionType } from '../../../extensions/Extensions';

import type { Buffer } from '../shared/buffer/Buffer';
import type { BufferResource } from '../shared/buffer/BufferResource';
import type { UniformGroup } from '../shared/shader/UniformGroup';
import type { System } from '../shared/system/System';
import type { TextureSource } from '../shared/texture/sources/TextureSource';
import type { TextureStyle } from '../shared/texture/TextureStyle';
import type { GPU } from './GpuDeviceSystem';
import type { BindGroup } from './shader/BindGroup';
import type { BindResource } from './shader/BindResource';
import type { GpuProgram } from './shader/GpuProgram';
import type { WebGPURenderer } from './WebGPURenderer';

export class BindGroupSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'bindGroup',
    } as const;

    private readonly _renderer: WebGPURenderer;

    private _hash: Record<string, GPUBindGroup> = Object.create(null);
    private _gpu: GPU;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
    }

    public getBindGroup(bindGroup: BindGroup, program: GpuProgram, groupIndex: number): GPUBindGroup
    {
        bindGroup._updateKey();

        const gpuBindGroup = this._hash[bindGroup._key] || this._createBindGroup(bindGroup, program, groupIndex);

        return gpuBindGroup;
    }

    private _createBindGroup(group: BindGroup, program: GpuProgram, groupIndex: number): GPUBindGroup
    {
        const device = this._gpu.device;
        const groupLayout = program.layout[groupIndex];
        const entries: GPUBindGroupEntry[] = [];

        for (const j in groupLayout)
        {
            const resource: BindResource = group.resources[j] ?? group.resources[groupLayout[j]];
            let gpuResource: GPUSampler | GPUTextureView | GPUExternalTexture | GPUBufferBinding;
            // TODO make this dynamic..

            if (resource._resourceType === 'uniformGroup')
            {
                const uniformGroup = resource as UniformGroup;

                this._renderer.uniformBuffer.updateUniformGroup(uniformGroup as UniformGroup);

                const buffer = uniformGroup.buffer;

                gpuResource = {
                    buffer: this._renderer.buffer.getGPUBuffer(buffer),
                    offset: 0,
                    size: buffer.descriptor.size,
                };
            }
            else if (resource._resourceType === 'buffer')
            {
                const buffer = resource as Buffer;

                gpuResource = {
                    buffer: this._renderer.buffer.getGPUBuffer(buffer),
                    offset: 0,
                    size: buffer.descriptor.size,
                };
            }
            else if (resource._resourceType === 'bufferResource')
            {
                const bufferResource = resource as BufferResource;

                gpuResource = {
                    buffer: this._renderer.buffer.getGPUBuffer(bufferResource.buffer),
                    offset: bufferResource.offset,
                    size: bufferResource.size,
                };
            }
            else if (resource._resourceType === 'textureSampler')
            {
                const sampler = resource as TextureStyle;

                gpuResource = this._renderer.texture.getGpuSampler(sampler);
            }
            else if (resource._resourceType === 'textureSource')
            {
                const texture = resource as TextureSource;

                gpuResource = this._renderer.texture.getGpuSource(texture).createView({

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

        this._hash[group._key] = gpuBindGroup;

        return gpuBindGroup;
    }

    public destroy(): void
    {
        for (const key of Object.keys(this._hash))
        {
            this._hash[key] = null;
        }

        this._hash = null;

        (this._renderer as null) = null;
    }
}
