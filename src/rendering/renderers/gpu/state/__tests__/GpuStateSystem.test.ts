import { State } from '../../../shared/state/State';
import { GpuStateSystem } from '../GpuStateSystem';

describe('GpuStateSystem.getColorTargets', () =>
{
    it('uses the supplied format on every emitted target', () =>
    {
        const system = new GpuStateSystem();
        const state = new State();

        state.blend = true;

        const targets = system.getColorTargets(state, 3, 'rgba16float');

        expect(targets).toHaveLength(3);
        expect(targets.every((t) => t.format === 'rgba16float')).toBe(true);
    });

    it('emits one fresh GPUColorTargetState per slot (no shared object refs)', () =>
    {
        const system = new GpuStateSystem();
        const state = new State();

        state.blend = true;

        const targets = system.getColorTargets(state, 2, 'bgra8unorm');

        expect(targets[0]).not.toBe(targets[1]);

        // mutating one should not bleed into the other (the previous implementation
        // reused a single object reference across all slots, so mutating writeMask
        // for slot 0 would also mutate slot 1).
        targets[0].writeMask = 0b0001;

        expect(targets[1].writeMask).toBe(0);
    });

    it('omits the blend descriptor when state.blend is false', () =>
    {
        const system = new GpuStateSystem();
        const state = new State();

        state.blend = false;

        const targets = system.getColorTargets(state, 1, 'rgba8unorm');

        expect(targets[0].blend).toBeUndefined();
    });

    it('attaches a blend descriptor when state.blend is true', () =>
    {
        const system = new GpuStateSystem();
        const state = new State();

        state.blend = true;

        const targets = system.getColorTargets(state, 1, 'rgba8unorm');

        expect(targets[0].blend).toBeDefined();
    });
});
