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
});
