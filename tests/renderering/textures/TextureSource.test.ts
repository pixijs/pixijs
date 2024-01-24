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

    it('expect lable to be set form constructor', () =>
    {
        const textureSource = new TextureSource({ label: 'test' });

        expect(textureSource.label).toBe('test');
    });

    it('calling update should cause a resize event to be fired if the resource has changed size', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 1;
        canvas.height = 1;

        const textureSource = new TextureSource({
            resource: canvas,
        });

        const eventSpy = jest.spyOn(textureSource, 'emit');

        textureSource.update();

        expect(eventSpy).toHaveBeenCalledWith('update', textureSource);
        expect(eventSpy).not.toHaveBeenCalledWith('resize', textureSource);

        canvas.width = 2;
        canvas.height = 2;

        textureSource.update();

        expect(eventSpy).toHaveBeenCalledWith('resize', textureSource);
        expect(eventSpy).toHaveBeenNthCalledWith(1, 'update', textureSource);
    });
});
