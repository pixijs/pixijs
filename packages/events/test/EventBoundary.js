const { Container } = require('@pixi/display');
const { FederatedPointerEvent, EventBoundary } = require('../');
const { Graphics } = require('../../graphics');
const { expect } = require('chai');

describe('PIXI.EventBoundary', function ()
{
    it('should fire capture, bubble events on the correct target', function ()
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());

        container.addChild(new Graphics().drawRect(0, 0, 100, 100));
        container.addChild(new Graphics().drawRect(80, 0, 100, 100));

        const target = container.addChild(
            new Graphics().drawRect(150, 0, 100, 100)
        );
        const event = new FederatedPointerEvent(boundary);
        const eventSpy = sinon.spy();
        const captureSpy = sinon.spy();
        const stageSpy = sinon.spy();

        target.interactive = true;
        container.interactive = true;

        event.target = target;
        event.global.set(175, 50);
        event.type = 'click';

        target.addEventListener('click', eventSpy, true);
        target.addEventListener('click', {
            handleEvent(e)
            {
                expect(this).to.not.be.undefined;
                expect(e.eventPhase).to.equal(e.AT_TARGET);

                eventSpy();
            }
        });
        container.addEventListener('click', captureSpy, true);
        stage.addEventListener('click', stageSpy);
        boundary.dispatchEvent(event);

        expect(eventSpy).to.have.been.calledTwice;
        expect(captureSpy).to.have.been.calledOnce;
        expect(captureSpy).to.have.been.calledBefore(eventSpy);
        expect(stageSpy).to.have.been.calledOnce;
    });
});
