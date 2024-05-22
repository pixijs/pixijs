// TODO eventually we should not use this bit, but instead use the localUniformBit
// have the MSDF bit be merged in with the localUniformBit

export const localUniformMSDFBit = {
    name: 'local-uniform-msdf-bit',
    vertex: {
        header: /* wgsl */`
            struct LocalUniforms {
                uColor:vec4<f32>,
                uTransformMatrix:mat3x3<f32>,
                uDistance: f32,
                uRound:f32,
            }

            @group(2) @binding(0) var<uniform> localUniforms : LocalUniforms;
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
    fragment: {
        header: /* wgsl */`
            struct LocalUniforms {
                uColor:vec4<f32>,
                uTransformMatrix:mat3x3<f32>,
                uDistance: f32
            }

            @group(2) @binding(0) var<uniform> localUniforms : LocalUniforms;
         `,
        main: /* wgsl */` 
            outColor = vec4<f32>(calculateMSDFAlpha(outColor, localUniforms.uColor, localUniforms.uDistance));
        `

    }
};

export const localUniformMSDFBitGl = {
    name: 'local-uniform-msdf-bit',
    vertex: {
        header: /* glsl */`
            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,
        main: /* glsl */`
            vColor *= uColor;
            modelMatrix *= uTransformMatrix;
        `,
        end: /* glsl */`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `
    },
    fragment: {
        header: /* glsl */`
            uniform float uDistance;
         `,
        main: /* glsl */` 
            outColor = vec4(calculateMSDFAlpha(outColor, vColor, uDistance));
        `

    }
};
