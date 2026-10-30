import { Texture } from '../../shared/texture/Texture';
import { describeLocalOnly, getWebGPURenderer, loseAndRestoreDevice, nextTick, wait } from '@test-utils';
import { DOMAdapter } from '~/environment';
import { Sprite } from '~/scene';

import type { WebGPURenderer } from '../WebGPURenderer';

describeLocalOnly('GpuDeviceSystem', () =>
{
    let renderer: WebGPURenderer;

    beforeEach(async () =>
    {
        renderer = await getWebGPURenderer({ width: 64, height: 64 });
    });

    afterEach(() =>
    {
        renderer?.destroy();
    });

    describe('device loss', () =>
    {
        it('should render the same scene after the device is lost', async () =>
        {
            const sprite = new Sprite({ texture: Texture.WHITE, width: 32, height: 32, tint: 0xff0000 });

            renderer.render(sprite);

            const before = renderer.extract.pixels(sprite).pixels;

            expect(before.some((value) => value > 0)).toBe(true);

            await loseAndRestoreDevice(renderer);

            renderer.render(sprite);

            expect(renderer.extract.pixels(sprite).pixels).toEqual(before);
        });

        it('should destroy the device it created with the renderer, without requesting another', async () =>
        {
            const { device } = renderer.gpu;
            const requestAdapter = jest.spyOn(navigator.gpu, 'requestAdapter');

            renderer.destroy();
            renderer = null;

            await expect(device.lost).resolves.toMatchObject({ reason: 'destroyed' });
            await nextTick();

            expect(requestAdapter).not.toHaveBeenCalled();
            requestAdapter.mockRestore();
        });

        it('should leave a shared device alone when the renderer is destroyed', async () =>
        {
            const { device } = renderer.gpu;
            const sharing = await getWebGPURenderer({ width: 64, height: 64, gpu: renderer.gpu });
            let lost = false;

            void device.lost.then(() => { lost = true; });

            sharing.destroy();
            await wait(100);

            expect(lost).toBe(false);
        });
    });

    describe('tileBased', () =>
    {
        it('should be true only for tile-based GPU vendors', async () =>
        {
            const { device } = renderer.gpu;
            const cases: [string | undefined, boolean][] = [
                ['apple', true], ['arm', true], ['qualcomm', true], ['img-tec', true],
                ['intel', false], ['nvidia', false], ['amd', false], ['', false], [undefined, false],
            ];

            for (const [vendor, tileBased] of cases)
            {
                const adapter = { info: vendor === undefined ? undefined : { vendor } } as unknown as GPUAdapter;
                const sharing = await getWebGPURenderer({ width: 64, height: 64, gpu: { adapter, device } });

                expect(sharing.device.extensions.tileBased).toBe(tileBased);

                sharing.destroy();
            }
        });
    });

    describe('transientAttachment', () =>
    {
        const safari = (version: string) => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 '
            + `(KHTML, like Gecko) Version/${version} Safari/605.1.15`;
        const chrome = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
            + 'Chrome/156.0.0.0 Safari/537.36';
        const wkWebView = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 '
            + '(KHTML, like Gecko) Mobile/15E148';

        it('should follow the browser exposing the bit, except on WebKit from Safari 27.1 until 28', async () =>
        {
            const { adapter, device } = renderer.gpu;
            const exposed = typeof (GPUTextureUsage as { TRANSIENT_ATTACHMENT?: number }).TRANSIENT_ATTACHMENT === 'number';
            const navigator = DOMAdapter.get().getNavigator();
            const cases: [string, boolean][] = [
                [chrome, exposed], [safari('27.0.1'), exposed], [safari('27.2'), false], [wkWebView, false],
                [safari('28.0'), exposed],
            ];

            for (const [userAgent, transient] of cases)
            {
                const spy = jest.spyOn(DOMAdapter.get(), 'getNavigator')
                    .mockReturnValue({ ...navigator, gpu: navigator.gpu, userAgent });
                const sharing = await getWebGPURenderer({ width: 64, height: 64, gpu: { adapter, device } });

                expect(sharing.device.extensions.transientAttachment).toBe(transient);

                sharing.destroy();
                spy.mockRestore();
            }
        });
    });
});
