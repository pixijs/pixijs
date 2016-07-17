describe('toGlobal', function () {


    it('should return correct global cordinates of a point from within a displayObject', function() {

        var parent = new PIXI.Container();

        var container = new PIXI.Container();

        parent.addChild(container);

        var point = new PIXI.Point(100, 100);

        var globalPoint = container.toGlobal(point);

        expect(globalPoint.x).to.equal(100);
        expect(globalPoint.y).to.equal(100);

        container.position.x = 20;
        container.position.y = 20;

        container.scale.x = 2;
        container.scale.y = 2;

        var globalPoint = container.toGlobal(point);

        expect(globalPoint.x).to.equal(220);
        expect(globalPoint.y).to.equal(220);

    });

});
