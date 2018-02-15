'use strict';

function getBase64(img)
{
    const canvas = document.createElement('canvas');

    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);

    return canvas.toDataURL();
}

describe('PIXI.extract', function ()
{
    it('should check the region, premultiplyAlpha and flipY', function (done)
    {
        const renderers = [new PIXI.CanvasRenderer(36, 47, { transparent: true })];

        // renderers.pop();
        if (PIXI.utils.isWebGLSupported())
        {
            renderers.push(new PIXI.WebGLRenderer(36, 47, { transparent: true }));
        }

        const loader = new PIXI.loaders.Loader(`file://${__dirname}/resources/`);

        loader.add('bunny1', 'bunny1.png');
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

            const data2 = getBase64(resources.bunny2.data);
            const data3 = getBase64(resources.bunny3.data);
            const data4 = getBase64(resources.bunny4.data);

            for (const renderer of renderers)
            {
                renderer.render(stage);
                expect(renderer.extract.base64(sprite)).to.be.equals(data2);
                expect(renderer.extract.base64(sprite, region)).to.be.equals(data3);
                expect(renderer.extract.base64(undefined, region)).to.be.equals(data3);
                expect(renderer.extract.base64()).to.be.equals(data4);
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
