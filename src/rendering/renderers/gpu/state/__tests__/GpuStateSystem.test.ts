import { State } from '../../../shared/state/State';
import { GpuStateSystem } from '../GpuStateSystem';

describe('GpuStateSystem', () =>
{
    afterEach(() =>
    {
        GpuStateSystem.colorTargetFormat = 'bgra8unorm';
    });

    it('should default colorTargetFormat to bgra8unorm', () =>
    {
        expect(GpuStateSystem.colorTargetFormat).toEqual('bgra8unorm');
    });

    it('should use the default format for returned color targets', () =>
    {
        const system = new GpuStateSystem();
        const targets = system.getColorTargets(new State(), 1);

        expect(targets).toHaveLength(1);
        expect(targets[0].format).toEqual('bgra8unorm');
    });

    it('should propagate an overridden colorTargetFormat to returned color targets', () =>
    {
        GpuStateSystem.colorTargetFormat = 'rgba16float';

        const system = new GpuStateSystem();
        const targets = system.getColorTargets(new State(), 2);

        expect(targets).toHaveLength(2);
        expect(targets[0].format).toEqual('rgba16float');
        expect(targets[1].format).toEqual('rgba16float');
    });
});
