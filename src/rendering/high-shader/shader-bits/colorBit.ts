export const colorBit = {
    name: 'color-bit',
    vertex: {
        header: /* wgsl */`
            @in aColor: vec4<f32>;
        `,
        main: /* wgsl */`
            vColor *= aColor;
        `
    }
};
