import { RenderTarget } from '../shared/renderTarget/RenderTarget';
import { getWebGLRenderer } from '@test-utils';

import type { WebGLRenderer } from '../gl/WebGLRenderer';

describe('RenderTargetSystem', () =>
{
    it('should return a render target for canvas elements', async () =>
    {
        const renderer = await getWebGLRenderer({}) as WebGLRenderer;
        const canvas = document.createElement('canvas');

        const target = renderer.renderTarget.getRenderTarget(canvas);

        expect(target).toBeInstanceOf(RenderTarget);
    });
});
