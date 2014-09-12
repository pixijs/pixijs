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

    it('Gets child index', function() {
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

    it('throws error when trying to get index of not a child', function() {
        var container = new PIXI.DisplayObjectContainer();
        var child = new PIXI.DisplayObject();

        expect(function() { container.getChildIndex(child); }).to.throw();
    });

    it('Sets child index', function() {
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

      it('throws error when trying to set incorect index', function() {
        var container = new PIXI.DisplayObjectContainer();
        var child = new PIXI.DisplayObject();
        container.addChild(child);

        expect(function() { container.setChildIndex(child, -1); }).to.throw();
        expect(function() { container.setChildIndex(child, 1); }).to.throw();
    });
});
