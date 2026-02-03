import { createStringVariations } from '../createStringVariations';

describe('createStringVariations', () =>
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
});
