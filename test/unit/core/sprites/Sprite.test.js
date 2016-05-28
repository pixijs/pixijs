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

    describe('destroy', function () {
        it('should call through to Container.destroy', function () {
            var sprite = new PIXI.Sprite();

            expect(sprite.children).to.not.equal(null);
            sprite.destroy();
            expect(sprite.children).to.equal(null);
        });

        it('should set anchor and texture to null', function () {
            var sprite = new PIXI.Sprite();

            expect(sprite.anchor).to.not.equal(null);
            expect(sprite.texture).to.not.equal(null);
            sprite.destroy();
            expect(sprite.anchor).to.equal(null);
            expect(sprite.texture).to.equal(null);
        });

        it('by default should not destroy texture', function () {
            var sprite = new PIXI.Sprite();
            var textureDestroyed = false;

            sprite.texture.destroy = function() { textureDestroyed = true; };

            sprite.destroy();
            expect(textureDestroyed).to.equal(false);
        });

        it('should destroy texture when texture flag is set', function () {
            var sprite = new PIXI.Sprite();
            var textureDestroyed = false;

            sprite.texture.destroy = function() { textureDestroyed = true; };

            sprite.destroy({texture: true});
            expect(textureDestroyed).to.equal(true);
        });

        it('by default should not destroy baseTexture', function () {
            var sprite = new PIXI.Sprite();
            var textureDestroyArg;

            sprite.texture.destroy = function(arg) { textureDestroyArg = arg; };

            sprite.destroy({texture: true});
            expect(textureDestroyArg).to.equal(false);
        });

        it('should destroy baseTexture if baseTexture flag is set', function () {
            var sprite = new PIXI.Sprite();
            var textureDestroyArg;

            sprite.texture.destroy = function(arg) { textureDestroyArg = arg; };

            sprite.destroy({texture: true, baseTexture: true});
            expect(textureDestroyArg).to.equal(true);
        });

        it('should correctly handle boolean', function () {
            var sprite = new PIXI.Sprite();
            var textureDestroyArg;

            sprite.texture.destroy = function(arg) { textureDestroyArg = arg; };

            sprite.destroy(true);
            expect(textureDestroyArg).to.equal(true);
        });

        it('should pass opts on to children if children flag is set', function () {
            var sprite = new PIXI.Sprite(),
                child = new PIXI.DisplayObject(),
                childDestroyOpts;

            child.destroy = function(opts) {
                childDestroyOpts = opts;
            };

            sprite.addChild(child);
            sprite.destroy({children: true, texture: true});
            expect(childDestroyOpts).to.deep.equal({children: true, texture: true});
        });

        it('should pass bool on to children', function () {
            var sprite = new PIXI.Sprite(),
                child = new PIXI.DisplayObject(),
                childDestroyOpts;

            child.destroy = function(opts) {
                childDestroyOpts = opts;
            };

            sprite.addChild(child);
            sprite.destroy(true);
            expect(childDestroyOpts).to.deep.equal(true);
        });
    });
});
