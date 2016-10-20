'use strict';

module.exports.async = function (done)
{
    const url = `file://${__dirname}/assets/bitmap-1.png`;
    const loader = new PIXI.loaders.Loader();

    loader.add('bitmap', url);
    loader.once('complete', (loader, resources) =>
    {
        assert(resources.bitmap);
        assert(resources.bitmap.texture);
        assert.equal(resources.bitmap.url, url);

        const sprite = new PIXI.Sprite(resources.bitmap.texture);

        assert.equal(sprite.width, 24);
        assert.equal(sprite.height, 24);

        sprite.x = (32 - sprite.width) / 2;
        sprite.y = (32 - sprite.height) / 2;

        assert.equal(sprite.x, 4);
        assert.equal(sprite.y, 4);

        this.stage.addChild(sprite);
        done();
    });
    loader.load();
};
