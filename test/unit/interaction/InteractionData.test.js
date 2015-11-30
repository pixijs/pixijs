describe('PIXI.interaction.InteractionData', function() {
    describe('getLocalPosition', function() {
        it('should populate second parameter with result', function() {
            var data = new PIXI.interaction.InteractionData(),
                displayObject = new PIXI.DisplayObject(),
                point = new PIXI.Point();

            data.global.set(10, 10);
            displayObject.position.set(5, 3);

            data.getLocalPosition(displayObject, point);

            expect(point.x).to.equal(5);
            expect(point.y).to.equal(7);
        });
    });
});
