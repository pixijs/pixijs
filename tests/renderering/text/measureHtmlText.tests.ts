import { CanvasTextMetrics } from '../../../src/scene/text/canvas/CanvasTextMetrics';
import { HTMLTextStyle } from '../../../src/scene/text-html/HtmlTextStyle';
import { measureHtmlText } from '../../../src/scene/text-html/utils/measureHtmlText';

describe('measureHtmlText', () =>
{
    it('should measure default text', () =>
    {
        const style = new HTMLTextStyle();
        const size = measureHtmlText('Hello World', style);

        expect(size).toBeTruthy();
        expect(size.width).toBeGreaterThan(0);
        expect(size.height).toBeGreaterThan(0);
    });

    it('should measure empty text to be drawable', () =>
    {
        const style = new HTMLTextStyle();
        const size = measureHtmlText('', style);

        const descent = CanvasTextMetrics.measureFont(style.fontStyle).descent;

        expect(size).toBeTruthy();
        expect(size.width).toBe(0);
        expect(size.height).toBe(descent);
    });
});
