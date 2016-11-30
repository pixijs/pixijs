'use strict';

describe('PIXI.TransformStatic', () =>
{
    describe('setFromMatrix', () =>
    {
        it('should decompose correct rotation', () =>
        {
            const eps = 1e-3;

            const transform = new PIXI.TransformStatic();
            const parent = new PIXI.TransformStatic();
            const otherTransform = new PIXI.TransformStatic();

            transform.position.set(20, 10);
            transform.scale.set(2, -3);
            transform.rotation = Math.PI / 4;
            transform.updateTransform(parent);

            otherTransform.setFromMatrix(transform.worldTransform);

            const position = otherTransform.position;
            const scale = otherTransform.scale;
            const skew = otherTransform.skew;

            expect(position.x).to.be.closeTo(20, eps);
            expect(position.y).to.be.closeTo(10, eps);
            expect(scale.x).to.be.closeTo(2, eps);
            expect(scale.y).to.be.closeTo(-3, eps);
            expect(skew.x).to.be.equal(0);
            expect(skew.y).to.be.equal(0);
            expect(otherTransform.rotation).to.be.closeTo(Math.PI / 4, eps);
        });

        it('should apply skew before scale, like in adobe animate and spine', () =>
        {
            // this example looks the same in CSS and in pixi, made with pixi-animate by @bigtimebuddy

            const eps = 1e-3;

            const transform = new PIXI.TransformStatic();
            const parent = new PIXI.TransformStatic();
            const otherTransform = new PIXI.TransformStatic();

            transform.position.set(387.8, 313.95);
            transform.scale.set(0.572, 4.101);
            transform.skew.set(-0.873, 0.175);
            transform.updateTransform(parent);

            const mat = transform.worldTransform;

            expect(mat.a).to.be.closeTo(0.563, eps);
            expect(mat.b).to.be.closeTo(0.100, eps);
            expect(mat.c).to.be.closeTo(-3.142, eps);
            expect(mat.d).to.be.closeTo(2.635, eps);
            expect(mat.tx).to.be.closeTo(387.8, eps);
            expect(mat.ty).to.be.closeTo(313.95, eps);

            otherTransform.setFromMatrix(transform.worldTransform);

            const position = otherTransform.position;
            const scale = otherTransform.scale;
            const skew = otherTransform.skew;

            expect(position.x).to.be.closeTo(387.8, eps);
            expect(position.y).to.be.closeTo(313.95, eps);
            expect(scale.x).to.be.closeTo(0.572, eps);
            expect(scale.y).to.be.closeTo(4.101, eps);
            expect(skew.x).to.be.equal(-0.873);
            expect(skew.y).to.be.equal(0.175);
            expect(otherTransform.rotation).to.be.equal(0);
        });
    });
});
