import { Container } from '@pixi/display';
import { FederatedPointerEvent, EventBoundary } from '@pixi/events';
import { Graphics } from '@pixi/graphics';
import sinon from 'sinon';
import { expect } from 'chai';

describe('EventBoundary', function ()
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

    it('should set hit-test target to most specific ancestor if hit object is not interactive', function ()
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const target = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));

        container.interactive = true;
        target.interactive = false;

        const hitTestTarget = boundary.hitTest(50, 50);

        expect(hitTestTarget).to.equal(container);
    });

    it('should fire pointerupoutside only on relevant & still mounted targets', function ()
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const pressed = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));
        const outside = stage.addChild(new Graphics().beginFill(0).drawRect(100, 0, 100, 100));

        const eventSpy = sinon.spy();
        const containerSpy = sinon.spy();
        const stageSpy = sinon.spy();
        const stageOutsideSpy = sinon.spy();

        stage.interactive = true;
        container.interactive = true;
        pressed.interactive = true;

        pressed.addEventListener('pointerupoutside', eventSpy);
        container.addEventListener('pointerupoutside', containerSpy);
        stage.addEventListener('pointerup', stageSpy);
        stage.addEventListener('pointerupoutside', stageOutsideSpy);

        const on = new FederatedPointerEvent(boundary);
        const off = new FederatedPointerEvent(boundary);

        on.pointerId = 1;
        on.button = 1;
        on.type = 'pointerdown';
        on.global.set(50, 50);

        off.pointerId = 1;
        off.button = 1;
        off.type = 'pointerup';
        off.global.set(150, 50);

        boundary.mapEvent(on);
        expect(boundary.trackingData(1).pressTargetsByButton[1][2]).to.equal(pressed);

        pressed.destroy();
        boundary.mapEvent(off);

        // "pressed" unmounted so it shouldn't get a pointerupoutside
        expect(eventSpy).to.not.have.been.called;

        // "container" still mounted so it should get pointerupoutside
        expect(containerSpy).to.have.been.calledOnce;

        // "stage" still ancestor of the hit "outside" on pointerup, so it get pointerup instead
        expect(stageOutsideSpy).to.not.have.been.called;
        // not a "pointerupoutside"
        expect(stageSpy).to.have.been.calledOnce;
    });

    it('should fire pointerout on the most specific mounted ancestor of pointerover target', function ()
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const over = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));
        const to = stage.addChild(new Graphics().beginFill(0).drawRect(100, 0, 100, 100));

        const orgOverSpy = sinon.spy();
        const orgContainerOverSpy = sinon.spy();
        const outSpy = sinon.spy();
        const containerOutSpy = sinon.spy();
        const toOverSpy = sinon.spy();

        over.addEventListener('pointerover', orgOverSpy);
        container.addEventListener('pointerover', function (e)
        {
            expect(e.target).to.equal(over);
            orgContainerOverSpy();
        });
        over.addEventListener('pointerout', outSpy);
        container.addEventListener('pointerout', function (e)
        {
            expect(e.target).to.equal(container);
            containerOutSpy();
        });
        to.addEventListener('pointerover', toOverSpy);

        container.interactive = true;
        over.interactive = true;
        to.interactive = true;

        const on = new FederatedPointerEvent(boundary);
        const off = new FederatedPointerEvent(boundary);

        on.pointerId = 1;
        on.type = 'pointerover';
        on.global.set(50, 50);

        off.pointerId = 1;
        off.type = 'pointermove';
        off.global.set(150, 50);

        boundary.mapEvent(on);

        expect(orgOverSpy).to.have.been.calledOnce;
        expect(orgContainerOverSpy).to.have.been.calledOnce;

        over.destroy();
        boundary.mapEvent(off);

        expect(outSpy).to.not.have.been.called;
        expect(containerOutSpy).to.have.been.calledOnce;
        expect(toOverSpy).to.have.been.calledOnce;
    });
});
