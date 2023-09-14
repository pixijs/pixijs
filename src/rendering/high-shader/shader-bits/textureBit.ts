export const textureBit = {
    name: 'texture-bit',
    fragment: {
        header: /* wgsl */`
            @group(2) @binding(0) var uTexture: texture_2d<f32>;
            @group(2) @binding(1) var uSampler: sampler;

         
        `,
        main: /* wgsl */`
            outColor = textureSample(uTexture, uSampler, vUV);
        `
    }
};

