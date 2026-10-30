import { GpuProgram } from '../GpuProgram';

describe('GpuProgram', () =>
{
    const source = `
        struct Particle {
            position : vec2f,
            velocity : vec2f,
        }

        @group(0) @binding(0) var<storage, read_write> particles : array<Particle>;
    `;

    it('should not alias layout keys when entry point names concatenate equally', () =>
    {
        const first = new GpuProgram({
            vertex: { source, entryPoint: 'ab' },
            fragment: { source, entryPoint: 'c' },
        });
        const second = new GpuProgram({
            vertex: { source, entryPoint: 'a' },
            fragment: { source, entryPoint: 'bc' },
        });

        expect(first._layoutKey).not.toBe(second._layoutKey);
    });

    it('should share a layout key between identical programs', () =>
    {
        const first = new GpuProgram({
            vertex: { source, entryPoint: 'main' },
            fragment: { source, entryPoint: 'main' },
        });
        const second = new GpuProgram({
            vertex: { source, entryPoint: 'main' },
            fragment: { source, entryPoint: 'main' },
        });

        expect(first._layoutKey).toBe(second._layoutKey);
    });
});
