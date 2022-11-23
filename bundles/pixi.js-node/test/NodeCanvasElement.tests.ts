import canvasModule from 'canvas';
import { NodeCanvasElement } from '@pixi/node';

describe('NodeCanvasElement', () =>
{
    it('should create new canvas', () =>
    {
        const canvas = new NodeCanvasElement(100, 200);

        expect(canvas).toBeInstanceOf(NodeCanvasElement);

        expect(canvas.width).toStrictEqual(100);
        expect(canvas.height).toStrictEqual(200);
        expect(canvas.clientWidth).toStrictEqual(100);
        expect(canvas.clientHeight).toStrictEqual(200);

        expect(canvas.style).toStrictEqual({});
    });

    it('should resize', () =>
    {
        const canvas = new NodeCanvasElement(100, 200);

        canvas.width = 300;

        expect(canvas.width).toStrictEqual(300);
        expect(canvas.height).toStrictEqual(200);
        expect(canvas.clientWidth).toStrictEqual(300);
        expect(canvas.clientHeight).toStrictEqual(200);

        canvas.height = 400;

        expect(canvas.width).toStrictEqual(300);
        expect(canvas.height).toStrictEqual(400);
        expect(canvas.clientWidth).toStrictEqual(300);
        expect(canvas.clientHeight).toStrictEqual(400);
    });

    describe('getContext', () =>
    {
        it('should get 2D context', () =>
        {
            const canvas = new NodeCanvasElement(1, 1);

            const ctx = canvas.getContext('2d');

            expect(ctx).toBeInstanceOf(canvasModule.CanvasRenderingContext2D);
            expect(canvas.getContext('2d')).toBe(ctx);
        });

        it('should get WebGL context', () =>
        {
            const canvas1 = new NodeCanvasElement(1, 1);
            const gl1 = canvas1.getContext('webgl');

            expect(gl1).toBeObject();
            expect(canvas1.getContext('webgl')).toBe(gl1);
            expect(canvas1.getContext('experimental-webgl')).toBe(gl1);

            const canvas2 = new NodeCanvasElement(1, 1);
            const gl2 = canvas2.getContext('experimental-webgl');

            expect(gl2).toBeObject();
            expect(canvas2.getContext('experimental-webgl')).toBe(gl2);
            expect(canvas2.getContext('webgl')).toBe(gl2);
        });

        it('should return null with unsupported context ID', () =>
        {
            const canvas = new NodeCanvasElement(1, 1);

            expect(canvas.getContext('bitmaprenderer')).toBeNull();
            expect(canvas.getContext('webgl2')).toBeNull();
            expect(canvas.getContext('experimental-webgl2')).toBeNull();
        });

        it('should return null with another context ID', () =>
        {
            const canvas1 = new NodeCanvasElement(1, 1);
            const ctx1 = canvas1.getContext('2d');
            const gl1 = canvas1.getContext('webgl');

            expect(ctx1).toBeInstanceOf(canvasModule.CanvasRenderingContext2D);
            expect(gl1).toBeNull();

            const canvas2 = new NodeCanvasElement(1, 1);
            const gl2 = canvas2.getContext('webgl');
            const ctx2 = canvas2.getContext('2d');

            expect(gl2).toBeObject();
            expect(ctx2).toBeNull();
        });
    });
});
