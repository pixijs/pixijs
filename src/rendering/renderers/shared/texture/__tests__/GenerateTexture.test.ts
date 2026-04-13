import { Texture } from '../Texture';
import { getWebGLRenderer } from '@test-utils';
import { Container } from '~/scene';

import type { WebGLRenderer } from '~/rendering';

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

    it('should generate texture from options with default anchor', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const container = new Container();
        const texture = renderer.textureGenerator.generateTexture({
            target: container,
            defaultAnchor: { x: 0.5, y: 0.5 },
        });

        expect(texture.defaultAnchor).toEqual({ x: 0.5, y: 0.5 });
    });
});
