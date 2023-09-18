export function generateGPULayout(maxTextures: number): GPUBindGroupLayoutEntry[]
{
    const gpuLayout: GPUBindGroupLayoutEntry[] = [];

    let bindIndex = 0;

    for (let i = 0; i < maxTextures; i++)
    {
        gpuLayout[bindIndex] = {
            texture: {
                sampleType: 'float',
                viewDimension: '2d',
                multisampled: false,
            },
            binding: bindIndex,
            visibility: GPUShaderStage.FRAGMENT,
        };
        bindIndex++;

        gpuLayout[bindIndex] = {
            sampler: {
                type: 'filtering',
            },
            binding: bindIndex,
            visibility: GPUShaderStage.FRAGMENT,
        };

        bindIndex++;
    }

    return gpuLayout;
}
