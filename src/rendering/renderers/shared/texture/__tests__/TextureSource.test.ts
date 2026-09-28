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

    describe('shape', () =>
    {
        it.each([
            [{}, '2d', '2d', 1, 1],
            [{ depth: 8 }, '3d', '3d', 1, 8],
            [{ arrayLayerCount: 4 }, '2d', '2d-array', 4, 1],
            [{ arrayLayerCount: 6, viewDimension: 'cube' }, '2d', 'cube', 6, 1],
            [{ depth: 8, viewDimension: '3d' }, '3d', '3d', 1, 8],
            [{ depth: 0 }, '2d', '2d', 1, 1],
        ] as const)('should derive the dimensions from %j', (options, dimension, viewDimension, arrayLayerCount, depth) =>
        {
            const source = new TextureSource(options);

            expect(source.dimension).toBe(dimension);
            expect(source.viewDimension).toBe(viewDimension);
            expect(source.arrayLayerCount).toBe(arrayLayerCount);
            expect(source.depth).toBe(depth);
            expect(source.depthOrArrayLayers).toBe(dimension === '3d' ? depth : arrayLayerCount);
        });

        it('should reject depth combined with array layers', () =>
        {
            // @ts-expect-error - a texture is 3D or layered, never both
            expect(() => new TextureSource({ depth: 4, arrayLayerCount: 2 })).toThrow('can\'t be combined');
            // @ts-expect-error - depth makes a 3D view
            expect(() => new TextureSource({ depth: 4, viewDimension: '2d-array' })).toThrow('depth makes a 3D texture');
        });

        it('should reject array layers on a 3D view', () =>
        {
            expect(() => new TextureSource({ viewDimension: '3d', arrayLayerCount: 2 })).toThrow(/takes depth/);
        });

        it('should reject antialias on a 3D texture', () =>
        {
            // @ts-expect-error - a 3D texture can't be multisampled
            expect(() => new TextureSource({ depth: 4, antialias: true })).toThrow('can\'t be antialiased');

            expect(new TextureSource({ depth: 4 }).antialias).toBe(false);
            expect(new TextureSource({ depth: 4, antialias: false }).antialias).toBe(false);
        });

        it('should reject a depth-buffer boolean passed as depth', () =>
        {
            // @ts-expect-error - depth is a number of texels, not the render target's depth buffer flag
            expect(() => new TextureSource({ depth: true })).toThrow('For a depth buffer');
        });

        it('should reject a dimensions option that disagrees with the view', () =>
        {
            expect(() => new TextureSource({ dimensions: '2d', depth: 4 })).toThrow('doesn\'t match viewDimension');
            expect(new TextureSource({ dimensions: '3d', depth: 4 }).dimension).toBe('3d');
            expect(new TextureSource({ dimensions: '2d' }).dimension).toBe('2d');
        });
    });
});
