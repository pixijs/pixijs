export const roundPixelsBit = {
    name: 'round-pixels-bit',
    vertex: {
        header: /* wgsl */`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32> 
            {
                return (round((position * 0.5 + 0.5) * targetSize) / targetSize) * 2.0 - 1.0;
            }
        `
    }
};

export const roundPixelsBitGl = {
    name: 'round-pixels-bit',
    vertex: {
        header: /* glsl */`   
            float round(float value) {
                return value < 0.0 ? ceil(value - 0.5) : floor(value + 0.5);
            }
      
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {      
                // round..
                vec2 pixelPosition = (position * 0.5 + 0.5) * targetSize;

                vec2 roundedPosition = vec2(round(pixelPosition.x), round(pixelPosition.y));

                return (roundedPosition / targetSize) * 2.0 - 1.0;
            }
        `
    }
};

