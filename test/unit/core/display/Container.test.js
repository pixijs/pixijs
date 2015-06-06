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
                expect(child.parent).to.be.null();
                expect(container).to.be.equals(from);
            });

            container.addChild(child);
            expect(triggeredAdded).to.be.true();
            expect(triggeredRemoved).to.be.false();

            container.removeChild(child);
            expect(triggeredRemoved).to.be.true();
        });

    });
});
