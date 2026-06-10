import { UniformGroup } from '../UniformGroup';
import { getWebGLRenderer } from '@test-utils';

import type { WebGLRenderer } from '~/rendering';

describe('UboSystem', () =>
{
    it('should opt uniform buffers out of garbage collection', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;

        const uniformGroup = new UniformGroup({
            uTest: { value: 1, type: 'f32' },
        });

        renderer.ubo.ensureUniformGroup(uniformGroup);

        // bind group keys never change for a UniformGroup, so its buffer must not
        // be collected behind a cached bind group
        expect(uniformGroup.buffer.autoGarbageCollect).toBe(false);
    });
});
