import '~/environment-browser/browserAll';
import { CanvasTextGenerator } from '~/scene/text/canvas/CanvasTextGenerator';
import { TextStyle } from '~/scene/text/TextStyle';

import type { TextStyleOptions } from '~/scene/text/TextStyle';

describe('CanvasTextGenerator', () =>
{
    const boldTags: Record<string, TextStyleOptions> = { b: { fontWeight: 'bold' } };

    const render = (text: string, resolution: number, tagStyles?: Record<string, TextStyleOptions>) =>
    {
        const style = new TextStyle({
            fontSize: 100,
            fill: '#ffffff',
            stroke: { color: '#ffff00', width: 10 },
            dropShadow: { color: '#ff0000', alpha: 1, blur: 0, distance: 13, angle: Math.PI / 4 },
            tagStyles,
        });
        const { canvasAndContext } = CanvasTextGenerator.getCanvasAndContext({ text, style, resolution });
        const { canvas, context } = canvasAndContext;
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

        CanvasTextGenerator.returnCanvasAndContext(canvasAndContext);

        let black = 0;
        let red = 0;

        for (let i = 0; i < data.length; i += 4)
        {
            const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];

            if (a <= 128) continue;
            if (r < 64 && g < 64 && b < 64) black++;
            if (r > 192 && g < 64 && b < 64) red++;
        }

        return { black, red };
    };

    // the hidden copy that casts the shadow is drawn in black, so black pixels mean it reached the canvas
    it.each([
        ['plain', 0.25, 'YEAH,', undefined],
        ['tagged', 0.25, '<b>YEAH</b>,', boldTags],
        ['plain', 2, 'YEAH,', undefined],
    ])('should keep the hidden shadow copy of %s text off the canvas at resolution %s', (_, resolution, text, tagStyles) =>
    {
        const { black, red } = render(text, resolution, tagStyles);

        expect(black).toBe(0);
        expect(red).toBeGreaterThan(0);
    });
});
