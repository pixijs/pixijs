/** Storage formats a 3D linear sample can write. Clouds want `rgba16float`; `rgba8unorm` is the demo. */
const MIPMAP_3D_FORMATS = ['rgba8unorm', 'rgba8snorm', 'rgba16float'];

const WORKGROUP_SIZE = 4;

/**
 * Throws unless a 3D texture can have its mipmaps generated: WebGPU writes them with a compute shader,
 * so the texture needs `storage: true` and one of the formats a linear 3D sample can store.
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
 * One dispatch per mip, one thread per output voxel. A linear sample at the centre of each
 * 2×2×2 box reads the previous mip, and the result is stored in the next. Mips of one texture
 * can't be sampled and stored in the same pass, so each level is its own pass and the encoder
 * is submitted once.
 *
 * The texture must have been created with `storage: true` and a full mip chain.
 * @category rendering
 * @ignore
 */
export class Gpu3dMipmapGenerator
{
    public device: GPUDevice;
    public sampler: GPUSampler;
    public pipelines: Record<string, GPUComputePipeline>;

    constructor(device: GPUDevice)
    {
        this.device = device;
        this.sampler = device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            addressModeW: 'clamp-to-edge',
        });
        // We'll need a new pipeline for every texture format used.
        this.pipelines = {};
    }

    private _getMipmapPipeline(format: GPUTextureFormat): GPUComputePipeline
    {
        let pipeline = this.pipelines[format];

        if (!pipeline)
        {
            pipeline = this.device.createComputePipeline({
                layout: 'auto',
                compute: {
                    module: this.device.createShaderModule({
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

            this.pipelines[format] = pipeline;
        }

        return pipeline;
    }

    /**
     * Fills mip levels 1..n of a 3D texture from level 0.
     * @param texture - a 3D texture with `STORAGE_BINDING` and more than one mip level
     * @advanced
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
        const encoder = this.device.createCommandEncoder({ label: 'Gpu3dMipmapGenerator' });

        let width = texture.width;
        let height = texture.height;
        let depth = texture.depthOrArrayLayers;

        for (let level = 1; level < texture.mipLevelCount; level++)
        {
            width = Math.max(1, width >> 1);
            height = Math.max(1, height >> 1);
            depth = Math.max(1, depth >> 1);

            const pass = encoder.beginComputePass();

            pass.setPipeline(pipeline);
            pass.setBindGroup(0, this.device.createBindGroup({
                layout: pipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: this.sampler },
                    {
                        binding: 1,
                        resource: texture.createView({
                            dimension: '3d',
                            baseMipLevel: level - 1,
                            mipLevelCount: 1,
                        }),
                    },
                    {
                        binding: 2,
                        resource: texture.createView({
                            dimension: '3d',
                            baseMipLevel: level,
                            mipLevelCount: 1,
                        }),
                    },
                ],
            }));
            pass.dispatchWorkgroups(
                Math.ceil(width / WORKGROUP_SIZE),
                Math.ceil(height / WORKGROUP_SIZE),
                Math.ceil(depth / WORKGROUP_SIZE),
            );
            pass.end();
        }

        this.device.queue.submit([encoder.finish()]);
    }
}
