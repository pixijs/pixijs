import { loadFontCSS } from '../utils/loadFontCSS';
import { basePath } from '@test-utils';

describe('loadFontCSS', () =>
{
    it('should load a font', async () =>
    {
        const css = await loadFontCSS({
            fontFamily: 'Herborn',
            fontWeight: 'normal',
            fontStyle: 'normal',
        }, `${basePath}fonts/Herborn.ttf`);

        expect(css).toBeTruthy();
        expect(css).toContain('Herborn');
        expect(css).toContain(`url('data:`);
    });

    it('should load a font with variants', async () =>
    {
        const css = await loadFontCSS({
            fontFamily: 'Herborn',
            fontWeight: 'bold',
            fontStyle: 'italic',
        }, `${basePath}fonts/Herborn.ttf`);

        expect(css).toBeTruthy();
        expect(css).toContain('Herborn');
        expect(css).toContain(`font-weight: bold`);
        expect(css).toContain(`font-style: italic`);
    });
});
