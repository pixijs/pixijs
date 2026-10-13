/** Formats a 3D mip chain can be written to: filterable and storage-capable on every WebGPU device */
const MIPMAP_3D_FORMATS: readonly GPUTextureFormat[] = ['rgba8unorm', 'rgba16float'];

const WORKGROUP_SIZE = 4;

/**
 * Throws unless a 3D texture can have its mipmaps generated. WebGPU writes them with a compute shader,
 * so the texture needs `storage: true` and a format the shader can both sample linearly and store.
 * @param format - the texture's format
 * @param storage - whether the texture can be bound as a storage texture
 * @internal
 */
export function assertMipmap3dTexture(format: GPUTextureFormat, storage: boolean): void
{
    if (!storage)
    {
        throw new Error('[Gpu3dMipmapGenerator] generating mipmaps for a 3D texture needs storage: true.');
    }

    if (!MIPMAP_3D_FORMATS.includes(format))
    {
        throw new Error(`[Gpu3dMipmapGenerator] format '${format}' can't be downsampled. `
            + `Use ${MIPMAP_3D_FORMATS.join(', ')}.`);
    }
}

/**
 * Generates mipmaps for a 3D GPUTexture with a compute shader.
 *
 * One compute pass with one dispatch per mip, one thread per output voxel. Each dispatch takes a
 * linear sample at the centre of every 2×2×2 box of the previous mip and stores it in the next.
 *
 * The texture must have been created with `storage: true` and a full mip chain.
 * @category rendering
 * @ignore
 */
export class Gpu3dMipmapGenerator
{
    private readonly _device: GPUDevice;
    private readonly _sampler: GPUSampler;
    private readonly _pipelines: Record<string, GPUComputePipeline> = {};

    constructor(device: GPUDevice)
    {
        this._device = device;
        this._sampler = device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });
    }

    private _getMipmapPipeline(format: GPUTextureFormat): GPUComputePipeline
    {
        this._pipelines[format] ??= this._device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: this._device.createShaderModule({
                    code: /* wgsl */ `
                        @group(0) @binding(0) var srcSampler : sampler;
                        @group(0) @binding(1) var src : texture_3d<f32>;
                        @group(0) @binding(2) var dst : texture_storage_3d<${format}, write>;

                        @compute @workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
                        fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
                            let dstSize = textureDimensions(dst);

                            if (gid.x >= dstSize.x || gid.y >= dstSize.y || gid.z >= dstSize.z) {
                                return;
                            }

                            // centre of the 2x2x2 footprint in the previous mip. When a dimension is
                            // odd its last texel, row or slice is never sampled, as in the 2D generator
                            let uv = (vec3<f32>(gid) * 2.0 + 1.0) / vec3<f32>(textureDimensions(src));

                            textureStore(dst, gid, textureSampleLevel(src, srcSampler, uv, 0.0));
                        }
                    `,
                }),
                entryPoint: 'main',
            },
        });

        return this._pipelines[format];
    }

    /**
     * Fills mip levels 1..n of a 3D texture from level 0.
     * @param texture - a 3D texture with `STORAGE_BINDING` and more than one mip level
     */
    public generateMipmap(texture: GPUTexture): void
    {
        if (texture.dimension !== '3d')
        {
            throw new Error('[Gpu3dMipmapGenerator] generateMipmap expects a 3D texture.');
        }

        if (texture.mipLevelCount < 2) return;

        assertMipmap3dTexture(texture.format, (texture.usage & GPUTextureUsage.STORAGE_BINDING) !== 0);

        const pipeline = this._getMipmapPipeline(texture.format);
        const layout = pipeline.getBindGroupLayout(0);
        const encoder = this._device.createCommandEncoder({ label: 'Gpu3dMipmapGenerator' });
        const pass = encoder.beginComputePass();

        pass.setPipeline(pipeline);

        let width = texture.width;
        let height = texture.height;
        let depth = texture.depthOrArrayLayers;
        let srcView = texture.createView({ dimension: '3d', baseMipLevel: 0, mipLevelCount: 1 });

        for (let level = 1; level < texture.mipLevelCount; level++)
        {
            width = Math.max(1, width >> 1);
            height = Math.max(1, height >> 1);
            depth = Math.max(1, depth >> 1);

            const dstView = texture.createView({ dimension: '3d', baseMipLevel: level, mipLevelCount: 1 });

            pass.setBindGroup(0, this._device.createBindGroup({
                layout,
                entries: [
                    { binding: 0, resource: this._sampler },
                    { binding: 1, resource: srcView },
                    { binding: 2, resource: dstView },
                ],
            }));
            pass.dispatchWorkgroups(
                Math.ceil(width / WORKGROUP_SIZE),
                Math.ceil(height / WORKGROUP_SIZE),
                Math.ceil(depth / WORKGROUP_SIZE),
            );

            srcView = dstView;
        }

        pass.end();
        this._device.queue.submit([encoder.finish()]);
    }
}
