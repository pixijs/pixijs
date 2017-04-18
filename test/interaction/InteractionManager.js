'use strict';

const MockPointer = require('./MockPointer');

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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
    });

    describe('add/remove events', function ()
    {
        let stub;

        before(function ()
        {
            stub = sinon.stub(PIXI.interaction.InteractionManager.prototype, 'setTargetElement');
        });

        after(function ()
        {
            stub.restore();
        });

        it('should add and remove pointer events to document', function ()
        {
            const manager = new PIXI.interaction.InteractionManager(sinon.stub());
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
            const manager = new PIXI.interaction.InteractionManager(sinon.stub());
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

        it('should add and remove pointer events to element', function ()
        {
            const manager = new PIXI.interaction.InteractionManager(sinon.stub());
            const element = { style: {}, addEventListener: sinon.stub(), removeEventListener: sinon.stub() };

            manager.interactionDOMElement = element;
            manager.supportsPointerEvents = true;

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
            const manager = new PIXI.interaction.InteractionManager(sinon.stub());
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
            const manager = new PIXI.interaction.InteractionManager(sinon.stub());
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
            const manager = new PIXI.interaction.InteractionManager(sinon.stub());
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

        it('should add and remove touch events to element', function ()
        {
            const manager = new PIXI.interaction.InteractionManager(sinon.stub());
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
    });

    describe('onClick', function ()
    {
        it('should call handler when inside', function ()
        {
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
    });

    describe('overlapping children', function ()
    {
        function getScene(callbackEventName, splitParents)
        {
            const behindChild = new PIXI.Graphics();
            const frontChild = new PIXI.Graphics();
            const parent = new PIXI.Container();
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
                behindParent = new PIXI.Container();
                behindParent.name = 'behindParent';
                frontParent = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
                    const stage = new PIXI.Container();
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
            const stage = new PIXI.Container();
            const frontParent = new PIXI.Container();
            const frontChild = new PIXI.Graphics();
            const behindParent = new PIXI.Container();
            const subParent = new PIXI.Container();
            const behindChild = new PIXI.Graphics();
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

    describe('cursor changes', function ()
    {
        it('cursor should be the cursor of interactive item', function ()
        {
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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

        it('should not change cursor style if no cursor style provided', function ()
        {
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
    });

    describe('recursive hitTesting', function ()
    {
        function getScene()
        {
            const stage = new PIXI.Container();
            const behindChild = new PIXI.Graphics();
            const middleChild = new PIXI.Graphics();
            const frontChild = new PIXI.Graphics();

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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
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
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.render();
            const hit = pointer.interaction.hitTest(new PIXI.Point(10, 10));

            expect(hit).to.equal(graphics);
        });

        it('should return null if not hit', function ()
        {
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
            const pointer = this.pointer = new MockPointer(stage);

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;

            pointer.render();
            const hit = pointer.interaction.hitTest(new PIXI.Point(60, 60));

            expect(hit).to.be.null;
        });

        it('should return top thing that was hit', function ()
        {
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
            const behind = new PIXI.Graphics();
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
            const hit = pointer.interaction.hitTest(new PIXI.Point(10, 10));

            expect(hit).to.equal(graphics);
        });

        it('should return hit when passing in root', function ()
        {
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
            const behind = new PIXI.Graphics();
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
            const hit = pointer.interaction.hitTest(new PIXI.Point(10, 10), behind);

            expect(hit).to.equal(behind);
        });
    });
});
