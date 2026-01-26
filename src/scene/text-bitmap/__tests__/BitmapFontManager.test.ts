import { TextStyle } from '../../text/TextStyle';
import { BitmapFontManager } from '../BitmapFontManager';
import { Cache } from '~/assets';

import type { BitmapFont } from '../BitmapFont';

describe('BitmapFontManager', () =>
{
    it('should install a font and be accessible', async () =>
    {
        BitmapFontManager.install('cool-font', {
            fontFamily: 'Arial',
        }, { resolution: 2, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' });

        const bitmapFont = Cache.get<BitmapFont>('cool-font-bitmap');

        expect(bitmapFont).toBeDefined();
    });

    it('should uninstall and remove from Cache if char is empty', () =>
    {
        BitmapFontManager.install('foo', {}, { chars: ' ' });
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeDefined();

        BitmapFontManager.uninstall('foo');
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeUndefined();
    });

    it('should uninstall and remove from Cache', () =>
    {
        BitmapFontManager.install('foo', {}, { chars: 'a' });
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeDefined();

        BitmapFontManager.uninstall('foo');
        expect(Cache.get<BitmapFont>('foo-bitmap')).toBeUndefined();
    });

    it('should return layout for text containing emoji', () =>
    {
        const layout = BitmapFontManager.getLayout('foo👍', new TextStyle());

        expect(layout).toBeDefined();
    });

    it('should measure trailing whitespaces when trimEnd is disabled', () =>
    {
        const layout = BitmapFontManager.getLayout('foo', new TextStyle());
        const layoutTrimmed = BitmapFontManager.getLayout('foo    ', new TextStyle());
        const layoutUntrimmed = BitmapFontManager.getLayout('foo    ', new TextStyle(), false);

        expect(layoutTrimmed.width).toEqual(layout.width);
        expect(layoutUntrimmed.width).toBeGreaterThan(layout.width);
    });

    it('should not leak fonts when style with stroke is mutated', () =>
    {
        const style = new TextStyle({ fontFamily: 'Arial', stroke: { color: 'black', width: 2 } });

        // First call creates a font
        const font1 = BitmapFontManager.getFont('A', style);

        // Mutate an unrelated property (wordWrap does not affect the stroke/fill visual key)
        style.wordWrap = true;

        // Second call should reuse the same font (same visual properties)
        const font2 = BitmapFontManager.getFont('A', style);

        expect(font2).toBe(font1);
    });

    it('should create a new font when a visual property changes', () =>
    {
        const style = new TextStyle({ fontFamily: 'Arial', stroke: { color: 'black', width: 2 } });

        const font1 = BitmapFontManager.getFont('A', style);

        // Changing stroke width is a visual property — should produce a different font
        style.stroke = { color: 'black', width: 4 };

        const font2 = BitmapFontManager.getFont('A', style);

        expect(font2).not.toBe(font1);
    });

    it('should not leak fonts when style with dropShadow is mutated', () =>
    {
        const style = new TextStyle({
            fontFamily: 'Arial',
            dropShadow: { alpha: 1, angle: 0.5, blur: 2, distance: 3, color: 'black' },
        });

        const font1 = BitmapFontManager.getFont('A', style);

        // Mutate a non-visual property
        style.wordWrap = true;

        const font2 = BitmapFontManager.getFont('A', style);

        expect(font2).toBe(font1);
    });

    it('should share fonts across different style instances with identical visuals', () =>
    {
        const style1 = new TextStyle({ fontFamily: 'Arial', stroke: { color: 'black', width: 2 } });
        const style2 = new TextStyle({ fontFamily: 'Arial', stroke: { color: 'black', width: 2 } });

        const font1 = BitmapFontManager.getFont('A', style1);
        const font2 = BitmapFontManager.getFont('A', style2);

        expect(font2).toBe(font1);
    });
});
