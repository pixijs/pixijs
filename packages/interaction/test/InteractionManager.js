const MockPointer = require('./MockPointer');
const { Container } = require('@pixi/display');
const { Ticker } = require('@pixi/ticker');
const { Graphics } = require('@pixi/graphics');
const { Point, Rectangle } = require('@pixi/math');
const { CanvasRenderer } = require('@pixi/canvas-renderer');
const { InteractionManager } = require('../');
const { CanvasGraphicsRenderer } = require('@pixi/canvas-graphics');
const { CanvasSpriteRenderer } = require('@pixi/canvas-sprite');
const { Sprite } = require('@pixi/sprite');

require('@pixi/canvas-display');

CanvasRenderer.registerPlugin('interaction', InteractionManager);
CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);
CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);

describe('PIXI.interaction.InteractionManager', function ()
{
    afterEach(function ()
    {
        // if we made a MockPointer for the test, clean it up
        if (this.pointer)
        {
            this.pointer.cleanUp();
            this.pointer = null;
        }
    });

    describe('event basics', function ()
    {
        it('should call mousedown handler', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mousedown', eventSpy);

            pointer.mousedown(10, 10);

            expect(eventSpy).to.have.been.calledOnce;
        });

        it('should call mouseup handler', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseup', eventSpy);

            pointer.click(10, 10);

            expect(eventSpy).to.have.been.called;
        });

        it('should call mouseupoutside handler', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseupoutside', eventSpy);

            pointer.mousedown(10, 10);
            pointer.mouseup(60, 60);

            expect(eventSpy).to.have.been.called;
        });

        it('should call mouseupoutside handler on mouseup on different elements', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseupoutside', eventSpy);

            pointer.mousedown(10, 10);
            pointer.mouseup(10, 10, false);

            expect(eventSpy).to.have.been.called;
        });

        it('should call mouseover handler', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseover', eventSpy);

            pointer.mousemove(10, 10);

            expect(eventSpy).to.have.been.called;
        });

        it('should call mouseout handler', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseout', eventSpy);

            pointer.mousemove(10, 10);
            pointer.mousemove(60, 60);

            expect(eventSpy).to.have.been.called;
        });

        it('should always call mouseout before mouseover', function ()
        {
            const stage = new Container();
            const graphicsA = new Graphics();
            const graphicsB = new Graphics();

            const mouseOverSpyA = sinon.spy();
            const mouseOutSpyA = sinon.spy();

            const mouseOverSpyB = sinon.spy();
            const mouseOutSpyB = sinon.spy();

            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphicsA);
            graphicsA.beginFill(0xFFFFFF);
            graphicsA.drawRect(0, 0, 50, 50);
            graphicsA.interactive = true;

            graphicsA.on('mouseover', mouseOverSpyA);
            graphicsA.on('mouseout', mouseOutSpyA);

            stage.addChild(graphicsB);
            graphicsB.x = 25;
            graphicsB.beginFill(0xFFFFFF);
            graphicsB.drawRect(0, 0, 50, 50);
            graphicsB.interactive = true;

            graphicsB.on('mouseover', mouseOverSpyB);
            graphicsB.on('mouseout', mouseOutSpyB);

            pointer.mousemove(10, 10);

            expect(mouseOverSpyA).to.have.been.called;

            pointer.mousemove(40, 10);

            expect(mouseOutSpyA).to.have.been.calledImmediatelyBefore(mouseOverSpyB);

            pointer.mousemove(10, 10);

            expect(mouseOutSpyB).to.have.been.calledImmediatelyBefore(mouseOverSpyA);
        });
    });

    describe('event propagation', function ()
    {
        it('should stop event propagation', function ()
        {
            const stage = new Container();
            const parent = new Container();
            const graphics = new Graphics();

            const pointer = this.pointer = new MockPointer(stage);

            const mouseDownChild = sinon.spy((evt) => evt.stopPropagation());
            const mouseDownParent = sinon.spy();

            stage.addChild(parent);
            parent.addChild(graphics);

            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            parent.interactive = true;

            graphics.on('mousedown', mouseDownChild);

            parent.on('mousedown', mouseDownParent);

            pointer.mousedown(10, 10);

            expect(mouseDownChild).to.have.been.called;
            expect(mouseDownParent).to.not.have.been.called;
        });

        it('should not stop events on the same object from happening', function ()
        {
            const stage = new Container();
            const parent = new Container();
            const graphics = new Graphics();

            const pointer = this.pointer = new MockPointer(stage);

            // Neither of these should stop the other from firing
            const mouseMoveChild = sinon.spy((evt) => evt.stopPropagation());
            const mouseOverChild = sinon.spy((evt) => evt.stopPropagation());

            const mouseMoveParent = sinon.spy();
            const mouseOverParent = sinon.spy();

            stage.addChild(parent);
            parent.addChild(graphics);

            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            parent.interactive = true;

            graphics.on('mousemove', mouseMoveChild);
            graphics.on('mouseover', mouseOverChild);

            parent.on('mousemove', mouseMoveParent);
            parent.on('mouseover', mouseOverParent);

            pointer.mousemove(10, 10);

            expect(mouseOverChild).to.have.been.called;
            expect(mouseMoveChild).to.have.been.called;

            expect(mouseOverParent).to.not.have.been.called;
            expect(mouseMoveParent).to.not.have.been.called;
        });

        it('should not stop events on children of an object from happening', function ()
        {
            const stage = new Container();
            const parent = new Container();
            const graphics = new Graphics();

            const pointer = this.pointer = new MockPointer(stage);

            const mouseMoveChild = sinon.spy();
            const mouseMoveParent = sinon.spy((evt) => evt.stopPropagation());

            const mouseOverChild = sinon.spy();
            const mouseOverParent = sinon.spy();

            stage.addChild(parent);
            parent.addChild(graphics);

            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            parent.interactive = true;

            graphics.on('mousemove', mouseMoveChild);
            graphics.on('mouseover', mouseOverChild);

            parent.on('mousemove', mouseMoveParent);
            parent.on('mouseover', mouseOverParent);

            pointer.mousemove(10, 10);

            expect(mouseMoveChild).to.have.been.called;
            expect(mouseOverChild).to.have.been.called;

            expect(mouseMoveParent).to.have.been.called;
            expect(mouseOverParent).to.have.been.called;
        });
    });

    describe('touch vs pointer', function ()
    {
        it('should call touchstart and pointerdown when touch event and pointer supported', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const touchSpy = sinon.spy(function touchListen() { /* noop */ });
            const pointerSpy = sinon.spy(function pointerListen() { /* noop */ });
            const pointer = this.pointer = new MockPointer(stage, null, null, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('touchstart', touchSpy);
            graphics.on('pointerdown', pointerSpy);

            pointer.touchstart(10, 10);

            expect(touchSpy).to.have.been.calledOnce;
            expect(pointerSpy).to.have.been.calledOnce;
        });

        it('should not call touchstart or pointerdown when pointer event and touch supported', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const touchSpy = sinon.spy(function touchListen() { /* noop */ });
            const pointerSpy = sinon.spy(function pointerListen() { /* noop */ });
            const pointer = this.pointer = new MockPointer(stage, null, null, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('touchstart', touchSpy);
            graphics.on('pointerdown', pointerSpy);

            pointer.touchstart(10, 10, 0, true);

            expect(touchSpy).to.not.have.been.called;
            expect(pointerSpy).to.not.have.been.called;
        });

        it('should call touchstart and pointerdown when touch event and pointer not supported', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const touchSpy = sinon.spy(function touchListen() { /* noop */ });
            const pointerSpy = sinon.spy(function pointerListen() { /* noop */ });
            const pointer = this.pointer = new MockPointer(stage, null, null, false);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('touchstart', touchSpy);
            graphics.on('pointerdown', pointerSpy);

            pointer.touchstart(10, 10);

            expect(touchSpy).to.have.been.calledOnce;
            expect(pointerSpy).to.have.been.calledOnce;
        });

        it('should call touchstart and pointerdown when pointer event and touch not supported', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const touchSpy = sinon.spy(function touchListen() { /* noop */ });
            const pointerSpy = sinon.spy(function pointerListen() { /* noop */ });
            const pointer = this.pointer = new MockPointer(stage, null, null, true);

            pointer.interaction.supportsTouchEvents = false;

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('touchstart', touchSpy);
            graphics.on('pointerdown', pointerSpy);

            pointer.touchstart(10, 10, 0, true);

            expect(touchSpy).to.have.been.calledOnce;
            expect(pointerSpy).to.have.been.calledOnce;
        });
    });

    describe('add/remove events and ticker', function ()
    {
        let stub;

        before(function ()
        {
            stub = sinon.stub(InteractionManager.prototype, 'setTargetElement');
        });

        after(function ()
        {
            stub.restore();
        });

        it('should add and remove pointer events to document', function ()
        {
            const manager = new InteractionManager(sinon.stub());
            const addSpy = sinon.spy(window.document, 'addEventListener');
            const removeSpy = sinon.spy(window.document, 'removeEventListener');

            manager.interactionDOMElement = { style: {}, addEventListener: sinon.stub(), removeEventListener: sinon.stub() };
            manager.supportsPointerEvents = true;

            manager.addEvents();

            expect(addSpy).to.have.been.calledOnce;
            expect(addSpy).to.have.been.calledWith('pointermove');

            manager.removeEvents();

            expect(removeSpy).to.have.been.calledOnce;
            expect(removeSpy).to.have.been.calledWith('pointermove');

            addSpy.restore();
            removeSpy.restore();
        });

        it('should add and remove pointer events to window', function ()
        {
            const manager = new InteractionManager(sinon.stub());
            const addSpy = sinon.spy(window, 'addEventListener');
            const removeSpy = sinon.spy(window, 'removeEventListener');

            manager.interactionDOMElement = { style: {}, addEventListener: sinon.stub(), removeEventListener: sinon.stub() };
            manager.supportsPointerEvents = true;

            manager.addEvents();

            expect(addSpy).to.have.been.calledTwice;
            expect(addSpy).to.have.been.calledWith('pointercancel');
            expect(addSpy).to.have.been.calledWith('pointerup');

            manager.removeEvents();

            expect(removeSpy).to.have.been.calledTwice;
            expect(removeSpy).to.have.been.calledWith('pointercancel');
            expect(removeSpy).to.have.been.calledWith('pointerup');

            addSpy.restore();
            removeSpy.restore();
        });

        it('should add and remove pointer events to element seven times when touch events are supported', function ()
        {
            const manager = new InteractionManager(sinon.stub());
            const element = { style: {}, addEventListener: sinon.stub(), removeEventListener: sinon.stub() };

            manager.interactionDOMElement = element;
            manager.supportsPointerEvents = true;
            manager.supportsTouchEvents = true;

            manager.addEvents();

            expect(element.addEventListener).to.have.been.callCount(7);
            expect(element.addEventListener).to.have.been.calledWith('pointerdown');
            expect(element.addEventListener).to.have.been.calledWith('pointerleave');
            expect(element.addEventListener).to.have.been.calledWith('pointerover');

            expect(element.addEventListener).to.have.been.calledWith('touchstart');
            expect(element.addEventListener).to.have.been.calledWith('touchcancel');
            expect(element.addEventListener).to.have.been.calledWith('touchend');
            expect(element.addEventListener).to.have.been.calledWith('touchmove');

            manager.removeEvents();

            expect(element.removeEventListener).to.have.been.callCount(7);
            expect(element.removeEventListener).to.have.been.calledWith('pointerdown');
            expect(element.removeEventListener).to.have.been.calledWith('pointerleave');
            expect(element.removeEventListener).to.have.been.calledWith('pointerover');

            expect(element.removeEventListener).to.have.been.calledWith('touchstart');
            expect(element.removeEventListener).to.have.been.calledWith('touchcancel');
            expect(element.removeEventListener).to.have.been.calledWith('touchend');
            expect(element.removeEventListener).to.have.been.calledWith('touchmove');
        });

        it('should add and remove pointer events to element three times when touch events are not supported', function ()
        {
            const manager = new InteractionManager(sinon.stub());
            const element = { style: {}, addEventListener: sinon.stub(), removeEventListener: sinon.stub() };

            manager.interactionDOMElement = element;
            manager.supportsPointerEvents = true;
            manager.supportsTouchEvents = false;

            manager.addEvents();

            expect(element.addEventListener).to.have.been.calledThrice;
            expect(element.addEventListener).to.have.been.calledWith('pointerdown');
            expect(element.addEventListener).to.have.been.calledWith('pointerleave');
            expect(element.addEventListener).to.have.been.calledWith('pointerover');

            manager.removeEvents();

            expect(element.removeEventListener).to.have.been.calledThrice;
            expect(element.removeEventListener).to.have.been.calledWith('pointerdown');
            expect(element.removeEventListener).to.have.been.calledWith('pointerleave');
            expect(element.removeEventListener).to.have.been.calledWith('pointerover');
        });

        it('should add and remove mouse events to document', function ()
        {
            const manager = new InteractionManager(sinon.stub());
            const addSpy = sinon.spy(window.document, 'addEventListener');
            const removeSpy = sinon.spy(window.document, 'removeEventListener');

            manager.interactionDOMElement = { style: {}, addEventListener: sinon.stub(), removeEventListener: sinon.stub() };
            manager.supportsPointerEvents = false;

            manager.addEvents();

            expect(addSpy).to.have.been.calledOnce;
            expect(addSpy).to.have.been.calledWith('mousemove');

            manager.removeEvents();

            expect(removeSpy).to.have.been.calledOnce;
            expect(removeSpy).to.have.been.calledWith('mousemove');

            addSpy.restore();
            removeSpy.restore();
        });

        it('should add and remove mouse events to window', function ()
        {
            const manager = new InteractionManager(sinon.stub());
            const addSpy = sinon.spy(window, 'addEventListener');
            const removeSpy = sinon.spy(window, 'removeEventListener');

            manager.interactionDOMElement = { style: {}, addEventListener: sinon.stub(), removeEventListener: sinon.stub() };
            manager.supportsPointerEvents = false;

            manager.addEvents();

            expect(addSpy).to.have.been.calledOnce;
            expect(addSpy).to.have.been.calledWith('mouseup');

            manager.removeEvents();

            expect(removeSpy).to.have.been.calledOnce;
            expect(removeSpy).to.have.been.calledWith('mouseup');

            addSpy.restore();
            removeSpy.restore();
        });

        it('should add and remove mouse events to element', function ()
        {
            const manager = new InteractionManager(sinon.stub());
            const element = { style: {}, addEventListener: sinon.stub(), removeEventListener: sinon.stub() };

            manager.interactionDOMElement = element;
            manager.supportsPointerEvents = false;
            manager.supportsTouchEvents = false;

            manager.addEvents();

            expect(element.addEventListener).to.have.been.calledThrice;
            expect(element.addEventListener).to.have.been.calledWith('mousedown');
            expect(element.addEventListener).to.have.been.calledWith('mouseout');
            expect(element.addEventListener).to.have.been.calledWith('mouseover');

            manager.removeEvents();

            expect(element.removeEventListener).to.have.been.calledThrice;
            expect(element.removeEventListener).to.have.been.calledWith('mousedown');
            expect(element.removeEventListener).to.have.been.calledWith('mouseout');
            expect(element.removeEventListener).to.have.been.calledWith('mouseover');
        });

        it('should add and remove touch events to element without pointer events', function ()
        {
            const manager = new InteractionManager(sinon.stub());
            const element = { style: {}, addEventListener: sinon.stub(), removeEventListener: sinon.stub() };

            manager.interactionDOMElement = element;
            manager.supportsPointerEvents = false;
            manager.supportsTouchEvents = true;

            manager.addEvents();

            expect(element.addEventListener).to.have.been.calledWith('touchstart');
            expect(element.addEventListener).to.have.been.calledWith('touchcancel');
            expect(element.addEventListener).to.have.been.calledWith('touchend');
            expect(element.addEventListener).to.have.been.calledWith('touchmove');

            manager.removeEvents();

            expect(element.removeEventListener).to.have.been.calledWith('touchstart');
            expect(element.removeEventListener).to.have.been.calledWith('touchcancel');
            expect(element.removeEventListener).to.have.been.calledWith('touchend');
            expect(element.removeEventListener).to.have.been.calledWith('touchmove');
        });

        it('should add and remove touch events to element with pointer events', function ()
        {
            const manager = new InteractionManager(sinon.stub());
            const element = { style: {}, addEventListener: sinon.stub(), removeEventListener: sinon.stub() };

            manager.interactionDOMElement = element;
            manager.supportsPointerEvents = true;
            manager.supportsTouchEvents = true;

            manager.addEvents();

            expect(element.addEventListener).to.have.been.calledWith('touchstart');
            expect(element.addEventListener).to.have.been.calledWith('touchcancel');
            expect(element.addEventListener).to.have.been.calledWith('touchend');
            expect(element.addEventListener).to.have.been.calledWith('touchmove');

            manager.removeEvents();

            expect(element.removeEventListener).to.have.been.calledWith('touchstart');
            expect(element.removeEventListener).to.have.been.calledWith('touchcancel');
            expect(element.removeEventListener).to.have.been.calledWith('touchend');
            expect(element.removeEventListener).to.have.been.calledWith('touchmove');
        });

        it('should add and remove Ticker.system listener', function ()
        {
            const manager = new InteractionManager(sinon.stub());

            const element = {};

            manager.interactionDOMElement = element;

            const listenerCount = Ticker.system.count;

            manager.addTickerListener();

            expect(Ticker.system.count).to.equal(listenerCount + 1);

            manager.useSystemTicker = false;

            expect(Ticker.system.count).to.equal(listenerCount);

            manager.useSystemTicker = true;

            expect(Ticker.system.count).to.equal(listenerCount + 1);

            manager.removeTickerListener();

            expect(Ticker.system.count).to.equal(listenerCount);

            manager.useSystemTicker = false;

            expect(Ticker.system.count).to.equal(listenerCount);

            manager.addTickerListener();

            expect(Ticker.system.count).to.equal(listenerCount);
        });
    });

    describe('onClick', function ()
    {
        it('should call handler when inside', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('click', clickSpy);

            pointer.click(10, 10);

            expect(clickSpy).to.have.been.calledOnce;
        });

        it('should not call handler when outside', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('click', clickSpy);

            pointer.click(60, 60);

            expect(clickSpy).to.not.have.been.called;
        });

        it('should not call handler when mousedown not received', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = sinon.spy();
            const pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('click', clickSpy);

            pointer.mouseup(10, 10);

            expect(clickSpy, 'click should not happen on first mouseup').to.not.have.been.called;

            // test again, just because it was a bug that was reported
            pointer.mouseup(20, 20);

            expect(clickSpy, 'click should not happen on second mouseup').to.not.have.been.called;
        });
    });

    describe('onTap', function ()
    {
        it('should call handler when inside', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('tap', clickSpy);

            pointer.tap(10, 10);

            expect(clickSpy).to.have.been.calledOnce;
        });

        it('should not call handler when outside', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('tap', clickSpy);

            pointer.tap(60, 60);

            expect(clickSpy).to.not.have.been.called;
        });

        it('should not call handler when moved to other sprite', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const graphics2 = new Graphics();
            const clickSpy = sinon.spy();
            const overSpy = sinon.spy();
            const endSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.name = 'graphics1';

            stage.addChild(graphics2);
            graphics2.beginFill(0xFFFFFF);
            graphics2.drawRect(75, 75, 50, 50);
            graphics2.interactive = true;
            graphics2.on('tap', clickSpy);
            graphics2.on('touchmove', overSpy);
            graphics2.on('touchend', endSpy);
            graphics2.name = 'graphics2';

            pointer.touchstart(25, 25, 3);
            pointer.touchmove(60, 60, 3);
            pointer.touchmove(80, 80, 3);
            pointer.touchend(80, 80, 3);

            expect(overSpy).to.have.been.called;
            expect(endSpy).to.have.been.called;
            expect(clickSpy).to.not.have.been.called;
        });
    });

    describe('pointertap', function ()
    {
        it('should call handler when inside', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('pointertap', clickSpy);

            pointer.click(10, 10, true);

            expect(clickSpy).to.have.been.calledOnce;
        });

        it('should not call handler when outside', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const clickSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('pointertap', clickSpy);

            pointer.click(60, 60, true);

            expect(clickSpy).to.not.have.been.called;
        });

        it('with mouse events, should not call handler when moved to other sprite', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const graphics2 = new Graphics();
            const overSpy = sinon.spy();
            const upSpy = sinon.spy();
            const clickSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.name = 'graphics1';

            stage.addChild(graphics2);
            graphics2.beginFill(0xFFFFFF);
            graphics2.drawRect(75, 75, 50, 50);
            graphics2.interactive = true;
            graphics2.on('pointertap', clickSpy);
            graphics2.on('pointerover', overSpy);
            graphics2.on('pointerup', upSpy);
            graphics2.name = 'graphics2';

            pointer.mousedown(25, 25);
            pointer.mousemove(60, 60);
            pointer.mousemove(80, 80);
            pointer.mouseup(80, 80);

            expect(overSpy).to.have.been.called;
            expect(upSpy).to.have.been.called;
            expect(clickSpy).to.not.have.been.called;
        });

        it('with pointer events, should not call handler when moved to other sprite', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const graphics2 = new Graphics();
            const overSpy = sinon.spy();
            const upSpy = sinon.spy();
            const clickSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.name = 'graphics1';

            stage.addChild(graphics2);
            graphics2.beginFill(0xFFFFFF);
            graphics2.drawRect(75, 75, 50, 50);
            graphics2.interactive = true;
            graphics2.on('pointertap', clickSpy);
            graphics2.on('pointerover', overSpy);
            graphics2.on('pointerup', upSpy);
            graphics2.name = 'graphics2';

            pointer.mousedown(25, 25, true);
            pointer.mousemove(60, 60, true);
            pointer.mousemove(80, 80, true);
            pointer.mouseup(80, 80, true);

            expect(overSpy).to.have.been.called;
            expect(upSpy).to.have.been.called;
            expect(clickSpy).to.not.have.been.called;
        });

        it('with touch events, should not call handler when moved to other sprite', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const graphics2 = new Graphics();
            const moveSpy = sinon.spy();
            const upSpy = sinon.spy();
            const clickSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.name = 'graphics1';

            stage.addChild(graphics2);
            graphics2.beginFill(0xFFFFFF);
            graphics2.drawRect(75, 75, 50, 50);
            graphics2.interactive = true;
            graphics2.on('pointertap', clickSpy);
            graphics2.on('pointermove', moveSpy);
            graphics2.on('pointerup', upSpy);
            graphics2.name = 'graphics2';

            pointer.touchstart(25, 25, true);
            pointer.touchmove(60, 60, true);
            pointer.touchmove(80, 80, true);
            pointer.touchend(80, 80, true);

            expect(moveSpy).to.have.been.called;
            expect(upSpy).to.have.been.called;
            expect(clickSpy).to.not.have.been.called;
        });
    });

    describe('overlapping children', function ()
    {
        function getScene(callbackEventName, splitParents)
        {
            const behindChild = new Graphics();
            const frontChild = new Graphics();
            const parent = new Container();
            const behindChildCallback = sinon.spy(function behindSpy() { /* no op*/ });
            const frontChildCallback = sinon.spy(function frontSpy() { /* no op*/ });
            const parentCallback = sinon.spy(function parentSpy() { /* no op*/ });
            let behindParent;
            let frontParent;
            let behindParentCallback;
            let frontParentCallback;

            behindChild.beginFill(0xFF);
            behindChild.drawRect(0, 0, 50, 50);
            behindChild.on(callbackEventName, behindChildCallback);
            behindChild.name = 'behind';

            frontChild.beginFill(0x00FF);
            frontChild.drawRect(0, 0, 50, 50);
            frontChild.on(callbackEventName, frontChildCallback);
            frontChild.name = 'front';

            if (splitParents)
            {
                behindParent = new Container();
                behindParent.name = 'behindParent';
                frontParent = new Container();
                frontParent.name = 'frontParent';
                behindParentCallback = sinon.spy(function behindParentSpy() { /* no op*/ });
                frontParentCallback = sinon.spy(function frontParentSpy() { /* no op*/ });
                behindParent.on(callbackEventName, behindParentCallback);
                frontParent.on(callbackEventName, frontParentCallback);

                parent.addChild(behindParent, frontParent);
                behindParent.addChild(behindChild);
                frontParent.addChild(frontChild);

                parent.name = 'parent';
            }
            else
            {
                parent.addChild(behindChild, frontChild);
            }
            parent.on(callbackEventName, parentCallback);

            return {
                behindChild,
                frontChild,
                behindParent,
                frontParent,
                parent,
                behindChildCallback,
                frontChildCallback,
                behindParentCallback,
                frontParentCallback,
                parentCallback,
            };
        }

        describe('when parent is non-interactive', function ()
        {
            describe('when both children are interactive', function ()
            {
                it('should callback front child when clicking front child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.not.have.been.called;
                });

                it('should callback front child when clicking overlap', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.not.have.been.called;
                });

                it('should callback behind child when clicking behind child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).to.not.have.been.called;
                    expect(scene.behindChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.not.have.been.called;
                });

                it('should callback front child of different non-interactive parents when clicking overlap', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click', true);

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.not.have.been.called;
                    expect(scene.behindParentCallback).to.not.have.been.called;
                    expect(scene.frontParentCallback).to.not.have.been.called;
                });

                it('should callback front child of different interactive parents when clicking overlap', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click', true);

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.behindParent.interactive = true;
                    scene.frontParent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.not.have.been.called;
                    expect(scene.behindParentCallback).to.not.have.been.called;
                    expect(scene.frontParentCallback).to.have.been.calledOnce;
                });
            });

            describe('when front child is non-interactive', function ()
            {
                it('should not callback when clicking front child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.not.have.been.called;
                    expect(scene.parentCallback).to.not.have.been.called;
                });

                it('should callback behind child when clicking overlap', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).to.have.been.calledOnce;
                    expect(scene.frontChildCallback).to.not.have.been.called;
                    expect(scene.parentCallback).to.not.have.been.called;
                });

                it('should callback behind child when clicking behind child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).to.not.have.been.called;
                    expect(scene.behindChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.not.have.been.called;
                });
            });

            describe('when behind child is non-interactive', function ()
            {
                it('should callback front child when clicking front child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.not.have.been.called;
                });

                it('should callback front child when clicking overlap', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.not.have.been.called;
                });

                it('should not callback when clicking behind child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).to.not.have.been.called;
                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.parentCallback).to.not.have.been.called;
                });
            });
        });

        describe('when parent is interactive', function ()
        {
            describe('when both children are interactive', function ()
            {
                it('should callback parent and front child when clicking front child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.have.been.calledOnce;
                });

                it('should callback parent and front child when clicking overlap', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.have.been.calledOnce;
                });

                it('should callback parent and behind child when clicking behind child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).to.not.have.been.called;
                    expect(scene.behindChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.have.been.calledOnce;
                });

                it('should callback front child of different non-interactive parents when clicking overlap', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click', true);

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.have.been.calledOnce;
                    expect(scene.behindParentCallback).to.not.have.been.called;
                    expect(scene.frontParentCallback).to.not.have.been.called;
                });

                it('should callback front child of different interactive parents when clicking overlap', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click', true);

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;
                    scene.behindParent.interactive = true;
                    scene.frontParent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.have.been.calledOnce;
                    expect(scene.behindParentCallback).to.not.have.been.called;
                    expect(scene.frontParentCallback).to.have.been.calledOnce;
                });
            });

            describe('when front child is non-interactive', function ()
            {
                it('should callback parent when clicking front child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.not.have.been.called;
                    expect(scene.parentCallback).to.have.been.calledOnce;
                });

                it('should callback parent and behind child when clicking overlap', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).to.have.been.calledOnce;
                    expect(scene.frontChildCallback).to.not.have.been.called;
                    expect(scene.parentCallback).to.have.been.calledOnce;
                });

                it('should callback parent and behind child when clicking behind child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.interactive = true;
                    scene.behindChild.x = 25;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).to.not.have.been.called;
                    expect(scene.behindChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.have.been.calledOnce;
                });
            });

            describe('when behind child is non-interactive', function ()
            {
                it('should callback parent and front child when clicking front child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(10, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.have.been.calledOnce;
                });

                it('should callback parent and front child when clicking overlap', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(40, 10);

                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.frontChildCallback).to.have.been.calledOnce;
                    expect(scene.parentCallback).to.have.been.calledOnce;
                });

                it('should callback parent when clicking behind child', function ()
                {
                    const stage = new Container();
                    const pointer = this.pointer = new MockPointer(stage);
                    const scene = getScene('click');

                    scene.behindChild.x = 25;
                    scene.frontChild.interactive = true;
                    scene.parent.interactive = true;

                    stage.addChild(scene.parent);
                    pointer.click(60, 10);

                    expect(scene.frontChildCallback).to.not.have.been.called;
                    expect(scene.behindChildCallback).to.not.have.been.called;
                    expect(scene.parentCallback).to.have.been.calledOnce;
                });
            });
        });

        it('Semi-complicated nesting with overlap, should not call behind callback', function ()
        {
            const stage = new Container();
            const frontParent = new Container();
            const frontChild = new Graphics();
            const behindParent = new Container();
            const subParent = new Container();
            const behindChild = new Graphics();
            const behindCallback = sinon.spy(function behindSpy() { /* no op*/ });
            const frontCallback = sinon.spy(function frontSpy() { /* no op*/ });

            behindChild.beginFill(0xFF);
            behindChild.drawRect(0, 0, 50, 50);
            subParent.on('click', behindCallback);

            frontChild.beginFill(0x00FF);
            frontChild.drawRect(0, 0, 50, 50);
            frontParent.on('click', frontCallback);
            const pointer = this.pointer = new MockPointer(stage);

            behindParent.x = 25;
            subParent.interactive = true;
            frontParent.interactive = true;

            behindParent.addChild(subParent);
            subParent.addChild(behindChild);
            stage.addChild(behindParent);
            frontParent.addChild(frontChild);
            stage.addChild(frontParent);

            pointer.click(40, 10);

            expect(behindCallback).to.not.have.been.called;
            expect(frontCallback).to.have.been.calledOnce;
        });
    });

    describe('masks', function ()
    {
        it('should trigger interaction callback when no mask present', function ()
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = sinon.spy();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            mask.beginFill();
            mask.drawRect(0, 0, 50, 50);
            graphics.mask = mask;

            pointer.click(10, 10);

            expect(spy).to.have.been.calledOnce;
        });

        it('should trigger interaction callback when mask uses beginFill', function ()
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = sinon.spy();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            mask.beginFill();
            mask.drawRect(0, 0, 50, 50);
            graphics.mask = mask;

            pointer.click(10, 10);

            expect(spy).to.have.been.calledOnce;
        });

        it('should trigger interaction callback on child when inside of parents mask', function ()
        {
            const stage = new Container();
            const parent = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = sinon.spy();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(parent);
            parent.addChild(graphics);
            mask.beginFill();
            mask.drawRect(0, 0, 25, 25);
            parent.mask = mask;

            pointer.click(10, 10);

            expect(spy).to.have.been.calledOnce;
        });

        it('should not trigger interaction callback on child when outside of parents mask', function ()
        {
            const stage = new Container();
            const parent = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = sinon.spy();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(parent);
            parent.addChild(graphics);
            mask.beginFill();
            mask.drawRect(0, 0, 25, 25);
            parent.mask = mask;

            pointer.click(30, 30);

            expect(spy).to.have.not.been.calledOnce;
        });

        it('should not trigger interaction callback when mask doesn\'t use beginFill', function ()
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = sinon.spy();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            mask.drawRect(0, 0, 50, 50);
            graphics.mask = mask;

            pointer.click(10, 10);

            expect(spy).to.have.not.been.called;
        });

        it('should trigger interaction callback when mask doesn\'t use beginFill but hitArea is defined', function ()
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = sinon.spy();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.hitArea = new Rectangle(0, 0, 50, 50);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            mask.drawRect(0, 0, 50, 50);
            graphics.mask = mask;

            pointer.click(10, 10);

            expect(spy).to.have.been.calledOnce;
        });

        it('should trigger interaction callback when mask is a sprite', function ()
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const mask = new Graphics();
            const spy = sinon.spy();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            mask.drawRect(0, 0, 50, 50);
            graphics.mask = new Sprite(mask.generateCanvasTexture());

            pointer.click(10, 10);

            expect(spy).to.have.been.calledOnce;
        });
    });

    describe('hitArea', function ()
    {
        it('should trigger interaction callback when within hitArea', function ()
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const spy = sinon.spy();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            graphics.hitArea = new Rectangle(0, 0, 25, 25);

            pointer.click(10, 10);

            expect(spy).to.have.been.calledOnce;
        });

        it('should not trigger interaction callback when not within hitArea', function ()
        {
            const stage = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const spy = sinon.spy();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(graphics);
            graphics.hitArea = new Rectangle(0, 0, 25, 25);

            pointer.click(30, 30);

            expect(spy).to.have.not.been.calledOnce;
        });

        it('should trigger interaction callback on child when inside of parents hitArea', function ()
        {
            const stage = new Container();
            const parent = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const spy = sinon.spy();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(parent);
            parent.addChild(graphics);
            parent.hitArea = new Rectangle(0, 0, 25, 25);

            pointer.click(10, 10);

            expect(spy).to.have.been.calledOnce;
        });

        it('should not trigger interaction callback on child when outside of parents hitArea', function ()
        {
            const stage = new Container();
            const parent = new Container();
            const pointer = new MockPointer(stage);
            const graphics = new Graphics();
            const spy = sinon.spy();

            graphics.interactive = true;
            graphics.beginFill(0xFF0000);
            graphics.drawRect(0, 0, 50, 50);
            graphics.on('click', spy);
            stage.addChild(parent);
            parent.addChild(graphics);
            parent.hitArea = new Rectangle(0, 0, 25, 25);

            pointer.click(30, 30);

            expect(spy).to.have.not.been.calledOnce;
        });
    });

    describe('cursor changes', function ()
    {
        it('cursor should be the cursor of interactive item', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = 'help';

            pointer.mousemove(10, 10);

            expect(pointer.renderer.view.style.cursor).to.equal('help');
        });

        it('should return cursor to default on mouseout', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = 'help';

            pointer.mousemove(10, 10);
            pointer.mousemove(60, 60);

            expect(pointer.renderer.view.style.cursor).to.equal(pointer.interaction.cursorStyles.default);
        });

        it('should still be the over cursor after a click', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = 'help';

            pointer.mousemove(10, 10);
            pointer.click(10, 10);

            expect(pointer.renderer.view.style.cursor).to.equal('help');
        });

        it('should return cursor to default when mouse leaves renderer', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = 'help';

            pointer.mousemove(10, 10);
            pointer.mousemove(-10, 60);

            expect(pointer.renderer.view.style.cursor).to.equal(pointer.interaction.cursorStyles.default);
        });

        it('cursor callback should be called', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const overSpy = sinon.spy();
            const defaultSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = overSpy;
            pointer.interaction.cursorStyles.default = defaultSpy;

            pointer.mousemove(10, 10);
            pointer.mousemove(60, 60);

            expect(overSpy).to.have.been.called;
            expect(defaultSpy).to.have.been.called;
        });

        it('cursor callback should only be called if the cursor actually changed', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const defaultSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = null;
            pointer.interaction.cursorStyles.default = defaultSpy;

            pointer.mousemove(10, 10);
            pointer.mousemove(20, 20);

            expect(defaultSpy).to.have.been.calledOnce;
        });

        it('cursor style object should be fully applied', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'help';
            pointer.interaction.cursorStyles.help = {
                cursor: 'none',
                display: 'none',
            };

            pointer.mousemove(10, 10);

            expect(pointer.renderer.view.style.cursor).to.equal('none');
            expect(pointer.renderer.view.style.display).to.equal('none');
        });

        it('should not change cursor style if null cursor style provided', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'pointer';
            pointer.interaction.cursorStyles.pointer = null;
            pointer.interaction.cursorStyles.default = null;

            pointer.mousemove(10, 10);
            expect(pointer.renderer.view.style.cursor).to.equal('');

            pointer.mousemove(60, 60);
            expect(pointer.renderer.view.style.cursor).to.equal('');
        });

        it('should use cursor property as css if no style entry', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.cursor = 'text';

            pointer.mousemove(10, 10);
            expect(pointer.renderer.view.style.cursor).to.equal('text');
        });
    });

    describe('recursive hitTesting', function ()
    {
        function getScene()
        {
            const stage = new Container();
            const behindChild = new Graphics();
            const middleChild = new Graphics();
            const frontChild = new Graphics();

            behindChild.beginFill(0xFF);
            behindChild.drawRect(0, 0, 50, 50);

            middleChild.beginFill(0xFF00);
            middleChild.drawRect(0, 0, 50, 50);

            frontChild.beginFill(0xFF0000);
            frontChild.drawRect(0, 0, 50, 50);

            stage.addChild(behindChild, middleChild, frontChild);

            return {
                behindChild,
                middleChild,
                frontChild,
                stage,
            };
        }

        describe('when frontChild is interactive', function ()
        {
            it('should stop hitTesting after first hit', function ()
            {
                const scene = getScene();
                const pointer = this.pointer = new MockPointer(scene.stage);
                const frontHitTest = sinon.spy(scene.frontChild, 'containsPoint');
                const middleHitTest = sinon.spy(scene.middleChild, 'containsPoint');
                const behindHitTest = sinon.spy(scene.behindChild, 'containsPoint');

                scene.frontChild.interactive = true;
                scene.middleChild.interactive = true;
                scene.behindChild.interactive = true;

                pointer.mousedown(25, 25);

                expect(frontHitTest).to.have.been.calledOnce;
                expect(middleHitTest).to.not.have.been.called;
                expect(behindHitTest).to.not.have.been.called;
            });
        });

        describe('when frontChild is not interactive', function ()
        {
            it('should stop hitTesting after first hit', function ()
            {
                const scene = getScene();
                const pointer = this.pointer = new MockPointer(scene.stage);
                const frontHitTest = sinon.spy(scene.frontChild, 'containsPoint');
                const middleHitTest = sinon.spy(scene.middleChild, 'containsPoint');
                const behindHitTest = sinon.spy(scene.behindChild, 'containsPoint');

                scene.frontChild.interactive = false;
                scene.middleChild.interactive = true;
                scene.behindChild.interactive = true;

                pointer.mousedown(25, 25);

                expect(frontHitTest).to.not.have.been.called;
                expect(middleHitTest).to.have.been.calledOnce;
                expect(behindHitTest).to.not.have.been.called;
            });
        });
    });

    describe('pointer handling', function ()
    {
        it('pointer event from mouse should use single mouse data', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage, 100, 100, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.mousemove(20, 10, true);

            expect(pointer.interaction.mouse.global.x).to.equal(20);
            expect(pointer.interaction.mouse.global.y).to.equal(10);
        });
    });

    describe('data cleanup', function ()
    {
        it('touchleave after touchout should not orphan data', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.touchstart(10, 10, 42);
            expect(pointer.interaction.activeInteractionData[42]).to.exist;
            pointer.touchend(10, 10, 42);
            expect(pointer.interaction.activeInteractionData[42]).to.be.undefined;
            pointer.touchleave(10, 10, 42);
            expect(pointer.interaction.activeInteractionData[42]).to.be.undefined;
        });
    });

    describe('hitTest()', function ()
    {
        it('should return hit', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.render();
            const hit = pointer.interaction.hitTest(new Point(10, 10));

            expect(hit).to.equal(graphics);
        });

        it('should return null if not hit', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.render();
            const hit = pointer.interaction.hitTest(new Point(60, 60));

            expect(hit).to.be.null;
        });

        it('should return top thing that was hit', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const behind = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(behind);
            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            behind.beginFill(0xFFFFFF);
            behind.drawRect(0, 0, 50, 50);
            behind.interactive = true;

            pointer.render();
            const hit = pointer.interaction.hitTest(new Point(10, 10));

            expect(hit).to.equal(graphics);
        });

        it('should return hit when passing in root', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const behind = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(behind);
            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            behind.beginFill(0xFFFFFF);
            behind.drawRect(0, 0, 50, 50);
            behind.interactive = true;

            pointer.render();
            const hit = pointer.interaction.hitTest(new Point(10, 10), behind);

            expect(hit).to.equal(behind);
        });
    });

    describe('InteractionData properties', function ()
    {
        it('isPrimary should be set for first touch only', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.touchstart(10, 10, 1);
            expect(pointer.interaction.activeInteractionData[1]).to.exist;
            expect(pointer.interaction.activeInteractionData[1].isPrimary,
                'first touch should be primary on touch start').to.be.true;
            pointer.touchstart(13, 9, 2);
            expect(pointer.interaction.activeInteractionData[2].isPrimary,
                'second touch should not be primary').to.be.false;
            pointer.touchmove(10, 20, 1);
            expect(pointer.interaction.activeInteractionData[1].isPrimary,
                'first touch should still be primary after move').to.be.true;
            pointer.touchend(10, 10, 1);
            pointer.touchmove(13, 29, 2);
            expect(pointer.interaction.activeInteractionData[2].isPrimary,
                'second touch should still not be primary after first is done').to.be.false;
        });
    });

    describe('mouse events from pens', function ()
    {
        it('should call mousedown handler', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage, null, null, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mousedown', eventSpy);

            pointer.pendown(10, 10);

            expect(eventSpy).to.have.been.calledOnce;
        });

        it('should call mousemove handler', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage, null, null, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mousemove', eventSpy);

            pointer.penmove(10, 10);

            expect(eventSpy).to.have.been.calledOnce;
        });

        it('should call mouseup handler', function ()
        {
            const stage = new Container();
            const graphics = new Graphics();
            const eventSpy = sinon.spy();
            const pointer = this.pointer = new MockPointer(stage, null, null, true);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('mouseup', eventSpy);

            pointer.penup(10, 10);

            expect(eventSpy).to.have.been.calledOnce;
        });
    });
});
