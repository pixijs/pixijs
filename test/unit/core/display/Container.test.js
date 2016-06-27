describe('PIXI.Container', function () {
    describe('parent', function () {
        it('should be present when adding children to Container', function() {
            var container = new PIXI.Container(),
                child = new PIXI.DisplayObject();

            expect(container.children.length).to.be.equals(0);
            container.addChild(child);
            expect(container.children.length).to.be.equals(1);
            expect(child.parent).to.be.equals(container);
        });
    });

    describe('events', function () {
        it('should trigger "added" and "removed" events on it\'s children', function () {
            var container = new PIXI.Container(),
                child = new PIXI.DisplayObject(),
                triggeredAdded = false,
                triggeredRemoved = false;

            child.on('added', function(to) {
                triggeredAdded = true;
                expect(container.children.length).to.be.equals(1);
                expect(child.parent).to.be.equals(to);
            });
            child.on('removed', function(from) {
                triggeredRemoved = true;
                expect(container.children.length).to.be.equals(0);
                expect(child.parent).to.be.null;
                expect(container).to.be.equals(from);
            });

            container.addChild(child);
            expect(triggeredAdded).to.be.true;
            expect(triggeredRemoved).to.be.false;

            container.removeChild(child);
            expect(triggeredRemoved).to.be.true;
        });

    });

    describe('destroy', function () {
        it('should call through to DisplayContainer.destroy', function () {
            var container = new PIXI.Container();

            expect(container.transform).to.not.equal(null);
            container.destroy();
            expect(container.transform).to.equal(null);
        });

        it('should set children to null', function () {
            var container = new PIXI.Container();

            expect(container.children).to.deep.equal([]);
            container.destroy();
            expect(container.children).to.equal(null);
        });

        it('should by default not destroy children', function () {
            var container = new PIXI.Container(),
                child = new PIXI.DisplayObject();

            container.addChild(child);
            container.destroy();
            expect(container.transform).to.equal(null);
            expect(child.transform).to.not.equal(null);
        });

        it('should destroy children if children flag is set', function () {
            var container = new PIXI.Container(),
                child = new PIXI.DisplayObject();

            container.addChild(child);
            container.destroy({children: true});
            expect(container.transform).to.equal(null);
            expect(child.transform).to.equal(null);
        });

        it('should pass opts on to children if children flag is set', function () {
            var container = new PIXI.Container(),
                child = new PIXI.DisplayObject(),
                childDestroyOpts;

            child.destroy = function(opts) {
                childDestroyOpts = opts;
            };

            container.addChild(child);
            container.destroy({children: true, texture: true});
            expect(childDestroyOpts).to.deep.equal({children: true, texture: true});
        });

        it('should accept boolean and pass it on to children', function () {
            var container = new PIXI.Container(),
                child = new PIXI.DisplayObject(),
                childDestroyOpts;

            child.destroy = function(opts) {
                childDestroyOpts = opts;
            };

            container.addChild(child);
            container.destroy(true);
            expect(childDestroyOpts).to.deep.equal(true);
        });
    });
});
