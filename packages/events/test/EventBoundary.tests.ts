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
        expect(stageSpy).toHaveBeenCalledOnce();
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
});
