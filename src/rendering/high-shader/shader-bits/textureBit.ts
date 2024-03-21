export const textureBit = {
    name: 'texture-bit',
    vertex: {
        header: /* wgsl */`

        struct TextureUniforms {
            uTextureMatrix:mat3x3<f32>,
        }

        @group(2) @binding(2) var<uniform> textureUniforms : TextureUniforms;
        `,
        main: /* wgsl */`
            uv = (textureUniforms.uTextureMatrix * vec3(uv, 1.0)).xy;
        `
    },
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

export const textureBitGl = {
    name: 'texture-bit',
    vertex: {
        header: /* glsl */`
            uniform mat3 uTextureMatrix;
        `,
        main: /* glsl */`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `
    },
    fragment: {
        header: /* glsl */`
        uniform sampler2D uTexture;

         
        `,
        main: /* glsl */`
            outColor = texture(uTexture, vUV);
        `
    }
};

