import { Transform } from '@pixi/math';

describe('Transform', () =>
{
    describe('setFromMatrix', () =>
    {
        it('should decompose negative scale into rotation', () =>
        {
            const eps = 1e-3;

            const transform = new Transform();
            const parent = new Transform();
            const otherTransform = new Transform();

            transform.position.set(20, 10);
            transform.scale.set(-2, -3);
            transform.rotation = Math.PI / 6;
            transform.updateTransform(parent);

            otherTransform.setFromMatrix(transform.worldTransform);

            const position = otherTransform.position;
            const scale = otherTransform.scale;
            const skew = otherTransform.skew;

            expect(position.x).toBeCloseTo(20, eps);
            expect(position.y).toBeCloseTo(10, eps);
            expect(scale.x).toBeCloseTo(2, eps);
            expect(scale.y).toBeCloseTo(3, eps);
            expect(skew.x).toEqual(0);
            expect(skew.y).toEqual(0);
            expect(otherTransform.rotation).toBeCloseTo(-5 * Math.PI / 6, eps);
        });

        it('should decompose mirror into skew', () =>
        {
            const eps = 1e-3;

            const transform = new Transform();
            const parent = new Transform();
            const otherTransform = new Transform();

            transform.position.set(20, 10);
            transform.scale.set(2, -3);
            transform.rotation = Math.PI / 6;
            transform.updateTransform(parent);

            otherTransform.setFromMatrix(transform.worldTransform);

            const position = otherTransform.position;
            const scale = otherTransform.scale;
            const skew = otherTransform.skew;

            expect(position.x).toBeCloseTo(20, eps);
            expect(position.y).toBeCloseTo(10, eps);
            expect(scale.x).toBeCloseTo(2, eps);
            expect(scale.y).toBeCloseTo(3, eps);
            expect(skew.x).toBeCloseTo(5 * Math.PI / 6, eps);
            expect(skew.y).toBeCloseTo(Math.PI / 6, eps);
            expect(otherTransform.rotation).toEqual(0);
        });

        it('should apply skew before scale, like in adobe animate and spine', () =>
        {
            // this example looks the same in CSS and in pixi, made with pixi-animate by @bigtimebuddy

            const eps = 1e-3;

            const transform = new Transform();
            const parent = new Transform();
            const otherTransform = new Transform();

            transform.position.set(387.8, 313.95);
            transform.scale.set(0.572, 4.101);
            transform.skew.set(-0.873, 0.175);
            transform.updateTransform(parent);

            const mat = transform.worldTransform;

            expect(mat.a).toBeCloseTo(0.563, eps);
            expect(mat.b).toBeCloseTo(0.100, eps);
            expect(mat.c).toBeCloseTo(-3.142, eps);
            expect(mat.d).toBeCloseTo(2.635, eps);
            expect(mat.tx).toBeCloseTo(387.8, eps);
            expect(mat.ty).toBeCloseTo(313.95, eps);

            otherTransform.setFromMatrix(transform.worldTransform);

            const position = otherTransform.position;
            const scale = otherTransform.scale;
            const skew = otherTransform.skew;

            expect(position.x).toBeCloseTo(387.8, eps);
            expect(position.y).toBeCloseTo(313.95, eps);
            expect(scale.x).toBeCloseTo(0.572, eps);
            expect(scale.y).toBeCloseTo(4.101, eps);
            expect(skew.x).toBeCloseTo(-0.873, eps);
            expect(skew.y).toBeCloseTo(0.175, eps);
            expect(otherTransform.rotation).toEqual(0);
        });
    });
});
