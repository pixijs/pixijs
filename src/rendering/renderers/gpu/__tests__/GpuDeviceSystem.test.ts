import { Texture } from '../../shared/texture/Texture';
import { describeLocalOnly, getWebGPURenderer, loseAndRestoreDevice, nextTick, wait } from '@test-utils';
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
});
