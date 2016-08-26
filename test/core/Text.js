describe('PIXI.Text', function () {
    describe('destroy', function () {
        it('should call through to Sprite.destroy', function () {
            var text = new PIXI.Text("foo");

            expect(text.anchor).to.not.equal(null);
            text.destroy();
            expect(text.anchor).to.equal(null);
        });

        it('should set context to null', function () {
            var text = new PIXI.Text("foo");

            expect(text.style).to.not.equal(null);
            text.destroy();
            expect(text.style).to.equal(null);
        });

        it('should destroy children if children flag is set', function () {
            var text = new PIXI.Text("foo"),
                child = new PIXI.DisplayObject();

            text.addChild(child);
            text.destroy({children: true});
            expect(text.transform).to.equal(null);
            expect(child.transform).to.equal(null);
        });

        it('should accept options correctly', function () {
            var text = new PIXI.Text("foo"),
                child = new PIXI.DisplayObject();

            text.addChild(child);
            text.destroy(true);
            expect(text.transform).to.equal(null);
            expect(child.transform).to.equal(null);
        });

        it('should pass opts on to children if children flag is set', function () {
            var text = new PIXI.Text("foo"),
                child = new PIXI.DisplayObject(),
                childDestroyOpts;

            child.destroy = function(opts) {
                childDestroyOpts = opts;
            };

            text.addChild(child);
            text.destroy({children: true, texture: true});
            expect(childDestroyOpts).to.deep.equal({children: true, texture: true, baseTexture:true});
        });

        it('should modify the height of the object when setting height', function () {

             var text = new PIXI.Text("foo");
             text.height = 300;

             expect(text.height).to.equal(300);

        });

        it('should modify the width of the object when setting width', function () {

             var text = new PIXI.Text("foo");
             text.width = 300;

             expect(text.width).to.equal(300);

        });
    });
});
