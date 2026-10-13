import { ExtensionType } from '../../../extensions/Extensions';

import type { Buffer } from '../shared/buffer/Buffer';
import type { BufferResource } from '../shared/buffer/BufferResource';
import type { GCable } from '../shared/GCSystem';
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

/**
 * A cached native bind group, shaped so the renderer's GC can sweep it. Cache keys are built from
 * resource ids that change whenever a resource is unloaded, resized or destroyed, so an entry that
 * stops being requested can never be hit again and would otherwise live as long as the device.
 * @internal
 */
class GpuBindGroupEntry implements GCable
{
    public gpuBindGroup: GPUBindGroup;
    public _gcLastUsed: number;
    public readonly autoGarbageCollect = true;
    /** Part of the {@link GCable} contract; a cached bind group owns no per-renderer GPU data. */
    public readonly _gpuData: GCable['_gpuData'] = null;

    constructor(gpuBindGroup: GPUBindGroup, now: number)
    {
        this.gpuBindGroup = gpuBindGroup;
        this._gcLastUsed = now;
    }

    /**
     * Native bind groups have no destroy; dropping the reference is the whole release. Anything
     * still holding the group (a recorded render bundle, a graphics batch) keeps it alive, and the
     * next immediate-mode bind simply recreates the cache entry.
     */
    public unload(): void
    {
        this.gpuBindGroup = null;
    }
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

    private _hash: Record<string, GpuBindGroupEntry> = Object.create(null);
    private _gpu: GPU;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;

        // the sweep nulls idle slots and the periodic clean pass compacts the nulls away; both read
        // the hash off this system by name, so replacing the object in contextChange or nulling it
        // in destroy needs no re-registration
        renderer.gc.addResourceHash(this, '_hash', 'resource');
        renderer.gc.addCollection(this, '_hash', 'hash');
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
        this._hash = Object.create(null);
    }

    public getBindGroup(bindGroup: BindGroup, program: GpuProgram, groupIndex: number): GPUBindGroup
    {
        // The cache key must include both the resources AND the program layout,
        // because a GPUBindGroup must exactly match its GPUBindGroupLayout.
        // Two programs with different layouts cannot share a GPUBindGroup,
        // even if they use the same resources.
        // Bit shift combines layoutKey and groupIndex into single number (groupIndex < 16)
        const key = `${bindGroup._key}:${(program._layoutKey << 4) | groupIndex}`;
        const entry = this._hash[key];

        // a swept slot holds null rather than being deleted, so this covers both kinds of miss
        if (entry)
        {
            entry._gcLastUsed = this._renderer.gc.now;

            return entry.gpuBindGroup;
        }

        return this._createBindGroup(key, bindGroup, program, groupIndex);
    }

    private _createBindGroup(key: string, group: BindGroup, program: GpuProgram, groupIndex: number): GPUBindGroup
    {
        const device = this._gpu.device;
        const groupLayout = program.layout[groupIndex];
        const entries: GPUBindGroupEntry[] = [];
        const renderer = this._renderer;

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

                gpuResource = {
                    buffer: renderer.buffer.getGPUBuffer(buffer),
                    offset: 0,
                    size: buffer.descriptor.size,
                };
            }
            else if (resource._resourceType === 'buffer')
            {
                const buffer = resource as Buffer;

                gpuResource = {
                    buffer: renderer.buffer.getGPUBuffer(buffer),
                    offset: 0,
                    size: buffer.descriptor.size,
                };
            }
            else if (resource._resourceType === 'bufferResource')
            {
                const bufferResource = resource as BufferResource;

                gpuResource = {
                    buffer: renderer.buffer.getGPUBuffer(bufferResource.buffer),
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

        this._hash[key] = new GpuBindGroupEntry(gpuBindGroup, renderer.gc.now);

        return gpuBindGroup;
    }

    public destroy(): void
    {
        this._hash = null;
        (this._renderer as null) = null;
    }
}
