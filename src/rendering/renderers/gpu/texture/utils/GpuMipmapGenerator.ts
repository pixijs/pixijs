/**
 * A class which generates mipmaps for a GPUTexture.
 * Thanks to @toji for the original implementation
 * https://github.com/toji/web-texture-tool/blob/main/src/webgpu-mipmap-generator.js
 * @memberof rendering
 * @ignore
 */
export class GpuMipmapGenerator
{
    public device: GPUDevice;
    public sampler: GPUSampler;
    public pipelines: Record<string, GPURenderPipeline>;

    public mipmapShaderModule: any;

    constructor(device: GPUDevice)
    {
        this.device = device;
        this.sampler = device.createSampler({ minFilter: 'linear' });
        // We'll need a new pipeline for every texture format used.
        this.pipelines = {};
    }

    private _getMipmapPipeline(format: GPUTextureFormat)
    {
        let pipeline = this.pipelines[format];

        if (!pipeline)
        {
            // Shader modules is shared between all pipelines, so only create once.
            if (!this.mipmapShaderModule)
            {
                this.mipmapShaderModule = this.device.createShaderModule({
                    code: /* wgsl */ `
                        var<private> pos : array<vec2<f32>, 3> = array<vec2<f32>, 3>(
                        vec2<f32>(-1.0, -1.0), vec2<f32>(-1.0, 3.0), vec2<f32>(3.0, -1.0));

                        struct VertexOutput {
                        @builtin(position) position : vec4<f32>,
                        @location(0) texCoord : vec2<f32>,
                        };

                        @vertex
                        fn vertexMain(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
                        var output : VertexOutput;
                        output.texCoord = pos[vertexIndex] * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5);
                        output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
                        return output;
                        }

                        @group(0) @binding(0) var imgSampler : sampler;
                        @group(0) @binding(1) var img : texture_2d<f32>;

                        @fragment
                        fn fragmentMain(@location(0) texCoord : vec2<f32>) -> @location(0) vec4<f32> {
                        return textureSample(img, imgSampler, texCoord);
                        }
                    `,
                });
            }

            pipeline = this.device.createRenderPipeline({
                layout: 'auto',
                vertex: {
                    module: this.mipmapShaderModule,
                    entryPoint: 'vertexMain',
                },
                fragment: {
                    module: this.mipmapShaderModule,
                    entryPoint: 'fragmentMain',
                    targets: [{ format }],
                }
            });

            this.pipelines[format] = pipeline;
        }

        return pipeline;
    }

    /**
     * Generates mipmaps for the given GPUTexture from the data in level 0.
     * @param {module:External.GPUTexture} texture - Texture to generate mipmaps for.
     * @returns {module:External.GPUTexture} - The originally passed texture
     */
    public generateMipmap(texture: GPUTexture)
    {
        const pipeline = this._getMipmapPipeline(texture.format);

        if (texture.dimension === '3d' || texture.dimension === '1d')
        {
            throw new Error('Generating mipmaps for non-2d textures is currently unsupported!');
        }

        let mipTexture = texture;
        const arrayLayerCount = texture.depthOrArrayLayers || 1; // Only valid for 2D textures.

        // If the texture was created with RENDER_ATTACHMENT usage we can render directly between mip levels.
        const renderToSource = texture.usage & GPUTextureUsage.RENDER_ATTACHMENT;

        if (!renderToSource)
        {
            // Otherwise we have to use a separate texture to render into. It can be one mip level smaller than the source
            // texture, since we already have the top level.
            const mipTextureDescriptor = {
                size: {
                    width: Math.ceil(texture.width / 2),
                    height: Math.ceil(texture.height / 2),
                    depthOrArrayLayers: arrayLayerCount,
                },
                format: texture.format,
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT,
                mipLevelCount: texture.mipLevelCount - 1,
            };

            mipTexture = this.device.createTexture(mipTextureDescriptor);
        }

        const commandEncoder = this.device.createCommandEncoder({});
        // TODO: Consider making this static.
        const bindGroupLayout = pipeline.getBindGroupLayout(0);

        for (let arrayLayer = 0; arrayLayer < arrayLayerCount; ++arrayLayer)
        {
            let srcView = texture.createView({
                baseMipLevel: 0,
                mipLevelCount: 1,
                dimension: '2d',
                baseArrayLayer: arrayLayer,
                arrayLayerCount: 1,
            });

            let dstMipLevel = renderToSource ? 1 : 0;

            for (let i = 1; i < texture.mipLevelCount; ++i)
            {
                const dstView = mipTexture.createView({
                    baseMipLevel: dstMipLevel++,
                    mipLevelCount: 1,
                    dimension: '2d',
                    baseArrayLayer: arrayLayer,
                    arrayLayerCount: 1,
                });

                const passEncoder = commandEncoder.beginRenderPass({
                    colorAttachments: [{
                        view: dstView,
                        storeOp: 'store',
                        loadOp: 'clear',
                        clearValue: { r: 0, g: 0, b: 0, a: 0 },
                    }],
                });

                const bindGroup = this.device.createBindGroup({
                    layout: bindGroupLayout,
                    entries: [{
                        binding: 0,
                        resource: this.sampler,
                    }, {
                        binding: 1,
                        resource: srcView,
                    }],
                });

                passEncoder.setPipeline(pipeline);
                passEncoder.setBindGroup(0, bindGroup);
                passEncoder.draw(3, 1, 0, 0);

                passEncoder.end();

                srcView = dstView;
            }
        }

        // If we didn't render to the source texture, finish by copying the mip results from the temporary mipmap texture
        // to the source.
        if (!renderToSource)
        {
            const mipLevelSize = {
                width: Math.ceil(texture.width / 2),
                height: Math.ceil(texture.height / 2),
                depthOrArrayLayers: arrayLayerCount,
            };

            for (let i = 1; i < texture.mipLevelCount; ++i)
            {
                commandEncoder.copyTextureToTexture({
                    texture: mipTexture,
                    mipLevel: i - 1,
                }, {
                    texture,
                    mipLevel: i,
                }, mipLevelSize);

                mipLevelSize.width = Math.ceil(mipLevelSize.width / 2);
                mipLevelSize.height = Math.ceil(mipLevelSize.height / 2);
            }
        }

        this.device.queue.submit([commandEncoder.finish()]);

        if (!renderToSource)
        {
            mipTexture.destroy();
        }

        return texture;
    }
}
