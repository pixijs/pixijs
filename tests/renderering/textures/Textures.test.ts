import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';

describe('Texture', () =>
{
    it('destroying a destroyed texture should not throw an error', () =>
    {
        const texture = new Texture();

        texture.destroy(true);
        texture.destroy(true);
    });
});
