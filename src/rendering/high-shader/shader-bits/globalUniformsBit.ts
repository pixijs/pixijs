export const globalUniformsBit = {
    name: 'global-uniforms-bit',
    vertex: {
        header: /* wgsl */`
        struct GlobalUniforms {
            projectionMatrix:mat3x3<f32>,
            worldTransformMatrix:mat3x3<f32>,
            worldAlpha: f32
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `
    }
};
