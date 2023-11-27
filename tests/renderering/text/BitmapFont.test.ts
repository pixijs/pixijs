import { BitmapFontManager } from '../../../src/scene/text/bitmap/BitmapFontManager';
import { detectRenderType } from '../../../src/scene/text/utils/detectRenderType';

describe('BitmapFont', () =>
{
    it('should install a font and be accessible', async () =>
    {
        BitmapFontManager.install('cool-font', {
            fontFamily: 'Arial',
        }, { resolution: 2, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' });

        const type = detectRenderType({
            fontFamily: 'cool-font',
        });

        expect(type).toEqual('bitmap');
    });
});
