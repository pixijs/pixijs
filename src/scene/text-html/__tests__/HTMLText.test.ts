import { HTMLText } from '../HTMLText';
import { getWebGLRenderer } from '@test-utils';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';

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

    it('should release the previous texture using the previous style key after resolution updates', async () =>
    {
        const text = new HTMLText({ text: 'foo' });

        const renderer = await getWebGLRenderer();
        const htmlTextPipe = renderer.renderPipes.htmlText as any;

        const getTexturePromiseSpy = jest.spyOn(renderer.htmlText, 'getTexturePromise')
            .mockResolvedValueOnce(Texture.EMPTY)
            .mockResolvedValueOnce(Texture.WHITE);
        const decreaseReferenceCountSpy = jest.spyOn(renderer.htmlText, 'decreaseReferenceCount')
            .mockImplementation(() => undefined);
        const returnTexturePromiseSpy = jest.spyOn(renderer.htmlText, 'returnTexturePromise')
            .mockImplementation(() => undefined);

        await htmlTextPipe['_updateGpuText'](text);

        const oldStyleKey = text.styleKey;

        text.resolution = 2;

        await htmlTextPipe['_updateGpuText'](text);

        expect(getTexturePromiseSpy).toHaveBeenCalledTimes(2);
        expect(decreaseReferenceCountSpy).toHaveBeenCalledWith(oldStyleKey);
        expect(returnTexturePromiseSpy).toHaveBeenCalledTimes(1);

        renderer.destroy();
    });
});
