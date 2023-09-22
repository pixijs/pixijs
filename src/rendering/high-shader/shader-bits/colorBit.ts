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

export const colorBitGl = {
    name: 'color-bit',
    vertex: {
        header: /* glsl */`
            in vec4 aColor;
        `,
        main: /* glsl */`
           vColor *=  aColor;
        `
    }
};
