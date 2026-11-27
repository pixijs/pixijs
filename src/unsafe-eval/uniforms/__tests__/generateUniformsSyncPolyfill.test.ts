import { generateUniformsSyncPolyfill } from '../generateUniformsSyncPolyfill';
import { UniformGroup } from '~/rendering/renderers/shared/shader/UniformGroup';
import { uniformParsers } from '~/rendering/renderers/shared/shader/utils/uniformParsers';

describe('generateUniformsSyncPolyfill', () =>
{
    it('uploads the elements of a Matrix4 with the 3D parser registered', () =>
    {
        const elements = Float32Array.from({ length: 16 }, (_, i) => i + 1);
        const group = new UniformGroup({ world: { type: 'mat4x4<f32>', value: { elements } } });
        const world = {
            name: 'world', index: 0, type: 'mat4x4<f32>', size: 1, isArray: false,
            location: {}, value: new Float32Array(16),
        };
        const gl = { uniformMatrix4fv: jest.fn() };

        // @pixi/3d registers this parser at runtime; its code string cannot run under strict CSP.
        uniformParsers.push({
            type: 'mat4x4<f32>',
            test: (data) => (data.value as { elements?: Float32Array }).elements?.length === 16,
            uniform: 'gl.uniformMatrix4fv(ud[name].location, false, uv[name].elements);',
        });
        try
        {
            const sync = generateUniformsSyncPolyfill(group, { world });

            sync({ world }, group.uniforms, { gl });
            expect(gl.uniformMatrix4fv).toHaveBeenCalledWith(world.location, false, elements);
        }
        finally
        {
            uniformParsers.pop();
        }
    });
});
