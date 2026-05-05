import { GraphicsPath } from '../path/GraphicsPath';
import { Matrix } from '~/maths';

describe('GraphicsPath.transform', () =>
{
    it('should not warn for closePath action', () =>
    {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { /* noop */ });

        const path = new GraphicsPath();

        path.moveTo(200, 200);
        path.lineTo(400, 200);
        path.lineTo(300, 400);
        path.closePath();

        const matrix = new Matrix().translate(1, 1);

        path.transform(matrix);

        expect(warnSpy).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it('should correctly transform coordinates with closePath present', () =>
    {
        const path = new GraphicsPath();

        path.moveTo(10, 20);
        path.lineTo(30, 40);
        path.closePath();

        const matrix = new Matrix().translate(5, 10);

        path.transform(matrix);

        const instructions = path.instructions;

        expect(instructions[0].action).toBe('moveTo');
        expect(instructions[0].data[0]).toBe(15);
        expect(instructions[0].data[1]).toBe(30);

        expect(instructions[1].action).toBe('lineTo');
        expect(instructions[1].data[0]).toBe(35);
        expect(instructions[1].data[1]).toBe(50);

        expect(instructions[2].action).toBe('closePath');
        expect(instructions[2].data).toEqual([]);
    });

    it('should handle regularPoly transform', () =>
    {
        const path = new GraphicsPath();

        path.regularPoly(100, 100, 50, 5);

        const matrix = new Matrix().translate(10, 20);

        path.transform(matrix);

        const instruction = path.instructions[0];

        expect(instruction.action).toBe('regularPoly');
        // After transform, data[5] should have a composed transform matrix
        expect(instruction.data[5]).toBeInstanceOf(Matrix);
    });

    it('should handle chamferRect transform', () =>
    {
        const path = new GraphicsPath();

        path.chamferRect(0, 0, 100, 100, 10);

        const matrix = new Matrix().translate(10, 20);

        path.transform(matrix);

        const instruction = path.instructions[0];

        expect(instruction.action).toBe('chamferRect');
        // After transform, data[5] should have a composed transform matrix
        expect(instruction.data[5]).toBeInstanceOf(Matrix);
    });

    it('should not transform when matrix is identity', () =>
    {
        const path = new GraphicsPath();

        path.moveTo(10, 20);
        path.closePath();

        const matrix = new Matrix(); // identity

        path.transform(matrix);

        expect(path.instructions[0].data[0]).toBe(10);
        expect(path.instructions[0].data[1]).toBe(20);
    });
});
