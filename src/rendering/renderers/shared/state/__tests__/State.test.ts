import { State } from '../State';
import { getWebGLRenderer } from '@test-utils';

import type { GlStateSystem } from '~/rendering';

describe('State', () =>
{
    it('should default to normal state', async () =>
    {
        const stateSystem = (await getWebGLRenderer()).state as GlStateSystem;

        const state = State.for2d();

        state.blendMode = 'color-dodge';

        stateSystem.set(state);

        expect(stateSystem.blendMode).toBe('normal');

        state.blendMode = 'soft-light';

        stateSystem.set(state);

        expect(stateSystem.blendMode).toBe('normal');

        state.blendMode = 'add';

        stateSystem.set(state);

        expect(stateSystem.blendMode).toBe('add');
    });

    it('should check the blend mode only while blending is on, without resizing its checks', async () =>
    {
        const stateSystem = (await getWebGLRenderer()).state as GlStateSystem;
        const checks = stateSystem['checks'];
        const setBlendMode = jest.spyOn(stateSystem, 'setBlendMode');

        const blended = State.for2d();
        const opaque = State.for2d();

        blended.blendMode = 'add';
        opaque.blend = false;

        stateSystem.set(blended);
        expect(stateSystem.blendMode).toBe('add');

        // toggling blend (as a stencil mask push and pop does) keeps one slot per check
        for (let i = 0; i < 3; i++)
        {
            stateSystem.set(opaque);
            expect(checks).toHaveLength(2);
            expect(checks[0]).toBeNull();

            setBlendMode.mockClear();
            stateSystem.set(opaque);
            expect(setBlendMode).not.toHaveBeenCalled();

            stateSystem.set(blended);
            expect(checks).toHaveLength(2);
            expect(setBlendMode).toHaveBeenCalledWith('add');
        }

        expect(stateSystem['checks']).toBe(checks);
    });
});
