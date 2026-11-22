import { Loader } from '../Loader';
import { loadTextures } from '../parsers/textures/loadTextures';
import { WorkerManager } from '../workers/WorkerManager';
import { basePath } from '@test-utils';

import type { Texture } from '~/rendering';

describe('WorkerManager', () =>
{
    const OriginalWorker = globalThis.Worker;
    let frame: HTMLIFrameElement;

    function loadBunny(): Promise<Texture>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadTextures);

        return loader.load<Texture>(`${basePath}textures/bunny.png`);
    }

    afterEach(() =>
    {
        globalThis.Worker = OriginalWorker;
        frame?.remove();
        frame = undefined;
        jest.restoreAllMocks();
        WorkerManager['_isImageBitmapSupported'] = undefined;
    });

    it('should load images without a worker when the page CSP blocks blob workers', async () =>
    {
        frame = document.createElement('iframe');
        frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'">`;

        await new Promise((resolve) =>
        {
            frame.addEventListener('load', resolve);
            document.body.appendChild(frame);
        });

        // A CSP can't be lifted from this window once set, so borrow the Worker of a frame that has one.
        globalThis.Worker = (frame.contentWindow as Window & typeof globalThis).Worker;

        const texture = await loadBunny();

        expect(texture.source.resource).toBeInstanceOf(ImageBitmap);
        expect(texture.width).toBe(26);
        await expect(WorkerManager.isImageBitmapSupported()).resolves.toBe(false);
    });

    it('should load images without a worker when the check worker script fails to load', async () =>
    {
        const revokedUrl = URL.createObjectURL(new Blob(['']));

        URL.revokeObjectURL(revokedUrl);

        // The failure has to arrive as an 'error' event, not as a throw from the constructor.
        expect(() => new Worker(revokedUrl).terminate()).not.toThrow();

        jest.spyOn(URL, 'createObjectURL').mockReturnValueOnce(revokedUrl);

        const texture = await loadBunny();

        expect(texture.source.resource).toBeInstanceOf(ImageBitmap);
        expect(texture.width).toBe(26);
        await expect(WorkerManager.isImageBitmapSupported()).resolves.toBe(false);
    });

    it('should report ImageBitmap support when the check worker starts', async () =>
    {
        await expect(WorkerManager.isImageBitmapSupported()).resolves.toBe(true);
    });
});
