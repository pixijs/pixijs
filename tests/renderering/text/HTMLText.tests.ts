import { HTMLText } from '../../../src/scene/text-html/HTMLText';

describe('HTMLText', () =>
{
    it('should create an HTMLText element', () =>
    {
        const text = new HTMLText({
            text: 'Hello World',
        });

        expect(text.text).toBe('Hello World');

        text.destroy();
    });
});
