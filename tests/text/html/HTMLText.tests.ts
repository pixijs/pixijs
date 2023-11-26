import { Text } from '../../../src/scene/text/Text';

describe('HTMLText', () =>
{
    it('should create an HTMLText element', () =>
    {
        const text = new Text({
            text: 'Hello World',
            renderMode: 'html',
        });

        expect(text.text).toBe('Hello World');

        text.destroy();
    });
});
