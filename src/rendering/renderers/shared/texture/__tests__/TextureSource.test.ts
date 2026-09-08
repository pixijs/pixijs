import { TextureSource } from '../sources/TextureSource';
import { getWebGLRenderer } from '@test-utils';

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

        expect(Object.keys(renderer.texture['_managedTextures'].items).length).toBe(2);

        textureSource.unload();

        renderer.texture.bind(textureSource);

        expect(Object.keys(renderer.texture['_managedTextures'].items).length).toBe(2);
    });

    it('expect label to be set form constructor', () =>
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

    it('should destroy the style it created itself', () =>
    {
        const source = new TextureSource();
        const ownStyle = source.style;

        source.destroy();

        expect(ownStyle.destroyed).toBe(true);
    });

    it('should not destroy a shared style assigned from outside', () =>
    {
        // the TexturePool pattern: many sources share one style instance
        const sourceA = new TextureSource();
        const sourceB = new TextureSource();
        const sharedStyle = sourceB.style;

        sourceA.style = sharedStyle;
        sourceA.destroy();

        // the shared style must survive sourceA — sourceB still uses it
        expect(sharedStyle.destroyed).toBe(false);
        expect(sourceB.style).toBe(sharedStyle);
    });
});
