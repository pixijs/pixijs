export const globalUniformsBit = {
    name: 'global-uniforms-bit',
    vertex: {
        header: /* wgsl */`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `
    }
};

export const globalUniformsUBOBitGl = {
    name: 'global-uniforms-ubo-bit',
    vertex: {
        header: /* glsl */`
          uniform globalUniforms {
            mat3 uProjectionMatrix;
            mat3 uWorldTransformMatrix;
            vec4 uWorldColorAlpha;
            vec2 uResolution;
          };
        `
    }
};

export const globalUniformsBitGl = {
    name: 'global-uniforms-bit',
    vertex: {
        header: /* glsl */`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `
    }

};
