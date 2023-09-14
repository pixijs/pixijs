export const localUniformBit = {
    name: 'local-uniform-bit',
    vertex: {
        header: /* wgsl */`

            struct LocalUniforms {
                transformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,
        main: /* wgsl */`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.transformMatrix;
        `
    },
};
