import { HTMLText } from '../HTMLText';
import { getWebGLRenderer } from '@test-utils';

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

    it('should measure an HTMLText and not include padding in its bounds', () =>
    {
        const text = new HTMLText({
            text: 'Hello World',
            style: {
                padding: 100
            }
        });

        // using less than as im sure we will encounter variance on different computers!
        expect(text.width).toBeLessThan(135);
        expect(text.height).toBeLessThan(35);

        text.destroy();
    });

    it('should handle resolution changes after html text destruction', async () =>
    {
        const text = new HTMLText({ text: 'foo' });

        const renderer = await getWebGLRenderer();

        renderer.render(text);

        text.destroy();

        expect(() => { renderer.resolution = 3; }).not.toThrow();

        renderer.destroy();
    });
});
