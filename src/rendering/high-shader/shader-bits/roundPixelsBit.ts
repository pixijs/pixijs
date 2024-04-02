export const roundPixelsBit = {
    name: 'round-pixels-bit',
    vertex: {
        header: /* wgsl */`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32> 
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `
    }
};

export const roundPixelsBitGl = {
    name: 'round-pixels-bit',
    vertex: {
        header: /* glsl */`   
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {       
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `
    }
};

