describe('pixi/display/DisplayObjectContainer', function () {
    'use strict';

    var expect = chai.expect;
    var DisplayObjectContainer = PIXI.DisplayObjectContainer;

    it('Module exists', function () {
        expect(DisplayObjectContainer).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = new DisplayObjectContainer();

        pixi_display_DisplayObjectContainer_confirmNew(obj);
        expect(obj).to.have.property('hitArea', null);
        expect(obj).to.have.property('interactive', false);
        expect(obj).to.have.property('renderable', false);
        expect(obj).to.have.property('stage', null);
    });

    it('Gets child position', function() {
        var container = new PIXI.DisplayObjectContainer();
        var children = [];
        for (var i = 0; i < 10; i++) {
            var child = new PIXI.DisplayObject();
            children.push(child);
            container.addChild(child);
        }

        for (i = 0; i < children.length; i++) {
            expect(i).to.eql(container.getChildIndex(children[i]));
        }
    });

    it('Sets child position', function() {
        var container = new PIXI.DisplayObjectContainer();
        var children = [];

        for (var i = 0; i < 10; i++) {
            var child = new PIXI.DisplayObject();
            children.push(child);
            container.addChild(child);
        }
        children.reverse();

        for (i = 0; i < children.length; i++) {
            container.setChildIndex(children[i], i);
            expect(i).to.eql(container.getChildIndex(children[i]));
        }
    });
});
