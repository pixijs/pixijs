describe('pixi/display/Stage', function () {
    'use strict';

    var expect = chai.expect;
    var Stage = PIXI.Stage;
    var InteractionManager = PIXI.InteractionManager;
    var Rectangle = PIXI.Rectangle;

    it('Module exists', function () {
        expect(Stage).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = new Stage(null, true);

        pixi_display_DisplayObjectContainer_confirmNew(obj);

        expect(obj).to.be.an.instanceof(Stage);
        expect(obj).to.respondTo('updateTransform');
        expect(obj).to.respondTo('setBackgroundColor');
        expect(obj).to.respondTo('getMousePosition');
        // FIXME: duplicate member in DisplayObject
        pixi_core_Matrix_confirmNewMatrix(obj.worldTransform);
        // FIXME: convert arg to bool in constructor
        expect(obj).to.have.property('interactive', true);

        expect(obj).to.have.property('interactionManager')
            .and.to.be.an.instanceof(InteractionManager)
            .and.to.have.property('stage', obj);

        expect(obj).to.have.property('dirty', true);

        expect(obj).to.have.property('stage', obj);

        expect(obj).to.have.property('hitArea')
            .and.to.be.an.instanceof(Rectangle);
        pixi_core_Rectangle_confirm(obj.hitArea, 0, 0, 100000, 100000);

        expect(obj).to.have.property('backgroundColor', 0x000000);
        expect(obj).to.have.deep.property('backgroundColorSplit.length', 3);
        expect(obj).to.have.deep.property('backgroundColorSplit[0]', 0);
        expect(obj).to.have.deep.property('backgroundColorSplit[1]', 0);
        expect(obj).to.have.deep.property('backgroundColorSplit[2]', 0);
        expect(obj).to.have.property('backgroundColorString', '#000000');


        expect(obj).to.have.property('worldVisible', true);
    });
});
