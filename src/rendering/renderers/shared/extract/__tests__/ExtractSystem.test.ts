import { TextureSource } from '../../texture/sources/TextureSource';
import { Texture } from '../../texture/Texture';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { Graphics } from '~/scene';

import type { Renderer } from '../../../types';

function texture(format: TextureSource['format']): Texture
{
    return new Texture({ source: new TextureSource({ width: 4, height: 4, resolution: 1, format }) });
}

function describeExtract(name: string, getRenderer: () => Promise<Renderer>, describeFn = describe)
{
    describeFn(`ExtractSystem formats it can't read (${name})`, () =>
    {
        let renderer: Renderer;

        beforeEach(async () =>
        {
            renderer = await getRenderer();
        });

        afterEach(() =>
        {
            renderer.destroy();
        });

        it.each(['r32uint', 'rg16sint', 'rgba16float', 'r32float', 'depth24plus'] as const)(
            'throws for %s, naming the format',
            (format) =>
            {
                const unreadable = texture(format);
                const message = `can't read ${format} textures`;

                expect(() => renderer.extract.pixels(unreadable)).toThrow(message);
                expect(() => renderer.extract.canvas(unreadable)).toThrow(message);
            },
        );

        it('still reads 8-bit color', () =>
        {
            const target = renderer.textureGenerator.generateTexture(new Graphics().rect(0, 0, 4, 4).fill(0xff0000));
            const { pixels } = renderer.extract.pixels(target);

            expect(Array.from(pixels.slice(0, 4))).toEqual([255, 0, 0, 255]);
        });
    });
}

describeExtract('WebGL', () => getWebGLRenderer());
describeExtract('WebGPU', () => getWebGPURenderer(), describeLocalOnly);
