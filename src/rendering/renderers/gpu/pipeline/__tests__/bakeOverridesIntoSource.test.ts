import { bakeOverridesIntoSource } from '../PipelineSystem';

describe('bakeOverridesIntoSource', () =>
{
    it('should replace override declarations with const for each WGSL type', () =>
    {
        const source = 'override A: f32 = 0.0;\noverride B: u32 = 0u;\noverride C: i32 = 0;';
        const result = bakeOverridesIntoSource(source, { A: 1, B: 2, C: 3 });

        expect(result).toBe('const A: f32 = 1.0;\nconst B: u32 = 2u;\nconst C: i32 = 3;');
    });

    it('should handle overrides without a default value', () =>
    {
        const source = 'override INTENSITY: f32;';
        const result = bakeOverridesIntoSource(source, { INTENSITY: 0.75 });

        expect(result).toBe('const INTENSITY: f32 = 0.75;');
    });

    it('should leave source unchanged when override name is not found', () =>
    {
        const source = 'override VALUE: f32 = 1.0;';
        const result = bakeOverridesIntoSource(source, { NOT_PRESENT: 5 });

        expect(result).toBe(source);
    });

    it('should return source unchanged when overrides map is empty', () =>
    {
        const source = 'override VALUE: f32 = 1.0;';
        const result = bakeOverridesIntoSource(source, {});

        expect(result).toBe(source);
    });
});
