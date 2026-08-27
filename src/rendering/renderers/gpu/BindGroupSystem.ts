import { ExtensionType } from '../../../extensions/Extensions';

import type { Buffer } from '../shared/buffer/Buffer';
import type { BufferResource } from '../shared/buffer/BufferResource';
import type { UniformGroup } from '../shared/shader/UniformGroup';
import type { System } from '../shared/system/System';
import type { TextureSource } from '../shared/texture/sources/TextureSource';
import type { TextureStyle } from '../shared/texture/TextureStyle';
import type { TextureView } from '../shared/texture/TextureView';
import type { GPU } from './GpuDeviceSystem';
import type { BindGroup } from './shader/BindGroup';
import type { BindResource } from './shader/BindResource';
import type { GpuProgram } from './shader/GpuProgram';
import type { WebGPURenderer } from './WebGPURenderer';

interface BindGroupCacheEntry
{
    gpuBindGroup: GPUBindGroup;
    /** the pixi Buffers behind buffer-backed resources, for cache revalidation */
    srcBuffers: Buffer[] | null;
    /** the GPUBuffer each srcBuffer resolved to when this bind group was created */
    gpuBuffers: GPUBuffer[] | null;
}

/**
 * This manages the WebGPU bind groups. this is how data is bound to a shader when rendering
 * @category rendering
 * @advanced
 */
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

    private _hash: Record<string, BindGroupCacheEntry> = Object.create(null);
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
        // The cache key must include both the resources AND the program layout,
        // because a GPUBindGroup must exactly match its GPUBindGroupLayout.
        // Two programs with different layouts cannot share a GPUBindGroup,
        // even if they use the same resources.
        // Bit shift combines layoutKey and groupIndex into single number (groupIndex < 16)
        const key = `${bindGroup._key}:${(program._layoutKey << 4) | groupIndex}`;

        let entry = this._hash[key];

        // the key tracks resource ids, but not the identity of the GPUBuffer
        // behind a buffer-backed resource - that can change (buffer resize, or
        // an unloaded buffer being re-created), leaving a cached GPUBindGroup
        // pointing at the old GPUBuffer. Revalidate before using the cache.
        // (This also touches the buffers, so actively bound buffers are never
        // treated as unused by the GC.)
        if (entry && !this._validate(entry)) entry = null;

        entry = entry || this._createBindGroup(key, bindGroup, program, groupIndex);

        return entry.gpuBindGroup;
    }

    private _validate(entry: BindGroupCacheEntry): boolean
    {
        const { srcBuffers, gpuBuffers } = entry;

        if (!srcBuffers) return true;

        const bufferSystem = this._renderer.buffer;

        for (let i = 0; i < srcBuffers.length; i++)
        {
            if (bufferSystem.getGPUBuffer(srcBuffers[i]) !== gpuBuffers[i]) return false;
        }

        return true;
    }

    private _createBindGroup(key: string, group: BindGroup, program: GpuProgram, groupIndex: number): BindGroupCacheEntry
    {
        const device = this._gpu.device;
        const groupLayout = program.layout[groupIndex];
        const entries: GPUBindGroupEntry[] = [];
        const renderer = this._renderer;
        let srcBuffers: Buffer[] = null;
        let gpuBuffers: GPUBuffer[] = null;
        const trackBuffer = (buffer: Buffer, gpuBuffer: GPUBuffer) =>
        {
            (srcBuffers ??= []).push(buffer);
            (gpuBuffers ??= []).push(gpuBuffer);
        };

        for (const j in groupLayout)
        {
            // resources may be keyed by resource name or by binding index — try the name first
            const resource: BindResource = group.resources[j] ?? group.resources[groupLayout[j]];

            // a destroyed resource leaves a null slot (see BindGroup.onResourceChange) or may
            // have been handed in already destroyed — either way this group cannot render
            if (!resource || resource.destroyed)
            {
                throw new Error(`[BindGroup] the resource bound as '${j}' was destroyed while a shader still uses it. `
                    + 'Remove it from the shader before destroying it.');
            }

            let gpuResource: GPUSampler | GPUTextureView | GPUExternalTexture | GPUBufferBinding;
            // TODO make this dynamic..

            if (resource._resourceType === 'uniformGroup')
            {
                const uniformGroup = resource as UniformGroup;

                renderer.ubo.updateUniformGroup(uniformGroup as UniformGroup);

                const buffer = uniformGroup.buffer;
                const gpuBuffer = renderer.buffer.getGPUBuffer(buffer);

                trackBuffer(buffer, gpuBuffer);
                gpuResource = {
                    buffer: gpuBuffer,
                    offset: 0,
                    size: buffer.descriptor.size,
                };
            }
            else if (resource._resourceType === 'buffer')
            {
                const buffer = resource as Buffer;
                const gpuBuffer = renderer.buffer.getGPUBuffer(buffer);

                trackBuffer(buffer, gpuBuffer);
                gpuResource = {
                    buffer: gpuBuffer,
                    offset: 0,
                    size: buffer.descriptor.size,
                };
            }
            else if (resource._resourceType === 'bufferResource')
            {
                const bufferResource = resource as BufferResource;
                const gpuBuffer = renderer.buffer.getGPUBuffer(bufferResource.buffer);

                trackBuffer(bufferResource.buffer, gpuBuffer);
                gpuResource = {
                    buffer: gpuBuffer,
                    offset: bufferResource.offset,
                    size: bufferResource.size ?? bufferResource.buffer.descriptor.size,
                };
            }
            else if (resource._resourceType === 'textureSampler')
            {
                const sampler = resource as TextureStyle;

                gpuResource = renderer.texture.getGpuSampler(sampler);
            }
            else if (resource._resourceType === 'textureSource')
            {
                const texture = resource as TextureSource;

                gpuResource = renderer.texture.getTextureView(texture);
            }
            else if (resource._resourceType === 'textureView')
            {
                const textureView = resource as TextureView;

                gpuResource = renderer.texture.getTextureView(textureView.source, textureView.viewDescriptor);
            }

            entries.push({
                binding: groupLayout[j],
                resource: gpuResource,
            });
        }

        const layout = renderer.shader.getProgramData(program).bindGroups[groupIndex];

        const gpuBindGroup = device.createBindGroup({
            layout,
            entries,
        });

        const entry: BindGroupCacheEntry = { gpuBindGroup, srcBuffers, gpuBuffers };

        this._hash[key] = entry;

        return entry;
    }

    public destroy(): void
    {
        this._hash = null;
        (this._renderer as null) = null;
    }
}
