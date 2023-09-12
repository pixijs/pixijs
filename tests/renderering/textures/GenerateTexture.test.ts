import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import { Container } from '../../../src/rendering/scene/Container';
import { getRenderer } from '../../utils/getRenderer';

import type { WebGLRenderer } from '../../../src/rendering/renderers/gl/WebGLRenderer';

describe('GenerateTexture', () =>
{
    it('should generate texture from container', async () =>
    {
        const renderer = (await getRenderer()) as WebGLRenderer;
        const container = new Container();
        const texture = renderer.textureGenerator.generateTexture(container);

        expect(texture).toBeInstanceOf(Texture);
    });

    it('should generate texture from options', async () =>
    {
        const renderer = (await getRenderer()) as WebGLRenderer;
        const container = new Container();
        const texture = renderer.textureGenerator.generateTexture({
            container,
        });

        expect(texture).toBeInstanceOf(Texture);
    });
});
