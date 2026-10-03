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

        const entry = {} as BindGroup['_gpuEntry'];

        bindGroup._gpuEntry = entry;

        // Triggering a change on the source should propagate and make the bind group resolve again
        source.emit('change', source);

        expect(bindGroup._gpuEntry).toBeNull();

        bindGroup.destroy();
        textureView.destroy();
        source.destroy();
    });
});
