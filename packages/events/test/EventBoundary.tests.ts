import { Container } from '@pixi/display';
import { EventBoundary, FederatedPointerEvent } from '@pixi/events';
import { Graphics } from '@pixi/graphics';

describe('EventBoundary', () =>
{
    it('should fire capture, bubble events on the correct target', () =>
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
        const eventSpy = jest.fn();
        const captureSpy = jest.fn();
        const stageSpy = jest.fn();

        target.interactive = true;
        container.interactive = true;

        event.target = target;
        event.global.set(175, 50);
        event.type = 'click';

        target.addEventListener('click', eventSpy, true);
        target.addEventListener('click', {
            handleEvent(e)
            {
                expect(this).toBeDefined();
                expect(e.eventPhase).toEqual(e.AT_TARGET);

                eventSpy();
            }
        });
        container.addEventListener('click', captureSpy, true);
        stage.addEventListener('click', stageSpy);
        boundary.dispatchEvent(event);

        expect(eventSpy).toBeCalledTimes(2);
        expect(captureSpy).toHaveBeenCalledOnce();
        expect(captureSpy).toHaveBeenCalledBefore(eventSpy);
        expect(stageSpy).not.toHaveBeenCalled();
    });

    it('should set hit-test target to most specific ancestor if hit object is not interactive', () =>
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const target = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));

        container.interactive = true;
        target.interactive = false;

        const hitTestTarget = boundary.hitTest(50, 50);

        expect(hitTestTarget).toEqual(container);
    });

    it('should not fire an interaction event to its children if the display object is none', () =>
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const target = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));

        container.eventMode = 'none';
        target.interactive = true;

        expect(boundary.hitTest(50, 50)).toEqual(null);
    });

    it(`should not fire an interaction event if the display object is passive and interactiveChildren is false`, () =>
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const target = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));

        container.eventMode = 'passive';
        container.interactiveChildren = false;
        target.interactive = true;

        expect(boundary.hitTest(50, 50)).toEqual(null);
    });

    it(`should not block an interaction event if the display object is a mask`, () =>
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const target = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));
        const maskTarget = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));
        const maskTargetChild = maskTarget.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));

        container.interactive = true;
        container.mask = maskTarget;
        maskTarget.interactive = true;
        maskTargetChild.interactive = true;
        target.interactive = true;

        expect(boundary.hitTest(50, 50)).toEqual(target);

        container.eventMode = 'passive';

        expect(boundary.hitTest(50, 50)).toEqual(target);
    });

    it('should hit-test a target that is interactive auto, static, dynamic', () =>
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const targetAuto = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));
        const targetStatic = container.addChild(new Graphics().beginFill(0).drawRect(100, 0, 100, 100));
        const targetDynamic = container.addChild(new Graphics().beginFill(0).drawRect(200, 0, 100, 100));

        targetAuto.eventMode = 'auto';
        targetStatic.eventMode = 'static';
        targetDynamic.eventMode = 'dynamic';

        expect(boundary.hitTest(50, 50)).toEqual(null);
        expect(boundary.hitTest(150, 50)).toEqual(targetStatic);
        expect(boundary.hitTest(250, 50)).toEqual(targetDynamic);

        container.interactive = true;

        expect(boundary.hitTest(50, 50)).toEqual(container);
        expect(boundary.hitTest(150, 50)).toEqual(targetStatic);
        expect(boundary.hitTest(250, 50)).toEqual(targetDynamic);
    });

    it('should not block an interactive if display object is none', () =>
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const target = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));
        const blocker = container.addChild(new Graphics().beginFill(0).drawRect(50, 0, 100, 100));

        container.interactive = true;
        target.interactive = true;
        blocker.eventMode = 'none';

        expect(boundary.hitTest(25, 50)).toEqual(target);
        expect(boundary.hitTest(75, 50)).toEqual(target);
    });

    it('should not register an interaction event if parent is set to none', () =>
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const target = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));
        const blocker = container.addChild(new Graphics().beginFill(0).drawRect(50, 0, 100, 100));

        container.eventMode = 'none';
        target.interactive = true;
        blocker.interactive = true;

        expect(boundary.hitTest(25, 50)).toEqual(null);
        expect(boundary.hitTest(75, 50)).toEqual(null);
    });

    it('should hit-test correctly when using multiple interactive types', () =>
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const target = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));
        const autoBlocker = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 25, 100));
        const activeBlocker = container.addChild(new Graphics().beginFill(0).drawRect(75, 0, 25, 100));
        const noneBlocker = container.addChild(new Graphics().beginFill(0).drawRect(25, 0, 50, 100));

        container.eventMode = 'passive';
        // this should be hit because it is interactive and parent is passive
        target.interactive = true;
        // this should block the target because it is interactive and parent is passive
        activeBlocker.interactive = true;
        // this should be ignored because it is not interactive and parent is passive
        autoBlocker.eventMode = 'auto';
        // this should be ignored because it is using none
        noneBlocker.eventMode = 'none';

        expect(boundary.hitTest(12, 50)).toEqual(target);
        expect(boundary.hitTest(50, 50)).toEqual(target);
        expect(boundary.hitTest(87, 50)).toEqual(activeBlocker);
    });

    it('should fire pointerupoutside only on relevant & still mounted targets', () =>
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const pressed = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));

        stage.addChild(new Graphics().beginFill(0).drawRect(100, 0, 100, 100));

        const eventSpy = jest.fn();
        const containerSpy = jest.fn();
        const stageSpy = jest.fn();
        const stageOutsideSpy = jest.fn();

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
        expect(boundary['trackingData'](1).pressTargetsByButton[1][2]).toEqual(pressed);

        pressed.destroy();
        boundary.mapEvent(off);

        // "pressed" unmounted so it shouldn't get a pointerupoutside
        expect(eventSpy).not.toBeCalled();

        // "container" still mounted so it should get pointerupoutside
        expect(containerSpy).toHaveBeenCalledOnce();

        // "stage" still ancestor of the hit "outside" on pointerup, so it get pointerup instead
        expect(stageOutsideSpy).not.toBeCalled();
        // not a "pointerupoutside"
        expect(stageSpy).toHaveBeenCalledOnce();
    });

    it('should fire pointerout on the most specific mounted ancestor of pointerover target', () =>
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const over = container.addChild(new Graphics().beginFill(0).drawRect(0, 0, 100, 100));
        const to = stage.addChild(new Graphics().beginFill(0).drawRect(100, 0, 100, 100));

        const orgOverSpy = jest.fn();
        const orgContainerOverSpy = jest.fn();
        const outSpy = jest.fn();
        const containerOutSpy = jest.fn();
        const toOverSpy = jest.fn();

        over.addEventListener('pointerover', orgOverSpy);
        container.addEventListener('pointerover', (e) =>
        {
            expect(e.target).toEqual(over);
            orgContainerOverSpy();
        });
        over.addEventListener('pointerout', outSpy);
        container.addEventListener('pointerout', (e) =>
        {
            expect(e.target).toEqual(container);
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

        expect(orgOverSpy).toHaveBeenCalledOnce();
        expect(orgContainerOverSpy).toHaveBeenCalledOnce();

        over.destroy();
        boundary.mapEvent(off);

        expect(outSpy).not.toBeCalled();
        expect(containerOutSpy).toHaveBeenCalledOnce();
        expect(toOverSpy).toHaveBeenCalledOnce();
    });

    it('should only call listener once when using .once() to register listener', () =>
    {
        const stage = new Container();
        const boundary = new EventBoundary(stage);
        const container = stage.addChild(new Container());
        const target1 = container.addChild(
            new Graphics().drawRect(0, 0, 100, 100)
        );
        const target2 = container.addChild(
            new Graphics().drawRect(100, 0, 100, 100)
        );

        target1.interactive = true;
        target2.interactive = true;

        // With a single listener
        const eventSpy1 = jest.fn();

        target1.once('click', eventSpy1);

        const event1 = new FederatedPointerEvent(boundary);

        event1.target = target1;
        event1.global.set(50, 50);
        event1.type = 'click';

        boundary.dispatchEvent(event1);
        boundary.dispatchEvent(event1);

        expect(eventSpy1).toHaveBeenCalledOnce();

        // With multiple listeners
        const eventSpy2 = jest.fn();
        const eventSpy3 = jest.fn();
        const eventSpy4 = jest.fn();

        target2.once('click', eventSpy2);
        target2.on('click', eventSpy3);
        target2.addEventListener('click', eventSpy4);

        const event2 = new FederatedPointerEvent(boundary);

        event2.target = target2;
        event2.global.set(150, 50);
        event2.type = 'click';

        boundary.dispatchEvent(event2);
        boundary.dispatchEvent(event2);

        expect(eventSpy2).toHaveBeenCalledOnce();
        expect(eventSpy3).toHaveBeenCalledTimes(2);
        expect(eventSpy4).toHaveBeenCalledTimes(2);
    });
});
