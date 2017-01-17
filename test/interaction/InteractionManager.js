'use strict';

const MockPointer = require('./MockPointer');

describe('PIXI.interaction.InteractionManager', function ()
{
    describe('onClick', function ()
    {
        it('should call handler when inside', function ()
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

            pointer.click(10, 10);

            expect(clickSpy).to.have.been.calledOnce;
        });

        it('should not call handler when outside', function ()
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

            pointer.click(60, 60);

            expect(clickSpy).to.not.have.been.called;
        });
    });

    describe('onTap', function ()
    {
        it('should call handler when inside', function ()
        {
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
            const clickSpy = sinon.spy();
            const pointer = new MockPointer(stage);

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
            const pointer = new MockPointer(stage);

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
        function getScene(callbackEventName)
        {
            const behindChild = new PIXI.Graphics();
            const frontChild = new PIXI.Graphics();
            const parent = new PIXI.Container();
            const behindChildCallback = sinon.spy();
            const frontChildCallback = sinon.spy();
            const parentCallback = sinon.spy();

            behindChild.beginFill(0xFF);
            behindChild.drawRect(0, 0, 50, 50);
            behindChild.on(callbackEventName, behindChildCallback);

            frontChild.beginFill(0x00FF);
            frontChild.drawRect(0, 0, 50, 50);
            frontChild.on(callbackEventName, frontChildCallback);

            parent.addChild(behindChild, frontChild);
            parent.on(callbackEventName, parentCallback);

            return {
                behindChild,
                frontChild,
                parent,
                behindChildCallback,
                frontChildCallback,
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
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
            });

            describe('when front child is non-interactive', function ()
            {
                it('should not callback when clicking front child', function ()
                {
                    const stage = new PIXI.Container();
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
            });

            describe('when front child is non-interactive', function ()
            {
                it('should callback parent when clicking front child', function ()
                {
                    const stage = new PIXI.Container();
                    const pointer = new MockPointer(stage);
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

                /* TODO: Fix #3596
                it('should callback parent and behind child when clicking overlap', function ()
                {
                    const stage = new PIXI.Container();
                    const pointer = new MockPointer(stage);
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
                */

                it('should callback parent and behind child when clicking behind child', function ()
                {
                    const stage = new PIXI.Container();
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
                    const pointer = new MockPointer(stage);
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
    });
});
