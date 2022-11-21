import type { IBatchableElement } from '@pixi/core';
import { Renderer, BatchRenderer, CanvasResource, Texture, BaseTexture } from '@pixi/core';
import { BLEND_MODES } from '@pixi/constants';

describe('BatchRenderer', () =>
{
    function createTexture(w: number, h: number)
    {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = w;
        canvas.height = h;
        context.fillStyle = 'white';
        context.fillRect(0, 0, w, h);

        return new BaseTexture(new CanvasResource(canvas));
    }

    const uvs = [0, 0, 1, 0, 1, 1, 0, 1];
    const vertexData = uvs;
    const indices = [0, 1, 2, 0, 2, 3];
    const uvs2 = [0, 0, 1, 0, 1, 1, 0.5, 1, 1, 1];
    const vertexData2 = uvs2;
    const indices2 = [0, 1, 2, 3, 4];
    const tex1 = createTexture(10, 10);
    const tex2 = createTexture(20, 20);
    const tex3 = createTexture(16, 24);
    const tex4 = createTexture(24, 16);
    const tint1 = 0xffffff;
    const tint2 = 0xffff00;
    const tint3 = 0x00ffff;

    it('should pass the batching test', () =>
    {
        const renderer = new Renderer({ width: 1, height: 1 });
        const batchRenderer = new BatchRenderer(renderer);
        const drawCalls = [] as number[];

        renderer.gl.drawElements = (_type, size, _indexType, start) =>
        {
            drawCalls.push(start, size);
        };

        // optimal is three drawCalls, but due to priority of bindTexture there are four

        const elements = [
            { uvs, vertexData, indices, _tintRGB: tint1, worldAlpha: 1.0, _texture: new Texture(tex1), blendMode: 0 },
            { uvs, vertexData, indices, _tintRGB: tint1, worldAlpha: 0.5, _texture: new Texture(tex2), blendMode: 0 },
            { uvs, vertexData, indices, _tintRGB: tint2, worldAlpha: 1.0, _texture: new Texture(tex1), blendMode: 0 },
            { uvs, vertexData, indices, _tintRGB: tint2, worldAlpha: 0.5, _texture: new Texture(tex2), blendMode: 1 },
            { uvs, vertexData, indices, _tintRGB: tint1, worldAlpha: 1.0, _texture: new Texture(tex3), blendMode: 0 },
            { uvs: uvs2, vertexData: vertexData2, indices: indices2,
                _tintRGB: tint2, worldAlpha: 1.0, _texture: new Texture(tex1), blendMode: 0 },
            { uvs, vertexData, indices, _tintRGB: tint3, worldAlpha: 1.0, _texture: new Texture(tex2), blendMode: 0 },
            { uvs, vertexData, indices, _tintRGB: tint1, worldAlpha: 0.5, _texture: new Texture(tex4), blendMode: 0 },
        ] as unknown as IBatchableElement[];
        const nullArray = [null, null, null, null, null, null, null, null] as null[];

        try
        {
            batchRenderer.size = 300;
            batchRenderer.contextChange();
            batchRenderer.maxTextures = 2;
            batchRenderer.start();
            elements.forEach((element) => batchRenderer.render(element));
            expect(batchRenderer['_bufferedElements'].length).toEqual(8);
            expect(batchRenderer['_bufferedTextures'].length).toEqual(8);
            batchRenderer.flush();
            expect(batchRenderer['_bufferedElements']).toEqual(nullArray);
            expect(batchRenderer['_bufferedTextures']).toEqual(nullArray);

            const attrCount = batchRenderer['_aIndex'];

            // first number is start * 2, second is size
            expect(drawCalls).toEqual([0, 18, 36, 6, 48, 11, 70, 12]);
            expect(attrCount).toEqual(198);
            // eslint-disable-next-line no-console

            const attr = [0x0, 0x0, 0x0, 0x0, 0xffffffff, 0x0,
                0x3f800000, 0x0, 0x3f800000, 0x0, 0xffffffff, 0x0,
                0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000, 0xffffffff, 0x0,
                0x0, 0x3f800000, 0x0, 0x3f800000, 0xffffffff, 0x0,
                0x0, 0x0, 0x0, 0x0, 0x7f808080, 0x3f800000,
                0x3f800000, 0x0, 0x3f800000, 0x0, 0x7f808080, 0x3f800000,
                0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000, 0x7f808080, 0x3f800000,
                0x0, 0x3f800000, 0x0, 0x3f800000, 0x7f808080, 0x3f800000,
                0x0, 0x0, 0x0, 0x0, 0xffffff00, 0x0,
                0x3f800000, 0x0, 0x3f800000, 0x0, 0xffffff00, 0x0,
                0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000, 0xffffff00, 0x0,
                0x0, 0x3f800000, 0x0, 0x3f800000, 0xffffff00, 0x0,
                0x0, 0x0, 0x0, 0x0, 0x7f808000, 0x3f800000,
                0x3f800000, 0x0, 0x3f800000, 0x0, 0x7f808000, 0x3f800000,
                0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000, 0x7f808000, 0x3f800000,
                0x0, 0x3f800000, 0x0, 0x3f800000, 0x7f808000, 0x3f800000,
                0x0, 0x0, 0x0, 0x0, 0xffffffff, 0x3f800000,
                0x3f800000, 0x0, 0x3f800000, 0x0, 0xffffffff, 0x3f800000,
                0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000, 0xffffffff, 0x3f800000,
                0x0, 0x3f800000, 0x0, 0x3f800000, 0xffffffff, 0x3f800000,
                0x0, 0x0, 0x0, 0x0, 0xffffff00, 0x0,
                0x3f800000, 0x0, 0x3f800000, 0x0, 0xffffff00, 0x0,
                0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000, 0xffffff00, 0x0,
                0x3f000000, 0x3f800000, 0x3f000000, 0x3f800000, 0xffffff00, 0x0,
                0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000, 0xffffff00, 0x0,
                0x0, 0x0, 0x0, 0x0, 0xff00ffff, 0x0,
                0x3f800000, 0x0, 0x3f800000, 0x0, 0xff00ffff, 0x0,
                0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000, 0xff00ffff, 0x0,
                0x0, 0x3f800000, 0x0, 0x3f800000, 0xff00ffff, 0x0,
                0x0, 0x0, 0x0, 0x0, 0x7f808080, 0x3f800000,
                0x3f800000, 0x0, 0x3f800000, 0x0, 0x7f808080, 0x3f800000,
                0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000, 0x7f808080, 0x3f800000,
                0x0, 0x3f800000, 0x0, 0x3f800000, 0x7f808080, 0x3f800000,
            ];

            const ind = [
                0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
                16, 17, 18, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 25, 27, 28, 29, 30, 31, 29, 31, 32,
            ];
            const resultAttr: number[] = [];
            const resultInd: number[] = [];

            batchRenderer['_attributeBuffer'].uint32View.slice(0, 198).forEach((x) => { resultAttr.push(x); });
            batchRenderer['_indexBuffer'].slice(0, 47).forEach((x) => { resultInd.push(x); });

            expect(resultAttr).toEqual(attr);
            expect(resultInd).toEqual(ind);
        }
        finally
        {
            batchRenderer.destroy();
            renderer.destroy();
        }
    });

    it('should ask StateSystem to call gl.disable(gl.BLEND) if sprite has BLEND_MODES.NONE', () =>
    {
        const renderer = new Renderer({ width: 1, height: 1 });
        const batchRenderer = new BatchRenderer(renderer);
        const { gl } = renderer;

        const elements = [
            { uvs, vertexData, indices, _tintRGB: tint1, worldAlpha: 1.0, _texture: new Texture(tex1),
                blendMode: BLEND_MODES.NONE },
            { uvs, vertexData, indices, _tintRGB: tint1, worldAlpha: 0.5, _texture: new Texture(tex1),
                blendMode: BLEND_MODES.NORMAL },
        ] as unknown as IBatchableElement[];

        try
        {
            batchRenderer.size = 300;
            batchRenderer.contextChange();
            batchRenderer.maxTextures = 2;
            batchRenderer.start();

            const glEnable = jest.spyOn(gl, 'enable');
            const glDisable = jest.spyOn(gl, 'disable');

            elements.forEach((element) => batchRenderer.render(element));
            batchRenderer.flush();

            expect(glDisable).toBeCalledTimes(1);
            expect(glDisable).toBeCalledWith(gl.BLEND);
            expect(glEnable).toBeCalledTimes(1);
            expect(glEnable).toBeCalledWith(gl.BLEND);
        }
        finally
        {
            batchRenderer.destroy();
            renderer.destroy();
        }
    });
});
