describe('PIXI.Sprite', function () {
    describe('width', function () {
        it('should not be negative for nagative scale.x', function () {
            var sprite = new PIXI.Sprite();

            sprite.width = 100;
            expect(sprite.width).to.be.at.least(0);
            sprite.scale.x = -1;
            expect(sprite.width).to.be.at.least(0);
        });

        it('should not change sign of scale.x', function () {
            var texture = new PIXI.Texture(new PIXI.BaseTexture());
            var sprite = new PIXI.Sprite();

            texture.width = 100;
            sprite.scale.x = 1;
            sprite.width = 50;

            expect(sprite.scale.x).to.be.above(0);

            sprite.scale.x = -1;
            sprite.width = 75;

            expect(sprite.scale.x).to.be.below(0);
        });
    });

    describe('height', function () {
        it('should not be negative for nagative scale.y', function () {
            var sprite = new PIXI.Sprite();

            sprite.height = 100;
            expect(sprite.height).to.be.at.least(0);
            sprite.scale.y = -1;
            expect(sprite.height).to.be.at.least(0);
        });

        it('should not change sign of scale.y', function () {
            var texture = new PIXI.Texture(new PIXI.BaseTexture());
            var sprite = new PIXI.Sprite();

            texture.height = 100;
            sprite.scale.y = 1;
            sprite.height = 50;

            expect(sprite.scale.y).to.be.above(0);

            sprite.scale.y = -1;
            sprite.height = 75;

            expect(sprite.scale.y).to.be.below(0);
        });
    });
});
