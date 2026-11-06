import '~/rendering/init';
import { getWebGLRenderer } from '@test-utils';
import { Point } from '~/maths';
import { Container } from '~/scene';

import type { UniformGroup } from '../../shader/UniformGroup';

describe('GlobalUniformSystem', () =>
{
    it('should bind its pooled uniform groups on WebGL without listening to them', async () =>
    {
        const renderer = await getWebGLRenderer();
        const stage = new Container();
        const seen = new Set<UniformGroup>();

        try
        {
            for (let i = 0; i < 3; i++)
            {
                renderer.render(stage);
                seen.add(renderer.globalUniforms.uniformGroup);

                // a nested push binds a second pooled group
                renderer.globalUniforms.push({ offset: new Point(1, 1) });
                seen.add(renderer.globalUniforms.uniformGroup);
                renderer.globalUniforms.pop();
            }

            expect(seen.size).toBeGreaterThan(1);

            for (const uniformGroup of seen)
            {
                expect(uniformGroup.listenerCount('change')).toBe(0);
            }
        }
        finally
        {
            stage.destroy();
            renderer.destroy();
        }
    });
});
