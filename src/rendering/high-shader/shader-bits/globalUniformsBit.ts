export const globalUniformsBit = {
    name: 'global-uniforms-bit',
    vertex: {
        header: /* wgsl */`
        struct GlobalUniforms {
            projectionMatrix:mat3x3<f32>,
            worldTransformMatrix:mat3x3<f32>,
            worldColorAlpha: vec4<f32>,
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
            mat3 projectionMatrix;
            mat3 worldTransformMatrix;
            vec4 worldColorAlpha;
            vec2 uResolution;
          };
        `
    }
};

export const globalUniformsBitGl = {
    name: 'global-uniforms-bit',
    vertex: {
        header: /* glsl */`
          uniform mat3 projectionMatrix;
          uniform mat3 worldTransformMatrix;
          uniform vec4 worldColorAlpha;
          uniform vec2 uResolution;
        `
    }

};
