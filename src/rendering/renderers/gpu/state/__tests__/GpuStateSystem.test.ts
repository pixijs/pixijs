import { State } from '../../../shared/state/State';
import { GpuStateSystem } from '../GpuStateSystem';

describe('GpuStateSystem.getColorTargets', () =>
{
    it('gives each target its own attachment format', () =>
    {
        const system = new GpuStateSystem();
        const state = new State();

        state.blend = true;

        const targets = system.getColorTargets(state, ['rgba16float', 'rg16float', 'rgba8unorm']);

        expect(targets.map((t) => t.format)).toEqual(['rgba16float', 'rg16float', 'rgba8unorm']);
    });

    it('emits one fresh GPUColorTargetState per slot (no shared object refs)', () =>
    {
        const system = new GpuStateSystem();
        const state = new State();

        state.blend = true;

        const targets = system.getColorTargets(state, ['bgra8unorm', 'bgra8unorm']);

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

        const targets = system.getColorTargets(state, ['rgba8unorm']);

        expect(targets[0].blend).toBeUndefined();
    });

    it('attaches a blend descriptor when state.blend is true', () =>
    {
        const system = new GpuStateSystem();
        const state = new State();

        state.blend = true;

        const targets = system.getColorTargets(state, ['rgba8unorm']);

        expect(targets[0].blend).toBeDefined();
    });

    it('never blends an integer attachment', () =>
    {
        const system = new GpuStateSystem();
        const state = new State();

        state.blend = true;

        const targets = system.getColorTargets(state, ['rgba8unorm', 'r32uint', 'rg16sint']);

        expect(targets[0].blend).toBeDefined();
        expect(targets[1].blend).toBeUndefined();
        expect(targets[2].blend).toBeUndefined();
    });
});
