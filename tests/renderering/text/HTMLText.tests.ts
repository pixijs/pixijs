import { HtmlText } from '../../../src/scene/text-html/HtmlText';

describe('HTMLText', () =>
{
    it('should create an HTMLText element', () =>
    {
        const text = new HtmlText({
            text: 'Hello World',
        });

        expect(text.text).toBe('Hello World');

        text.destroy();
    });
});
