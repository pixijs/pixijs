'use strict';

const EqualsData = require('./equals');

describe('PIXI.extract', function ()
{
    it('should use generateTexture, check the region, premultiplyAlpha and flipY', function (done)
    {
        const renderers = [new PIXI.CanvasRenderer(36, 47, { transparent: true })];

        // renderers.pop();

        if (PIXI.utils.isWebGLSupported())
        {
            renderers.push(new PIXI.WebGLRenderer(36, 47, { transparent: true }));
        }

        const loader = new PIXI.loaders.Loader(`file://${__dirname}/resources/`);

        loader.add('bunny', 'bunny.png');
        loader.add('exp1', 'bunny-alpha.png');
        loader.add('exp2', 'bunny-alpha-padding.png');
        loader.add('exp3', 'bunny-alpha-padding-shift.png');
        loader.load(function (loader, resources)
        {
            const stage = new PIXI.Container();
            const sprite = new PIXI.Sprite(resources.bunny.texture);

            const spriteRegion = new PIXI.Rectangle(0, 0, 26, 37);
            const stageRegion = new PIXI.Rectangle(4, 3, 26, 37);
            const customRegion = new PIXI.Rectangle(-2, -2, 30, 41);
            const customStageRegion = new PIXI.Rectangle(2, 1, 30, 41);

            stage.addChild(sprite);
            sprite.position.set(4, 3);
            sprite.alpha = 0.5;
            sprite.updateTransform();

            const exp1 = PIXI.extract.CanvasData.fromImage(resources.exp1.data);
            const exp2 = PIXI.extract.CanvasData.fromImage(resources.exp2.data);
            const exp3 = PIXI.extract.CanvasData.fromImage(resources.exp3.data);

            for (const renderer of renderers)
            {
                renderer.render(stage);

                const wid = stage.transform._worldID;

                renderer.render(stage);
                expect(stage.transform._worldID).to.be.equals(wid);

                // extract from framebuffer
                const data1 = renderer.extract.data(sprite, undefined, undefined, false);
                const data2 = renderer.extract.data(stage, undefined, undefined, false);
                const data3 = renderer.extract.data(sprite, customRegion, undefined, false);
                // extract from context
                const data4 = renderer.extract.data(undefined, customStageRegion, undefined, false);
                const data5 = renderer.extract.data(undefined, undefined, undefined, false);

                expect(data1.frame.equals(spriteRegion)).to.be.true;
                expect(data2.frame.equals(stageRegion)).to.be.true;
                expect(data3.frame.equals(customRegion)).to.be.true;
                expect(data4.frame.equals(customStageRegion)).to.be.true;
                expect(data5.frame.equals(renderer.screen)).to.be.true;

                expect(EqualsData(data1, exp1)).to.be.true;
                expect(EqualsData(data2, exp1)).to.be.true;
                expect(EqualsData(data3, exp2)).to.be.true;
                expect(EqualsData(data4, exp2)).to.be.true;
                expect(EqualsData(data5, exp3)).to.be.true;

                data1.normalize();
                data2.normalize();
                data3.normalize();
                data4.normalize();
                data5.normalize();

                expect(EqualsData(data1, exp1)).to.be.true;
                expect(EqualsData(data2, exp1)).to.be.true;
                expect(EqualsData(data3, exp2)).to.be.true;
                expect(EqualsData(data4, exp2)).to.be.true;
                expect(EqualsData(data5, exp3)).to.be.true;

                renderer.destroy();
            }

            for (const key in resources)
            {
                resources[key].texture.destroy(true);
            }

            done();
        });
    });

    it('should extract half-pixels correctly', function (done)
    {
        const renderers = [new PIXI.CanvasRenderer(36, 47, { transparent: true })];

        // renderers.pop();

        if (PIXI.utils.isWebGLSupported())
        {
            renderers.push(new PIXI.WebGLRenderer(36, 47, { transparent: true }));
        }

        const loader = new PIXI.loaders.Loader(`file://${__dirname}/resources/`);

        loader.add('bunny', 'bunny.png');
        loader.add('exp2', 'bunny-alpha-padding.png');
        loader.load(function (loader, resources)
        {
            const stage = new PIXI.Container();
            const sprite = new PIXI.Sprite(resources.bunny.texture);

            const halfPixelRegion = new PIXI.Rectangle(2.5, 1.5, 29, 40);
            const region = new PIXI.Rectangle(2, 1, 30, 41);

            stage.addChild(sprite);
            sprite.position.set(4, 3);
            sprite.alpha = 0.5;
            sprite.updateTransform();

            const exp2 = PIXI.extract.CanvasData.fromImage(resources.exp2.data);

            for (const renderer of renderers)
            {
                renderer.render(stage);

                const data = renderer.extract.data(undefined, halfPixelRegion, undefined, false);

                expect(data.frame.equals(region)).to.be.true;

                expect(EqualsData(data, exp2)).to.be.true;

                renderer.destroy();
            }

            for (const key in resources)
            {
                resources[key].texture.destroy(true);
            }

            done();
        });
    });
});
