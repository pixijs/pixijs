import { Texture } from '../Texture';
import { getWebGLRenderer } from '@test-utils';
import { Container } from '~/scene/container/Container';

import type { WebGLRenderer } from '~/rendering/renderers/gl/WebGLRenderer';

describe('GenerateTexture', () =>
{
    it('should generate texture from container', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const container = new Container();
        const texture = renderer.textureGenerator.generateTexture(container);

        expect(texture).toBeInstanceOf(Texture);
    });

    it('should generate texture from options', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const container = new Container();
        const texture = renderer.textureGenerator.generateTexture({
            target: container,
        });

        expect(texture).toBeInstanceOf(Texture);
    });
});
