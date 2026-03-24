import { BindGroup } from '../../../gpu/shader/BindGroup';
import { TextureSource } from '../sources/TextureSource';
import { TextureView } from '../TextureView';

describe('TextureView', () =>
{
    it('should correctly proxy change events from the underlying source', () =>
    {
        const source = new TextureSource();
        const textureView = new TextureView(source, { aspect: 'depth-only' });

        const spy = jest.fn();

        textureView.on('change', spy);

        source.emit('change');

        expect(spy).toHaveBeenCalledWith(textureView);

        textureView.destroy();
    });

    it('should correctly proxy destroy events from the underlying source', () =>
    {
        const source = new TextureSource();
        const textureView = new TextureView(source, { aspect: 'depth-only' });

        const spy = jest.fn();

        textureView.on('destroy', spy);

        source.destroy();

        expect(spy).toHaveBeenCalledWith(textureView);
        expect(textureView.destroyed).toBe(true);
    });

    it('should interact correctly with BindGroup', () =>
    {
        const source = new TextureSource();
        const textureView = new TextureView(source, { aspect: 'stencil-only' });

        const bindGroup = new BindGroup({
            0: textureView,
        });

        expect(bindGroup.resources[0]).toBe(textureView);

        // BindGroup should not be dirty after initial key generation
        bindGroup['_key'];
        expect(bindGroup['_dirty']).toBe(false);

        // Triggering a change on the source should propagate and dirty the bind group
        source.emit('change', source);

        expect(bindGroup['_dirty']).toBe(true);

        bindGroup.destroy();
        textureView.destroy();
        source.destroy();
    });
});
