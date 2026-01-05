/**
 * Color bit for KTX2/Basis Universal textures that use non-premultiplied alpha.
 *
 * This color bit does NOT premultiply alpha in the vertex shader, which is required
 * for correct alpha transparency with KTX2 textures that use straight (non-premultiplied) alpha.
 * @category rendering
 * @advanced
 */
export const ktx2ColorBit = {
    name: 'color-bit',
    vertex: {
        header: /* wgsl */`
            @in aColor: vec4<f32>;
        `,
        main: /* wgsl */`
            // Don't premultiply alpha for KTX2 textures (straight alpha)
            vColor *= aColor;
        `
    }
};

/**
 * GLSL color bit for KTX2/Basis Universal textures that use non-premultiplied alpha.
 *
 * This color bit does NOT premultiply alpha in the vertex shader, which is required
 * for correct alpha transparency with KTX2 textures that use straight (non-premultiplied) alpha.
 * @category rendering
 * @advanced
 */
export const ktx2ColorBitGl = {
    name: 'color-bit',
    vertex: {
        header: /* glsl */`
            in vec4 aColor;
        `,
        main: /* glsl */`
            // Don't premultiply alpha for KTX2 textures (straight alpha)
            vColor *= aColor;
        `
    }
};

