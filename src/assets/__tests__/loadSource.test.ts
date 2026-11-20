import { AssetsClass } from '../Assets';

describe('Assets.load source handling', () =>
{
    it('should explain that a new asset needs a source', async () =>
    {
        const assets = new AssetsClass();

        await expect(assets.load({ alias: 'unregistered' })).rejects.toThrow(
            '[Assets] An asset without a src must use registered aliases.',
        );
    });

    it('should load an already registered alias without a source', async () =>
    {
        const assets = new AssetsClass();
        const src = 'https://example.com/registered.txt';
        const load = jest.fn(async () => 'loaded');

        assets.loader.parsers.push({ id: 'text-test', test: () => true, load });
        assets.add({ alias: 'registered', src });

        await expect(assets.load({ alias: 'registered' })).resolves.toBe('loaded');
        expect(load).toHaveBeenCalledWith(src, expect.objectContaining({ src }), assets.loader);
    });
});
