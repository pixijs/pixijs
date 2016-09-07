describe('PIXI.DisplayObject', function () {
    it('should be able to add itself to a Container', function() {
        var child = new PIXI.DisplayObject(),
            container = new PIXI.Container();

        expect(container.children.length).to.equal(0);
        child.setParent(container);
        expect(container.children.length).to.equal(1);
        expect(child.parent).to.equal(container);
    });
});
