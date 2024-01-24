import { TextureSource } from '../../../src/rendering/renderers/shared/texture/sources/TextureSource';
import { getWebGLRenderer } from '../../utils/getRenderer';

describe('TextureSource', () =>
{
    it('a texture style change should emit an update that the renderer can listen to', () =>
    {
        const textureSource = new TextureSource();

        const eventSpy = jest.spyOn(textureSource, 'emit');

        textureSource.style.addressModeU = 'repeat';
        textureSource.style.update();

        expect(eventSpy).toHaveBeenCalledWith('styleChange', textureSource);
    });

    it('calling unload on a texture should increment the resourceId to be the next unique id', () =>
    {
        const textureSource = new TextureSource();
        const textureSource2 = new TextureSource();

        const startingId = textureSource._resourceId;

        expect(textureSource2._resourceId).toBe(startingId + 1);

        textureSource.unload();

        expect(textureSource._resourceId).toBe(startingId + 2);
    });

    it('TextureSystem should not re add listeners if a texture is unloaded', async () =>
    {
        const textureSource = new TextureSource();

        const renderer = await getWebGLRenderer();

        renderer.texture.bind(textureSource);

        expect(renderer.texture.managedTextures.length).toBe(2);

        textureSource.unload();

        renderer.texture.bind(textureSource);

        expect(renderer.texture.managedTextures.length).toBe(2);
    });
});
