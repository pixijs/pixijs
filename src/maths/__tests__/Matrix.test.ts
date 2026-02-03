import { Matrix } from '../matrix/Matrix';
import { Transform } from '~/utils';

describe('Matrix', () =>
{
    it('should create a new matrix', () =>
    {
        const matrix = new Matrix();

        expect(matrix.a).toEqual(1);
        expect(matrix.b).toEqual(0);
        expect(matrix.c).toEqual(0);
        expect(matrix.d).toEqual(1);
        expect(matrix.tx).toEqual(0);
        expect(matrix.ty).toEqual(0);

        const input = [0, 1, 2, 3, 4, 5];

        matrix.fromArray(input);

        expect(matrix.a).toEqual(0);
        expect(matrix.b).toEqual(1);
        expect(matrix.c).toEqual(3);
        expect(matrix.d).toEqual(4);
        expect(matrix.tx).toEqual(2);
        expect(matrix.ty).toEqual(5);

        let output = matrix.toArray(true);

        expect(output).toHaveLength(9);
        expect(output[0]).toEqual(0);
        expect(output[1]).toEqual(1);
        expect(output[3]).toEqual(3);
        expect(output[4]).toEqual(4);
        expect(output[6]).toEqual(2);
        expect(output[7]).toEqual(5);

        output = matrix.toArray(false);

        expect(output).toHaveLength(9);
        expect(output[0]).toEqual(0);
        expect(output[1]).toEqual(3);
        expect(output[2]).toEqual(2);
        expect(output[3]).toEqual(1);
        expect(output[4]).toEqual(4);
        expect(output[5]).toEqual(5);
    });

    it('should apply different transforms', () =>
    {
        const matrix = new Matrix();

        matrix.translate(10, 20);
        matrix.translate(1, 2);
        expect(matrix.tx).toEqual(11);
        expect(matrix.ty).toEqual(22);

        matrix.scale(2, 4);
        expect(matrix.a).toEqual(2);
        expect(matrix.b).toEqual(0);
        expect(matrix.c).toEqual(0);
        expect(matrix.d).toEqual(4);
        expect(matrix.tx).toEqual(22);
        expect(matrix.ty).toEqual(88);

        const m2 = matrix.clone();

        expect(m2).not.toBe(matrix);
        expect(m2.a).toEqual(2);
        expect(m2.b).toEqual(0);
        expect(m2.c).toEqual(0);
        expect(m2.d).toEqual(4);
        expect(m2.tx).toEqual(22);
        expect(m2.ty).toEqual(88);

        matrix.setTransform(14, 15, 0, 0, 4, 2, 0, 0, 0);
        expect(matrix.a).toEqual(4);
        expect(matrix.b).toEqual(0);
        // Object.is cant distinguish between 0 and -0
        expect(Math.abs(matrix.c)).toEqual(0);
        expect(matrix.d).toEqual(2);
        expect(matrix.tx).toEqual(14);
        expect(matrix.ty).toEqual(15);
    });

    it('should allow rotation', () =>
    {
        const matrix = new Matrix();

        matrix.rotate(Math.PI);

        expect(matrix.a).toEqual(-1);
        expect(matrix.b).toEqual(Math.sin(Math.PI));
        expect(matrix.c).toEqual(-Math.sin(Math.PI));
        expect(matrix.d).toEqual(-1);
    });

    it('should append matrix', () =>
    {
        const m1 = new Matrix();
        const m2 = new Matrix();

        m2.tx = 100;
        m2.ty = 200;

        m1.append(m2);

        expect(m1.tx).toEqual(m2.tx);
        expect(m1.ty).toEqual(m2.ty);
    });

    it('should prepend matrix', () =>
    {
        const m1 = new Matrix();
        const m2 = new Matrix();

        m2.set(2, 3, 4, 5, 100, 200);
        m1.prepend(m2);

        expect(m1.a).toEqual(m2.a);
        expect(m1.b).toEqual(m2.b);
        expect(m1.c).toEqual(m2.c);
        expect(m1.d).toEqual(m2.d);
        expect(m1.tx).toEqual(m2.tx);
        expect(m1.ty).toEqual(m2.ty);

        const m3 = new Matrix();
        const m4 = new Matrix();

        m3.prepend(m4);

        expect(m3.a).toEqual(m4.a);
        expect(m3.b).toEqual(m4.b);
        expect(m3.c).toEqual(m4.c);
        expect(m3.d).toEqual(m4.d);
        expect(m3.tx).toEqual(m4.tx);
        expect(m3.ty).toEqual(m4.ty);
    });

    it('should get IDENTITY', () =>
    {
        expect(Matrix.IDENTITY instanceof Matrix).toBe(true);
    });

    it('should return true for two identical matrices', () =>
    {
        const matrix1 = new Matrix(1, 2, 3, 4, 5, 6);
        const matrix2 = new Matrix(1, 2, 3, 4, 5, 6);

        expect(matrix1.equals(matrix2)).toBe(true);
    });

    it('should return false if any of the corresponding fields differ', () =>
    {
        const matrix1 = new Matrix(1, 2, 3, 4, 5, 6);
        const tests = [
            new Matrix(0, 2, 3, 4, 5, 6), // different 'a'
            new Matrix(1, 0, 3, 4, 5, 6), // different 'b'
            new Matrix(1, 2, 0, 4, 5, 6), // different 'c'
            new Matrix(1, 2, 3, 0, 5, 6), // different 'd'
            new Matrix(1, 2, 3, 4, 0, 6), // different 'tx'
            new Matrix(1, 2, 3, 4, 5, 0), // different 'ty'
        ];

        tests.forEach((testMatrix) =>
        {
            expect(matrix1.equals(testMatrix)).toBe(false);
        });
    });

    it('should reset matrix to default when identity() is called', () =>
    {
        const matrix = new Matrix();

        matrix.set(2, 3, 4, 5, 100, 200);

        expect(matrix.a).toEqual(2);
        expect(matrix.b).toEqual(3);
        expect(matrix.c).toEqual(4);
        expect(matrix.d).toEqual(5);
        expect(matrix.tx).toEqual(100);
        expect(matrix.ty).toEqual(200);

        matrix.identity();

        expect(matrix.a).toEqual(1);
        expect(matrix.b).toEqual(0);
        expect(matrix.c).toEqual(0);
        expect(matrix.d).toEqual(1);
        expect(matrix.tx).toEqual(0);
        expect(matrix.ty).toEqual(0);
    });

    it('should have the same transform after decompose', () =>
    {
        const matrix = new Matrix();
        const transformInitial = new Transform();
        const transformDecomposed = new Transform();

        for (let x = 0; x < 50; ++x)
        {
            transformInitial.position.x = (Math.random() * 1000) - 2000;
            transformInitial.position.y = (Math.random() * 1000) - 2000;
            transformInitial.scale.x = (Math.random() * 5) - 10;
            transformInitial.scale.y = (Math.random() * 5) - 10;
            transformInitial.rotation = (Math.random() - 2) * Math.PI;
            transformInitial.skew.x = (Math.random() - 2) * Math.PI;
            transformInitial.skew.y = (Math.random() - 2) * Math.PI;

            matrix.setTransform(
                transformInitial.position.x, transformInitial.position.y,
                0, 0,
                transformInitial.scale.x, transformInitial.scale.y,
                transformInitial.rotation,
                transformInitial.skew.x, transformInitial.skew.y
            );
            matrix.decompose(transformDecomposed);

            // transformInitial.updateLocalTransform();
            // transformDecomposed.updateLocalTransform();

            expect(transformInitial.matrix.a).toBeCloseTo(transformDecomposed.matrix.a, 0.0001);
            expect(transformInitial.matrix.b).toBeCloseTo(transformDecomposed.matrix.b, 0.0001);
            expect(transformInitial.matrix.c).toBeCloseTo(transformDecomposed.matrix.c, 0.0001);
            expect(transformInitial.matrix.d).toBeCloseTo(transformDecomposed.matrix.d, 0.0001);
            expect(transformInitial.matrix.tx).toBeCloseTo(transformDecomposed.matrix.tx, 0.0001);
            expect(transformInitial.matrix.ty).toBeCloseTo(transformDecomposed.matrix.ty, 0.0001);
        }
    });

    it('should decompose corner case', () =>
    {
        const matrix = new Matrix();
        const transform = new Transform();

        matrix.a = -0.00001;
        matrix.b = -1;
        matrix.c = 1;
        matrix.d = 0;
        matrix.decompose(transform);

        expect(transform.matrix.a).toBeCloseTo(matrix.a, 0.001);
        expect(transform.matrix.b).toBeCloseTo(matrix.b, 0.001);
        expect(transform.matrix.c).toBeCloseTo(matrix.c, 0.001);
        expect(transform.matrix.d).toBeCloseTo(matrix.d, 0.001);
    });

    describe('decompose', () =>
    {
        it('should be the inverse of updateLocalTransform even when pivot is set', () =>
        {
            const matrix = new Matrix(0.01, 0.04, 0.04, 0.1, 2, 2);
            const transform = new Transform();

            transform.pivot.set(40, 40);

            matrix.decompose(transform);
            // transform.updateLocalTransform();

            const localTransform = transform.matrix;

            expect(localTransform.a).toBeCloseTo(matrix.a, 0.001);
            expect(localTransform.b).toBeCloseTo(matrix.b, 0.001);
            expect(localTransform.c).toBeCloseTo(matrix.c, 0.001);
            expect(localTransform.d).toBeCloseTo(matrix.d, 0.001);
            expect(localTransform.tx).toBeCloseTo(matrix.tx, 0.001);
            expect(localTransform.ty).toBeCloseTo(matrix.ty, 0.001);
        });
    });
});
