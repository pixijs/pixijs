export const localUniformBit = {
    name: 'local-uniform-bit',
    vertex: {
        header: /* wgsl */`

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,
        main: /* wgsl */`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,
        end: /* wgsl */`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `
    },
};

export const localUniformBitGl = {
    name: 'local-uniform-bit',
    vertex: {
        header: /* glsl */`

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,
        main: /* glsl */`
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `,
        end: /* glsl */`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `
    },
};
