import { generateSmoothGlSource, generateSmoothWgslSource } from '../shared/batcher/smoothShaderSource';

describe('smoothShaderSource', () =>
{
    const maxTextures = 4;

    it('should skip the texture sampling of untextured shaders', () =>
    {
        const { fragment } = generateSmoothGlSource({ maxTextures, untextured: true });
        const wgsl = generateSmoothWgslSource({ maxTextures, untextured: true });

        expect(fragment).not.toContain('texture2D(');
        expect(wgsl).not.toContain('textureSampleGrad(');
    });

    it('should still declare the textures of untextured shaders', () =>
    {
        // the batches bind the textures whether the shader samples them or not
        const { fragment } = generateSmoothGlSource({ maxTextures, untextured: true });
        const wgsl = generateSmoothWgslSource({ maxTextures, untextured: true });

        expect(fragment).toContain(`uniform sampler2D uTextures[${maxTextures}];`);

        for (let i = 0; i < maxTextures; i++)
        {
            expect(wgsl).toContain(`var uTexture${i}: texture_2d<f32>;`);
            expect(wgsl).toContain(`var uSampler${i}: sampler;`);
        }
    });

    it('should sample the textures by default', () =>
    {
        // e.g. DashLineShader, which can draw textured strokes
        for (const textured of [false, true])
        {
            const { fragment } = generateSmoothGlSource({ maxTextures, textured });
            const wgsl = generateSmoothWgslSource({ maxTextures, textured });

            expect(fragment.match(/texture2D\(/g)).toHaveLength(maxTextures);
            expect(wgsl.match(/textureSampleGrad\(/g)).toHaveLength(maxTextures);
        }
    });
});
