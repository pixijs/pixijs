import { createStringVariations, makeAbsoluteUrl, removeUrlParams } from '@pixi/assets';

describe('Utils', () =>
{
    it('createStringVariations should parse correctly', () =>
    {
        const out = createStringVariations('hell@{2,1,0.5}x.{png,webp,avif}');

        expect(out).toEqual([
            'hell@2x.png',
            'hell@2x.webp',
            'hell@2x.avif',
            'hell@1x.png',
            'hell@1x.webp',
            'hell@1x.avif',
            'hell@0.5x.png',
            'hell@0.5x.webp',
            'hell@0.5x.avif',
        ]);

        const out2 = createStringVariations('name is {chicken,wolf,sheep}');

        expect(out2).toEqual([
            'name is chicken',
            'name is wolf',
            'name is sheep',
        ]);

        const out3 = createStringVariations('hell@2x.png');

        expect(out3).toEqual([
            'hell@2x.png',
        ]);
    });

    it('should create absolute urls', () =>
    {
        const b1 = 'http://example.com/page-1/';
        const b2 = 'https://example.com/page-1/';
        const b3 = 'http://example.com';
        const b4 = 'https://example.com';

        expect(makeAbsoluteUrl('browser.png', b1, b3)).toEqual(`${b1}browser.png`);
        expect(makeAbsoluteUrl('browser.png', b2, b3)).toEqual(`${b2}browser.png`);
        expect(makeAbsoluteUrl('/browser.png', b1, b3)).toEqual(`${b3}/browser.png`);
        expect(makeAbsoluteUrl('/browser.png', b2, b4)).toEqual(`${b4}/browser.png`);

        // url is already absolute
        expect(makeAbsoluteUrl('http://examples.com/browser.png', b2, b4)).toEqual(`http://examples.com/browser.png`);
    });

    it('should strip away url params', () =>
    {
        expect(removeUrlParams('http://example.com/page-1/index.html?a=1&b=2')).toEqual('http://example.com/page-1/');
    });
});
