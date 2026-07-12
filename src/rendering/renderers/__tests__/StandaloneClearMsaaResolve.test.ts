import { getWebGLRenderer } from '@test-utils';
import { RenderTexture } from '~/rendering';
import { Container, Sprite } from '~/scene';

describe('Standalone clear MSAA resolve (WebGL)', () =>
{
    it('resolves an antialiased render texture after a standalone clear so its color is sampleable', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 16, height: 16 });

        // antialias: true makes this render texture MSAA. gl.clear lands on the MSAA renderbuffer FBO,
        // but sampling reads the resolve texture, so the standalone clear must blit MSAA -> resolve or
        // the cleared color is never visible when the texture is drawn.
        const source = RenderTexture.create({ width: 16, height: 16, antialias: true });

        // standalone clear (no render in progress) - the resolve blit happens inside adaptor.clear
        renderer.clear({ target: source, clearColor: [1, 0, 0, 1] });

        // draw the render texture with a sprite (samples the resolve texture) into a plain output
        // render texture, then read it back. Extract on the MSAA source directly would resolve it and
        // hide the bug, so we go through an actual sampling draw.
        const container = new Container();

        container.addChild(new Sprite(source));

        const output = RenderTexture.create({ width: 16, height: 16 });

        renderer.render({ container, target: output });

        const { pixels } = renderer.extract.pixels(output);

        expect([pixels[0], pixels[1], pixels[2], pixels[3]]).toEqual([255, 0, 0, 255]);

        source.destroy(true);
        output.destroy(true);
        renderer.destroy();
    });
});
