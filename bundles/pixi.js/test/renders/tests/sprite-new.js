'use strict';

module.exports.async = function (done)
{
    const url = `file://${__dirname}/assets/bitmap-1.png`;
    const loader = new PIXI.loaders.Loader();

    loader.add('bitmap', url);
    loader.once('complete', (loader, resources) =>
    {
        expect(resources.bitmap).to.be.ok;
        expect(resources.bitmap.texture).to.be.ok;
        expect(resources.bitmap.url).to.equal(url);

        const sprite = new PIXI.Sprite(resources.bitmap.texture);

        expect(sprite.width).to.equal(24);
        expect(sprite.height).to.equal(24);

        sprite.x = (32 - sprite.width) / 2;
        sprite.y = (32 - sprite.height) / 2;

        expect(sprite.x).to.equal(4);
        expect(sprite.y).to.equal(4);

        this.stage.addChild(sprite);
        done();
    });
    loader.load();
};
