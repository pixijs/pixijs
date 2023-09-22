export const colorBit = {
    name: 'color-bit',
    vertex: {
        header: /* wgsl */`
            @in aColor: vec4<f32>;
        `,
        main: /* wgsl */`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
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
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `
    }
};
