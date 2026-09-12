import { getWebGLRenderer } from '@test-utils';
import { extensions, ExtensionType } from '~/extensions';

class LoaderTestSystem
{
    public static extension = {
        type: ExtensionType.WebGLSystem,
        name: 'loaderTestSystem',
    };

    public destroy(): void
    {
        // nothing to release
    }
}

const webglLoader = {
    extension: { type: ExtensionType.WebGLLoader, name: 'loaderTest' },
    load: jest.fn(async () =>
    {
        extensions.add(LoaderTestSystem);
    }),
};

const webgpuLoader = {
    extension: { type: ExtensionType.WebGPULoader, name: 'loaderTest' },
    load: jest.fn(() => Promise.resolve()),
};

describe('RendererLoader', () =>
{
    beforeEach(() =>
    {
        webglLoader.load.mockClear();
        webgpuLoader.load.mockClear();
        extensions.add(webglLoader, webgpuLoader);
    });

    afterEach(() =>
    {
        extensions.remove(webglLoader, webgpuLoader, LoaderTestSystem);
    });

    it('should await WebGL loaders before adding systems', async () =>
    {
        const renderer = await getWebGLRenderer();

        expect(webglLoader.load).toHaveBeenCalledTimes(1);
        expect((renderer as any).loaderTestSystem).toBeInstanceOf(LoaderTestSystem);

        renderer.destroy();
    });

    it('should not run loaders registered for another renderer', async () =>
    {
        const renderer = await getWebGLRenderer();

        expect(webgpuLoader.load).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('should skip loaders when skipExtensionImports is true', async () =>
    {
        const renderer = await getWebGLRenderer({ skipExtensionImports: true });

        expect(webglLoader.load).not.toHaveBeenCalled();
        expect((renderer as any).loaderTestSystem).toBeUndefined();

        renderer.destroy();
    });
});
