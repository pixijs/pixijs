import { Container } from '../../container/Container';
import { BitmapText } from '../BitmapText';
import { BitmapTextPipe } from '../GpuBitmapTextPipe';
import '../../text/init';
import '../init';
import '../../graphics/init';
import { getWebGLRenderer } from '@test-utils';

import type { Graphics } from '../../graphics/shared/Graphics';
import type { GraphicsContextSystem } from '../../graphics/shared/GraphicsContextSystem';
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

    describe('non-batched BitmapText', () =>
    {
        // enough glyphs to go over the vertex limit of a batchable graphics context
        const longText = 'A'.repeat(100);

        async function setupRendered()
        {
            const renderer = await getWebGLRenderer();
            const stage = new Container();
            const text = new BitmapText({ text: longText, style: { fontFamily: 'Arial' } });

            stage.addChild(text);
            renderer.render(stage);

            const proxy = text._gpuData[renderer.uid] as unknown as Graphics;
            const contextSystem = renderer.graphicsContext as GraphicsContextSystem;
            const buildInstructions = jest.spyOn(renderer.renderGroup as any, '_buildInstructions');
            const glyphs = () => proxy.context.instructions.filter((i) => i.action === 'texture');

            expect(contextSystem.getGpuContext(proxy.context).isBatchable).toBe(false);
            expect(glyphs()).toHaveLength(longText.length);

            return { renderer, stage, text, proxy, contextSystem, buildInstructions, glyphs };
        }

        it('should rebuild its instructions and glyphs when the text changes', async () =>
        {
            const { renderer, stage, text, proxy, contextSystem, buildInstructions, glyphs } = await setupRendered();

            text.text = 'B'.repeat(60);
            renderer.render(stage);

            expect(buildInstructions).toHaveBeenCalledTimes(1);
            expect(contextSystem.getGpuContext(proxy.context).isBatchable).toBe(false);
            expect(glyphs()).toHaveLength(60);

            renderer.destroy();
        });

        it('should rebuild its instructions and glyphs when the style changes', async () =>
        {
            const { renderer, stage, text, buildInstructions, glyphs } = await setupRendered();

            const lastGlyphX = () => (glyphs()[glyphs().length - 1].data as { dx: number }).dx;
            const before = lastGlyphX();

            text.style.letterSpacing = 10;
            renderer.render(stage);

            expect(buildInstructions).toHaveBeenCalledTimes(1);
            expect(lastGlyphX()).toBeGreaterThan(before);

            renderer.destroy();
        });
    });
});
