import { HTMLTextSystem } from '../HTMLTextSystem';
import { loadSVGImage } from '../utils/loadSVGImage';

import type { ImageLike } from '~/environment';

function createImage()
{
    const image = {} as ImageLike;

    let src = '';

    Object.defineProperty(image, 'src', {
        get: () => src,
        set: (value: string) =>
        {
            src = value;
            setTimeout(image.onload as () => void, 0);
        },
    });

    return image;
}

async function getLoadTime(delay: boolean | number)
{
    const start = performance.now();

    await loadSVGImage(createImage(), '<svg></svg>', delay);

    return performance.now() - start;
}

describe('loadSVGImage', () =>
{
    it('should not wait without a delay', async () =>
    {
        expect(await getLoadTime(false)).toBeLessThan(50);
        expect(await getLoadTime(0)).toBeLessThan(50);
    });

    it('should wait 100ms when delay is true', async () =>
    {
        expect(await getLoadTime(true)).toBeGreaterThanOrEqual(95);
    });

    it('should wait the given number of milliseconds', async () =>
    {
        const time = await getLoadTime(150);

        expect(time).toBeGreaterThanOrEqual(145);
    });
});

describe('HTMLTextSystem', () =>
{
    it('should default safariFontDelay to 100', () =>
    {
        const system = new HTMLTextSystem({} as any);

        system.init({});

        expect(system.safariFontDelay).toBe(100);
    });

    it('should take safariFontDelay from the options', () =>
    {
        const system = new HTMLTextSystem({} as any);

        system.init({ safariFontDelay: 0 });

        expect(system.safariFontDelay).toBe(0);
    });
});
