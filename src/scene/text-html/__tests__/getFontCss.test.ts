import { HTMLTextStyle } from '../HTMLTextStyle';
import { getFontCss } from '../utils/getFontCss';
import { basePath, getApp } from '@test-utils';
import { Assets } from '~/assets';

describe('getFontCss', () =>
{
    beforeAll(async () =>
    {
        await getApp();

        await Assets.load(`${basePath}fonts/outfit.woff2`);
    });

    it('should load a font and return css string', async () =>
    {
        const fontFamily = ['Outfit'];
        const style = new HTMLTextStyle({
            fontFamily,
        });
        const css = await getFontCss(
            fontFamily,
            style,
            HTMLTextStyle.defaultTextStyle as {fontWeight: string, fontStyle: string}
        );

        expect(css).toContain('@font-face');
        expect(css).toContain('font-family: "Outfit"');
        expect(css).toContain(`url('data:`);
        expect(css).toContain('font-weight: normal');
        expect(css).toContain('font-style: normal');
    });
});

