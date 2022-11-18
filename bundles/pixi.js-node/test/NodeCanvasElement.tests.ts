import { NodeCanvasElement } from '@pixi/node';

describe('NodeCanvasElement', () =>
{
    it('should create new canvas', () =>
    {
        const canvas = new NodeCanvasElement(100, 200);

        expect(canvas).toBeInstanceOf(NodeCanvasElement);

        expect(canvas.width).toEqual(100);
        expect(canvas.height).toEqual(200);
        expect(canvas.clientWidth).toEqual(100);
        expect(canvas.clientHeight).toEqual(200);

        expect(canvas.style).toEqual({});
    });
});
