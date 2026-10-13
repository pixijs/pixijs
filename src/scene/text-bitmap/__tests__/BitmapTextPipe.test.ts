import { BitmapTextPipe } from '../GpuBitmapTextPipe';

import type { BitmapText } from '../BitmapText';
import type { Renderer } from '~/rendering/renderers/types';

describe('BitmapTextPipe', () =>
{
    function setup(graphicsNeedsRebuild: boolean)
    {
        const validateGraphics = jest.fn((): boolean => graphicsNeedsRebuild);
        const renderer = {
            uid: 1,
            gc: { addResourceHash: jest.fn(), now: 0 },
            renderPipes: { graphics: { validateRenderable: validateGraphics } },
        } as unknown as Renderer;
        const pipe = new BitmapTextPipe(renderer);

        // the proxy graphics is only handed to the graphics pipe here
        (pipe as any)._getGpuBitmapText = jest.fn(() => ({}));

        return { pipe, validateGraphics };
    }

    it('should ask for a rebuild when the text changed, as the glyphs are rebuilt in addRenderable', () =>
    {
        const { pipe } = setup(false);

        expect(pipe.validateRenderable({ _didTextUpdate: true } as BitmapText)).toBe(true);
    });

    it('should defer to the graphics pipe when the text did not change', () =>
    {
        const { pipe, validateGraphics } = setup(false);

        expect(pipe.validateRenderable({ _didTextUpdate: false } as BitmapText)).toBe(false);
        expect(validateGraphics).toHaveBeenCalledTimes(1);
    });
});
