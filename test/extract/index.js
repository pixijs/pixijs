'use strict';

const EqualsData = require('./equals');

describe('PIXI.extract', function ()
{
    it('should check the region, premultiplyAlpha and flipY', function (done)
    {
        const renderers = [new PIXI.CanvasRenderer(36, 47, { transparent: true })];

        if (PIXI.utils.isWebGLSupported())
        {
            renderers.push(new PIXI.WebGLRenderer(36, 47, { transparent: true }));
        }

        const loader = new PIXI.loaders.Loader(`file://${__dirname}/resources/`);

        loader.add('bunny1', 'bunny.png');
        loader.add('bunny2', 'bunny-alpha.png');
        loader.add('bunny3', 'bunny-alpha-padding.png');
        loader.add('bunny4', 'bunny-alpha-padding-shift.png');
        loader.load(function (loader, resources)
        {
            const stage = new PIXI.Container();
            const sprite = new PIXI.Sprite(resources.bunny1.texture);
            const region = new PIXI.Rectangle(-4, -3, 36, 47);

            stage.addChild(sprite);
            sprite.position.set(1, 2);
            sprite.alpha = 0.5;
            sprite.updateTransform();

            const exp2 = PIXI.extract.CanvasData.fromImage(resources.bunny2.data);
            const exp3 = PIXI.extract.CanvasData.fromImage(resources.bunny3.data);
            const exp4 = PIXI.extract.CanvasData.fromImage(resources.bunny4.data);

            for (const renderer of renderers)
            {
                renderer.render(stage);

                // extract from framebuffer
                const data1 = renderer.extract.data(sprite, undefined, false);
                const data2 = renderer.extract.data(sprite, region, false);
                // extract from context
                const data3 = renderer.extract.data(undefined, region, false);
                const data4 = renderer.extract.data(undefined, undefined, false);

                expect(EqualsData(data1, exp2)).to.be.true;
                expect(EqualsData(data2, exp3)).to.be.true;
                expect(EqualsData(data3, exp3)).to.be.true;
                expect(EqualsData(data4, exp4)).to.be.true;

                data1.normalize();
                data2.normalize();
                data3.normalize();
                data4.normalize();

                expect(EqualsData(data1, exp2)).to.be.true;
                expect(EqualsData(data2, exp3)).to.be.true;
                expect(EqualsData(data3, exp3)).to.be.true;
                expect(EqualsData(data4, exp4)).to.be.true;

                renderer.destroy();
            }

            for (const res of resources)
            {
                res.texture.destroy(true);
            }

            done();
        });
    });
});
