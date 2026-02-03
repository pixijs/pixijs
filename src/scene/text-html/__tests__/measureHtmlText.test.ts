import { HTMLTextStyle } from '../HTMLTextStyle';
import { measureHtmlText } from '../utils/measureHtmlText';

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

        expect(size).toBeTruthy();
        expect(size.width).toBe(0);
        expect(size.height).toBe(0);
    });
});
