import { UniformGroup } from '../UniformGroup';

describe('UniformGroup', () =>
{
    it('should create correct uniforms', () =>
    {
        const uniformGroup = new UniformGroup({
            uTest: { value: 1, type: 'f32' },
            uTest2: { value: 2, type: 'f32' },
        });

        expect(uniformGroup.uniforms.uTest).toEqual(1);
        expect(uniformGroup.uniforms.uTest2).toEqual(2);
    });

    it('should create correct default values uniforms', () =>
    {
        const uniformGroup = new UniformGroup({
            uTestFloat: { value: undefined, type: 'f32' },
            uTestVec2: { value: undefined, type: 'vec2<f32>' },
            uTestVec3: { value: undefined, type: 'vec3<f32>' },
            uTestMatrix: { value: undefined, type: 'mat3x3<f32>' },
        });

        expect(uniformGroup.uniforms.uTestFloat).toEqual(0);
        expect(uniformGroup.uniforms.uTestVec2).toEqual(new Float32Array([0, 0]));
        expect(uniformGroup.uniforms.uTestVec3).toEqual(new Float32Array([0, 0, 0]));
        expect(uniformGroup.uniforms.uTestMatrix).toEqual(new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1]
        ));
    });

    it('should provide helpful error message for array syntax', () =>
    {
        expect(() =>
        {
            const uniformGroup = new UniformGroup({
                uActions: {
                    value: [1, 2, 3],
                    type: 'array<i32, 3>'
                }
            });

            return uniformGroup;
        }).toThrow(/Use type: 'i32', size: 3 instead/);
    });

    it('should provide helpful error message for array syntax with f32', () =>
    {
        expect(() =>
        {
            const uniformGroup = new UniformGroup({
                uFloats: {
                    value: [1.0, 2.0, 3.0, 4.0],
                    type: 'array<f32, 4>'
                }
            });

            return uniformGroup;
        }).toThrow(/Use type: 'f32', size: 4 instead/);
    });

    it('should work with correct array syntax using size property', () =>
    {
        const uniformGroup = new UniformGroup({
            uActions: {
                value: [1, 2, 3],
                type: 'i32',
                size: 3
            }
        });

        expect(uniformGroup.uniforms.uActions).toEqual([1, 2, 3]);
    });
});
