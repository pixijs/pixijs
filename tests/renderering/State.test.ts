import { State } from '../../src/rendering/renderers/shared/state/State';
import { getRenderer } from '../utils/getRenderer';

import type { GlStateSystem } from '../../src/rendering/renderers/gl/state/GlStateSystem';

describe('State', () =>
{
    it('should default to normal state', async () =>
    {
        const stateSystem = (await getRenderer()).state as GlStateSystem;

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
