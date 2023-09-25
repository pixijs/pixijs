import { TextureSource } from '../../../src/rendering/renderers/shared/texture/sources/TextureSource';

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
});
