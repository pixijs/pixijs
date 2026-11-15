import type { Adapter } from '~/environment';

const SAFARI_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 '
    + '(KHTML, like Gecko) Version/18.0 Safari/605.1.15';

describe('glUploadVideoResource', () =>
{
    // start from a fresh module registry, so the uploader's module-level code runs again
    // while we watch the adapter
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should not read the navigator when the module is imported', async () =>
    {
        const { DOMAdapter } = await import('~/environment/adapter');
        const getNavigator = jest.spyOn(DOMAdapter.get(), 'getNavigator');

        try
        {
            await import('../uploaders/glUploadVideoResource');

            expect(getNavigator).not.toHaveBeenCalled();
        }
        finally
        {
            getNavigator.mockRestore();
        }
    });

    it('should use the adapter set after import to pick the default forceAllocation', async () =>
    {
        const { DOMAdapter } = await import('~/environment/adapter');
        const { glUploadVideoResource } = await import('../uploaders/glUploadVideoResource');
        const { glUploadImageResource } = await import('../uploaders/glUploadImageResource');
        const original = DOMAdapter.get();

        DOMAdapter.set({
            ...original,
            getNavigator: () => ({ userAgent: SAFARI_UA, gpu: null }),
        } as Adapter);

        const upload = jest.spyOn(glUploadImageResource, 'upload').mockImplementation(() => undefined);

        try
        {
            const source = { isValid: true } as any;

            glUploadVideoResource.upload(source, {} as any, {} as any, 2);
            glUploadVideoResource.upload(source, {} as any, {} as any, 2, undefined, false);

            expect(upload).toHaveBeenNthCalledWith(1, source, {}, {}, 2, undefined, true);
            expect(upload).toHaveBeenNthCalledWith(2, source, {}, {}, 2, undefined, false);
        }
        finally
        {
            upload.mockRestore();
            DOMAdapter.set(original);
        }
    });
});
