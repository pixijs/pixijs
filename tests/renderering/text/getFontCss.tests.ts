import { Assets } from '../../../src/assets/Assets';
import { HTMLTextStyle } from '../../../src/scene/text-html/HtmlTextStyle';
import { getFontCss } from '../../../src/scene/text-html/utils/getFontCss';
import { basePath } from '../../assets/basePath';
import { getApp } from '../../utils/getApp';

describe('getFontCss', () =>
{
    beforeAll(async () =>
    {
        await getApp();

        await Assets.load(`${basePath}fonts/font.fnt`);
    });

    it('should load a font and return css string', async () =>
    {
        const fontFamily = ['font-bitmap'];
        const style = new HTMLTextStyle({
            fontFamily,
        });
        const css = await getFontCss(fontFamily, style);

        expect(css).toContain('@font-face');
        expect(css).toContain('font-family: "font-bitmap"');
        expect(css).toContain(`url('data:`);
        expect(css).toContain('font-weight: normal');
        expect(css).toContain('font-style: normal');
    });
});

