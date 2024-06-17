import { RenderTarget } from '../../src/rendering/renderers/shared/renderTarget/RenderTarget';
import { getWebGLRenderer } from '../utils/getRenderer';

import type { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

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
