import { ensurePrecision } from '../ensurePrecision';

const options = {
    requestedVertexPrecision: 'highp',
    requestedFragmentPrecision: 'mediump',
    maxSupportedVertexPrecision: 'highp',
    maxSupportedFragmentPrecision: 'highp',
} as const;

describe('ensurePrecision', () =>
{
    it('should declare highp for samplers GLSL ES 3.00 gives no default', () =>
    {
        const src = ensurePrecision(`
            uniform sampler3D uVolume;
            uniform sampler2DArray uLayers;
            uniform usampler2D uIds;
        `, options, true);

        expect(src.startsWith('precision highp sampler3D;\n'
            + 'precision highp sampler2DArray;\n'
            + 'precision highp usampler2D;\n'
            + 'precision mediump float;\n')).toBe(true);
    });

    it('should restate the lowp default for sampler2D and samplerCube', () =>
    {
        const src = ensurePrecision('uniform sampler2D uTexture;\nuniform samplerCube uCube;', options, true);

        expect(src).toBe('precision lowp sampler2D;\nprecision lowp samplerCube;\nprecision mediump float;\n'
            + 'uniform sampler2D uTexture;\nuniform samplerCube uCube;');
    });

    it('should give a sampler the same precision in both stages', () =>
    {
        const src = 'uniform sampler3D uVolume;\nuniform sampler2D uTexture;';
        const header = (shader: string) => shader.split('\n').filter((line) => line.includes('sampler')).slice(0, 2);

        expect(header(ensurePrecision(src, options, false))).toEqual(header(ensurePrecision(src, options, true)));
    });

    it('should not declare a sampler precision the shader already has', () =>
    {
        const declared = ensurePrecision(`precision highp float;
            precision mediump sampler3D;
            uniform sampler3D uVolume;
        `, options, true);
        const qualified = ensurePrecision('uniform mediump sampler2D uTexture;', options, true);

        expect(declared).not.toContain('highp sampler3D');
        expect(qualified).not.toContain('precision lowp sampler2D');
    });

    it('should declare each sampler type once', () =>
    {
        const src = ensurePrecision('uniform sampler3D uA;\nuniform sampler3D uB;', options, true);

        expect(src.match(/precision highp sampler3D;/g)).toHaveLength(1);
    });

    it('should fall back to mediump samplers when the fragment stage has no highp', () =>
    {
        const lowEnd = { ...options, maxSupportedFragmentPrecision: 'mediump' } as const;
        const src = 'uniform sampler3D uVolume;';

        expect(ensurePrecision(src, lowEnd, true)).toContain('precision mediump sampler3D;');
        expect(ensurePrecision(src, lowEnd, false)).toContain('precision mediump sampler3D;');
    });
});
