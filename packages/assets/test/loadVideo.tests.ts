import { Assets } from '@pixi/assets';
import { BaseTexture, Texture, VideoResource } from '@pixi/core';
import { basePath } from './basePath';

describe('loadVideo', () =>
{
    beforeEach(() =>
    {
        // reset the loader
        Assets.reset();
    });

    it('should load MP4 assets', async () =>
    {
        jest.setTimeout(10000);

        await Assets.init({
            basePath,
        });

        const white = await Assets.load('videos/white.mp4');

        expect(white).toBeInstanceOf(Texture);
        expect(white.width).toBe(1);
        expect(white.height).toBe(1);
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

        // Prevent eslint max-len warning
        mp4DataURL = mp4DataURL.replace(/\s/g, '');

        const mp4 = await Assets.load(mp4DataURL);

        expect(mp4).toBeInstanceOf(Texture);
        expect(mp4.width).toBe(1);
        expect(mp4.height).toBe(1);
    });

    it('should load WebM assets', async () =>
    {
        await Assets.init({
            basePath,
        });

        const white = await Assets.load('videos/white.webm');

        expect(white).toBeInstanceOf(Texture);
        expect(white.width).toBe(1);
        expect(white.height).toBe(1);
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

        // Prevent eslint max-len warning
        webmDataURL = webmDataURL.replace(/\s/g, '');

        const webm = await Assets.load(webmDataURL);

        expect(webm).toBeInstanceOf(Texture);
        expect(webm.width).toBe(1);
        expect(webm.height).toBe(1);
    });

    it('should load Ogv assets', async () =>
    {
        await Assets.init({
            basePath,
        });

        const white = await Assets.load('videos/white.ogv');

        expect(white).toBeInstanceOf(Texture);
        expect(white.width).toBe(1);
        expect(white.height).toBe(1);
    });

    it('should load Ogv assets from data URL', async () =>
    {
        let ogvDataURL = `
        data:video/webm;base64,T2dnUwACAAAAAAAAAAAAAAAAAAAAACNvTl0BKoB0aGVvcmEDAgEAAQABAAABAAABAA8AAAAZAAAAA
        QAAAQAAAQADDUAA2E9nZ1MAAAAAAAAAAAAAAAAAAAEAAABu//fMDi////////////////+QgXRoZW9yYQYAAABmZm1wZWcBAAAAF
        gAAAGVuY29kZXI9TGF2YyBsaWJ0aGVvcmGCdGhlb3Jhvs0o97nNaxi1qUlKEHOc5jGMUpSkIQgxjGIQhCEIQAAAAAAAAAAAABFtr
        lNnksj8VhL8eDlbbOYq9WirVCgTKSRaEP55OZuNZlMJeLJVKZOJJIIZCHw8HY4Go0GAvFYqFAkEYiEIfDwcDIYCwUCIOBUW2uU2e
        SyPxWEvx4OVts5ir1aKtUKBMpJFoQ/nk5m41mUwl4slUpk4kkghkIfDwdjgajQYC8VioUCQRiIQh8PBwMhgLBQIg4FAsPDw8PDw8
        PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDwwMDxIUFBUNDQ4REhUVFA4
        ODxIUFRUVDhARExQVFRUQERQVFRUVFRITFBUVFRUVFBUVFRUVFRUVFRUVFRUVFRAMCxAUGRscDQ0OEhUcHBsODRAUGRwcHA4QExY
        bHR0cERMZHBweHh0UGBscHR4eHRscHR0eHh4eHR0dHR4eHh0QCwoQGCgzPQwMDhMaOjw3Dg0QGCg5RTgOERYdM1dQPhIWJTpEbWd
        NGCM3QFFocVwxQE5XZ3l4ZUhcX2JwZGdjExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExM
        TExMTExMTExMTExMTExISFRkaGhoaEhQWGhoaGhoVFhkaGhoaGhkaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGho
        aGhoREhYfJCQkJBIUGCIkJCQkFhghJCQkJCQfIiQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkERIYL2NjY2M
        SFRpCY2NjYxgaOGNjY2NjL0JjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjYxUVFRUVFRUVFRUVFRUVFRUVFRU
        VFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUSEhIVFxgZGxISFRcYGRscEhUXGBkbHB0VFxgZGxw
        dHRcYGRscHR0dGBkbHB0dHR4ZGxwdHR0eHhscHR0dHh4eERERFBcaHCARERQXGhwgIhEUFxocICIlFBcaHCAiJSUXGhwgIiUlJRo
        cICIlJSUpHCAiJSUlKSogIiUlJSkqKhAQEBQYHCAoEBAUGBwgKDAQFBgcICgwQBQYHCAoMEBAGBwgKDBAQEAcICgwQEBAYCAoMEB
        AQGCAKDBAQEBggIAHxeXHR9XtzsPy+usBpmJ3yFG8HVE3tyzEW6jjfAfuUSRL3BsZL61VI0zK7F2IQJyMHtHUyXzmG1qw2MqlK8+
        3cPyTuIaZldi7EEL5FHhqtQbGS8fnLuYldHtHknCfdVSEGK5qn3VUiuxoIzlNKD2jzruSHAytZjb5w/ivC8EvO3/Ccdph7R51JEx
        gLq1mZTUGu+GS0hR/aBehTxscy7I0DuUHtHnXKbbXewVwUqjAi+JP+LRaxyD7hEO5tf7iFpGwzFlaA3TkrkUPdvOpL1VJUI8zhOl
        azYLjeKEV2BpIHJ4oe7dd//ZMby2CkHs8C06zuOLFZjD4DKjkaNRNLJtf/UpbnZHFh8HycE0sm0eC3gM+roFlYEWmPJlf/UpbkJr
        R687AbURf8D2Pl9CbmE7PpbYK1wJpZNdMUB5k7vVUiAJNfr3L1OJpdqDc6zYRLUNwsrDT/FHkd+cKqSlAXRnWTEo1+FlYvJyaXaR
        524cxCHce5sH+ltRSgIrnDF61lFlY8kX9t3ITbUfZiMw6E/+mS2GopQI4RZWbrz7UnmftqERLmw6Fpk904LmPiRz3UVUiysXyh97
        4Daif/XpnhGIpBlwxTc2i4703hgC+tZqIDqHht8uqFOK1uecnaI9JVE0kf5pkYT5hfOrsCH86dxbYrn0ApqaWhw5RhNK9ok81yMN
        8wauYb2k5XYxuAj2/cHcQJntEsnnVSnMyfQLWG4Dzs2Cib2WSJrDe3nK8VmYOXUemS4/4+KqVrCAPr2MBPk3GvaLpzCLK1zAeErY
        om9kj0LWb/hVSKXxG87/J3GaCwV3N2AakxtR7LJE06LWTmExvqFVIy5Os4T/G4OEYTFDbX2XTuxXaQbl84SeRYfCCpSRu8LQ/YpP
        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
        `;

        // Prevent eslint max-len warning
        ogvDataURL = ogvDataURL.replace(/\s/g, '');

        const ogv = await Assets.load(ogvDataURL);

        expect(ogv).toBeInstanceOf(Texture);
        expect(ogv.width).toBe(1);
        expect(ogv.height).toBe(1);
    });

    it('should destroy texture, base texture, and resource on unload', async () =>
    {
        await Assets.init({
            basePath,
        });

        const texture = await Assets.load('videos/white.mp4');

        expect(texture).toBeInstanceOf(Texture);
        expect(texture.width).toBe(1);
        expect(texture.height).toBe(1);

        const baseTexture = texture.baseTexture;

        expect(baseTexture).toBeInstanceOf(BaseTexture);

        const resource = baseTexture.resource;

        expect(resource).toBeInstanceOf(VideoResource);

        await Assets.unload('videos/white.mp4');

        expect(texture.baseTexture).toBeNull();
        expect(baseTexture.destroyed).toBeTrue();
        expect(resource.destroyed).toBeTrue();
    });
});
