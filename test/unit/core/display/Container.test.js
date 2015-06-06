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

            child.on('added', function() {
                triggeredAdded = true;
                expect(container.children.length).to.be.equals(1);
                expect(child.parent).to.be.equals(container);
            });
            child.on('removed', function() {
                triggeredRemoved = true;
                expect(container.children.length).to.be.equals(0);
                expect(child.parent).to.be.null();
            });

            container.addChild(child);
            expect(triggeredAdded).to.be.true();
            expect(triggeredRemoved).to.be.false();

            container.removeChild(child);
            expect(triggeredRemoved).to.be.true();
        });

    });
});
