const { Matrix, Transform } = require('../');

describe('PIXI.Matrix', function ()
{
    it('should create a new matrix', function ()
    {
        const matrix = new Matrix();

        expect(matrix.a).to.equal(1);
        expect(matrix.b).to.equal(0);
        expect(matrix.c).to.equal(0);
        expect(matrix.d).to.equal(1);
        expect(matrix.tx).to.equal(0);
        expect(matrix.ty).to.equal(0);

        const input = [0, 1, 2, 3, 4, 5];

        matrix.fromArray(input);

        expect(matrix.a).to.equal(0);
        expect(matrix.b).to.equal(1);
        expect(matrix.c).to.equal(3);
        expect(matrix.d).to.equal(4);
        expect(matrix.tx).to.equal(2);
        expect(matrix.ty).to.equal(5);

        let output = matrix.toArray(true);

        expect(output.length).to.equal(9);
        expect(output[0]).to.equal(0);
        expect(output[1]).to.equal(1);
        expect(output[3]).to.equal(3);
        expect(output[4]).to.equal(4);
        expect(output[6]).to.equal(2);
        expect(output[7]).to.equal(5);

        output = matrix.toArray(false);

        expect(output.length).to.equal(9);
        expect(output[0]).to.equal(0);
        expect(output[1]).to.equal(3);
        expect(output[2]).to.equal(2);
        expect(output[3]).to.equal(1);
        expect(output[4]).to.equal(4);
        expect(output[5]).to.equal(5);
    });

    it('should apply different transforms', function ()
    {
        const matrix = new Matrix();

        matrix.translate(10, 20);
        matrix.translate(1, 2);
        expect(matrix.tx).to.equal(11);
        expect(matrix.ty).to.equal(22);

        matrix.scale(2, 4);
        expect(matrix.a).to.equal(2);
        expect(matrix.b).to.equal(0);
        expect(matrix.c).to.equal(0);
        expect(matrix.d).to.equal(4);
        expect(matrix.tx).to.equal(22);
        expect(matrix.ty).to.equal(88);

        const m2 = matrix.clone();

        expect(m2).to.not.equal(matrix);
        expect(m2.a).to.equal(2);
        expect(m2.b).to.equal(0);
        expect(m2.c).to.equal(0);
        expect(m2.d).to.equal(4);
        expect(m2.tx).to.equal(22);
        expect(m2.ty).to.equal(88);

        matrix.setTransform(14, 15, 0, 0, 4, 2, 0, 0, 0);
        expect(matrix.a).to.equal(4);
        expect(matrix.b).to.equal(0);
        expect(matrix.c).to.equal(0);
        expect(matrix.d).to.equal(2);
        expect(matrix.tx).to.equal(14);
        expect(matrix.ty).to.equal(15);
    });

    it('should allow rotatation', function ()
    {
        const matrix = new Matrix();

        matrix.rotate(Math.PI);

        expect(matrix.a).to.equal(-1);
        expect(matrix.b).to.equal(Math.sin(Math.PI));
        expect(matrix.c).to.equal(-Math.sin(Math.PI));
        expect(matrix.d).to.equal(-1);
    });

    it('should append matrix', function ()
    {
        const m1 = new Matrix();
        const m2 = new Matrix();

        m2.tx = 100;
        m2.ty = 200;

        m1.append(m2);

        expect(m1.tx).to.equal(m2.tx);
        expect(m1.ty).to.equal(m2.ty);
    });

    it('should prepend matrix', function ()
    {
        const m1 = new Matrix();
        const m2 = new Matrix();

        m2.set(2, 3, 4, 5, 100, 200);
        m1.prepend(m2);

        expect(m1.a).to.equal(m2.a);
        expect(m1.b).to.equal(m2.b);
        expect(m1.c).to.equal(m2.c);
        expect(m1.d).to.equal(m2.d);
        expect(m1.tx).to.equal(m2.tx);
        expect(m1.ty).to.equal(m2.ty);

        const m3 = new Matrix();
        const m4 = new Matrix();

        m3.prepend(m4);

        expect(m3.a).to.equal(m4.a);
        expect(m3.b).to.equal(m4.b);
        expect(m3.c).to.equal(m4.c);
        expect(m3.d).to.equal(m4.d);
        expect(m3.tx).to.equal(m4.tx);
        expect(m3.ty).to.equal(m4.ty);
    });

    it('should get IDENTITY and TEMP_MATRIX', function ()
    {
        expect(Matrix.IDENTITY instanceof Matrix).to.be.true;
        expect(Matrix.TEMP_MATRIX instanceof Matrix).to.be.true;
    });

    it('should reset matrix to default when identity() is called', function ()
    {
        const matrix = new Matrix();

        matrix.set(2, 3, 4, 5, 100, 200);

        expect(matrix.a).to.equal(2);
        expect(matrix.b).to.equal(3);
        expect(matrix.c).to.equal(4);
        expect(matrix.d).to.equal(5);
        expect(matrix.tx).to.equal(100);
        expect(matrix.ty).to.equal(200);

        matrix.identity();

        expect(matrix.a).to.equal(1);
        expect(matrix.b).to.equal(0);
        expect(matrix.c).to.equal(0);
        expect(matrix.d).to.equal(1);
        expect(matrix.tx).to.equal(0);
        expect(matrix.ty).to.equal(0);
    });

    it('should have the same transform after decompose', function ()
    {
        const matrix = new Matrix();
        const transformInitial  = new Transform();
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
                transformInitial.x, transformInitial.y,
                0, 0,
                transformInitial.scale.x, transformInitial.scale.y,
                transformInitial.rotation,
                transformInitial.skew.x, transformInitial.skew.y
            );
            matrix.decompose(transformDecomposed);

            expect(transformInitial.a).to.equal(transformDecomposed.a);
            expect(transformInitial.b).to.equal(transformDecomposed.b);
            expect(transformInitial.c).to.equal(transformDecomposed.c);
            expect(transformInitial.d).to.equal(transformDecomposed.d);
            expect(transformInitial.tx).to.equal(transformDecomposed.tx);
            expect(transformInitial.ty).to.equal(transformDecomposed.ty);
        }
    });

    it('should decompose corner case', function ()
    {
        const matrix = new Matrix();
        const transform  = new Transform();
        const result = transform.localTransform;

        matrix.a = -0.00001;
        matrix.b = -1;
        matrix.c = 1;
        matrix.d = 0;
        matrix.decompose(transform);
        transform.updateLocalTransform();

        expect(result.a).to.closeTo(matrix.a, 0.001);
        expect(result.b).to.closeTo(matrix.b, 0.001);
        expect(result.c).to.closeTo(matrix.c, 0.001);
        expect(result.d).to.closeTo(matrix.d, 0.001);
    });
});
