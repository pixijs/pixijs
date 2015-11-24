describe('PIXI.interaction.InteractionData', function() {
    describe('getLocalPosition', function() {
        it('should populate second parameter with result', function() {
            var data = new PIXI.interaction.InteractionData(),
                displayObject = new PIXI.DisplayObject(),
                point = new PIXI.Point();

            data.getLocalPosition(displayObject, point);

            expect(point).to.exist;
            expect(point).to.be.an.instanceof(PIXI.Point);
            expect(point.x).to.equal(0);
            expect(point.y).to.equal(0);
        });
    });
});
