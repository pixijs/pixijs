import { Assets } from '../Assets';
import { basePath, getApp } from '@test-utils';
import { Texture } from '~/rendering';

describe('loadVideo', () =>
{
    beforeAll(async () =>
    {
        jest.setTimeout(10000);
        // we need the app loaded for these tests
        await getApp();
    });

    beforeEach(() =>
    {
        // reset the loader
        Assets.reset();
    });

    it('should load MP4 assets', async () =>
    {
        await Assets.init({
            basePath,
        });

        const video = await Assets.load<Texture>({
            src: 'video/white.mp4',
            data: {
                preload: true,
            },
        });

        expect(video).toBeInstanceOf(Texture);
        expect(video.width).toBe(1);
        expect(video.height).toBe(1);
    });

    it('should load MP4 assets from data URL', async () =>
    {
        let mp4DataURL = `
        data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAABttZGF0AAAAD2WIhAAr//
        712/Msq8Fj/wAAAwZtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAKAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAA
        AAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACMXRyYWsAAABcdGtoZAAAAAMAAAAAAA
        AAAAAAAAEAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAQAAAAEAAA
        AAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAACgAAAAAAAEAAAAAAaltZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAADIAAAACAFXEAA
        AAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAFUbWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAA
        AAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAABFHN0YmwAAACwc3RzZAAAAAAAAAABAAAAoGF2YzEAAAAAAAAAAQ
        AAAAAAAAAAAAAAAAAAAAAAAQABAEgAAABIAAAAAAAAAAEUTGF2YzYwLjMuMTAwIGxpYngyNjQAAAAAAAAAAAAAAAAY//8AAAA2YX
        ZjQwH0AAr/4QAZZ/QACpGbK/CEIQgAAAMACAAAAwGQeJEssAEABmjr48RIRP/4+AAAAAAUYnRydAAAAAAAAA7YAAAO2AAAABhzdH
        RzAAAAAAAAAAEAAAABAAACAAAAABxzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAAUc3RzegAAAAAAAAATAAAAAQAAABRzdGNvAA
        AAAAAAAAEAAAAwAAAAYXVkdGEAAABZbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAsaWxzdAAAAC
        SpdG9vAAAAHGRhdGEAAAABAAAAAExhdmY2MC4zLjEwMA==
        `;

        mp4DataURL = mp4DataURL.replace(/\s/g, '');

        const video = await Assets.load<Texture>({
            src: mp4DataURL,
            data: {
                preload: true,
            },
        });

        expect(video).toBeInstanceOf(Texture);
        expect(video.width).toBe(1);
        expect(video.height).toBe(1);
    });

    it('should load WebM assets', async () =>
    {
        await Assets.init({
            basePath,
        });

        const video = await Assets.load<Texture>({
            src: 'video/white.webm',
            data: {
                preload: true,
            },
        });

        expect(video).toBeInstanceOf(Texture);
        expect(video.width).toBe(1);
        expect(video.height).toBe(1);
    });

    it('should load WebM assets from data URL', async () =>
    {
        let webmDataURL = `
        data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAG9EU2bdLpNu4tTq
        4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEXTbuMU6uEHFO7a1OsggGn7AEAAAAAAABZAAAAAAAAAAAAAAAAA
        AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
        AAVSalmoCrXsYMPQkBNgIRMYXZmV0GETGF2ZkSJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgAAAAAAAAAAZyBACK1nIN1b
        mSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBAbqBAZqBAlWwiFWxgQBVuYECElTDZ9Vzc9JjwItjxYgAAAAAAAAAAWfInEWjh0VOQ
        09ERVJEh49MYXZjIGxpYnZweC12cDlnyKJFo4hEVVJBVElPTkSHlDAwOjAwOjAwLjA0MDAwMDAwMAAAH0O2dbHngQCjrIEAAICiS
        YNC4AAAAAYAOCQcGEoAACAgABG///+mlH/////TSj/////ppQAAHFO7a5G7j7OBALeK94EB8YIBcfCBAw==
        `;

        webmDataURL = webmDataURL.replace(/\s/g, '');

        const video = await Assets.load<Texture>({
            src: webmDataURL,
            data: {
                preload: true,
            },
        });

        expect(video).toBeInstanceOf(Texture);
        expect(video.width).toBe(1);
        expect(video.height).toBe(1);
    });

    it('should destroy texture, base texture, and resource on unload', async () =>
    {
        await Assets.init({
            basePath,
        });

        const video = await Assets.load<Texture>('video/white.mp4');

        await Assets.unload('video/white.mp4');

        expect(video.destroyed).toBeTrue();
        expect(video.source).toBeNull();
    });
});
