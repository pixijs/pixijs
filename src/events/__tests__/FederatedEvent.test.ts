import { FederatedEvent } from '../FederatedEvent';
import { FederatedMouseEvent } from '../FederatedMouseEvent';
import { FederatedPointerEvent } from '../FederatedPointerEvent';
import { FederatedWheelEvent } from '../FederatedWheelEvent';

import type { EventBoundary } from '../EventBoundary';

describe('FederatedEvent', () =>
{
    const mockManager = {} as EventBoundary;

    describe('constructor', () =>
    {
        it('should create with default values', () =>
        {
            const event = new FederatedEvent(mockManager);

            expect(event.manager).toBe(mockManager);
            expect(event.bubbles).toBe(true);
            expect(event.cancelable).toBe(false);
            expect(event.composed).toBe(false);
            expect(event.defaultPrevented).toBe(false);
            expect(event.propagationStopped).toBe(false);
            expect(event.propagationImmediatelyStopped).toBe(false);
        });

        it('should have correct phase constants', () =>
        {
            const event = new FederatedEvent(mockManager);

            expect(event.NONE).toEqual(0);
            expect(event.CAPTURING_PHASE).toEqual(1);
            expect(event.AT_TARGET).toEqual(2);
            expect(event.BUBBLING_PHASE).toEqual(3);
        });
    });

    describe('layer and page coordinates', () =>
    {
        it('should expose layer coordinates via layerX/layerY', () =>
        {
            const event = new FederatedEvent(mockManager);

            event.layer.x = 100;
            event.layer.y = 200;

            expect(event.layerX).toEqual(100);
            expect(event.layerY).toEqual(200);
        });

        it('should expose page coordinates via pageX/pageY', () =>
        {
            const event = new FederatedEvent(mockManager);

            event.page.x = 150;
            event.page.y = 250;

            expect(event.pageX).toEqual(150);
            expect(event.pageY).toEqual(250);
        });
    });

    describe('data getter', () =>
    {
        it('should return itself', () =>
        {
            const event = new FederatedEvent(mockManager);

            expect(event.data).toBe(event);
        });
    });

    describe('preventDefault', () =>
    {
        it('should set defaultPrevented to true', () =>
        {
            const event = new FederatedEvent(mockManager);

            // Set a nativeEvent that isn't an instance of Event to skip the native preventDefault
            event.nativeEvent = {} as any;
            event.preventDefault();

            expect(event.defaultPrevented).toBe(true);
        });
    });

    describe('stopPropagation', () =>
    {
        it('should set propagationStopped flag', () =>
        {
            const event = new FederatedEvent(mockManager);

            event.stopPropagation();

            expect(event.propagationStopped).toBe(true);
        });
    });

    describe('stopImmediatePropagation', () =>
    {
        it('should set propagationImmediatelyStopped flag', () =>
        {
            const event = new FederatedEvent(mockManager);

            event.stopImmediatePropagation();

            expect(event.propagationImmediatelyStopped).toBe(true);
        });
    });

    describe('initEvent', () =>
    {
        it('should throw an error', () =>
        {
            const event = new FederatedEvent(mockManager);

            expect(() => event.initEvent('click')).toThrow();
        });
    });

    describe('initUIEvent', () =>
    {
        it('should throw an error', () =>
        {
            const event = new FederatedEvent(mockManager);

            expect(() => event.initUIEvent('click')).toThrow();
        });
    });
});

describe('FederatedMouseEvent', () =>
{
    const mockManager = {} as EventBoundary;

    it('should have coordinate points', () =>
    {
        const event = new FederatedMouseEvent(mockManager);

        event.client.set(10, 20);
        event.global.set(30, 40);
        event.screen.set(50, 60);
        event.movement.set(5, 10);
        event.offset.set(15, 25);

        expect(event.clientX).toEqual(10);
        expect(event.clientY).toEqual(20);
        expect(event.x).toEqual(10);
        expect(event.y).toEqual(20);
        expect(event.globalX).toEqual(30);
        expect(event.globalY).toEqual(40);
        expect(event.screenX).toEqual(50);
        expect(event.screenY).toEqual(60);
        expect(event.movementX).toEqual(5);
        expect(event.movementY).toEqual(10);
        expect(event.offsetX).toEqual(15);
        expect(event.offsetY).toEqual(25);
    });

    it('should throw for initMouseEvent', () =>
    {
        const event = new FederatedMouseEvent(mockManager);

        expect(() => event.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, 0, 0,
            false, false, false, false, 0, null
        )).toThrow();
    });
});

describe('FederatedPointerEvent', () =>
{
    const mockManager = {} as EventBoundary;

    it('should have pointer-specific properties', () =>
    {
        const event = new FederatedPointerEvent(mockManager);

        event.pointerId = 1;
        event.width = 10;
        event.height = 20;
        event.pressure = 0.5;
        event.tangentialPressure = 0.1;
        event.tiltX = 30;
        event.tiltY = 45;
        event.twist = 90;
        event.pointerType = 'pen';
        event.isPrimary = true;

        expect(event.pointerId).toEqual(1);
        expect(event.width).toEqual(10);
        expect(event.height).toEqual(20);
        expect(event.pressure).toEqual(0.5);
        expect(event.tangentialPressure).toEqual(0.1);
        expect(event.tiltX).toEqual(30);
        expect(event.tiltY).toEqual(45);
        expect(event.twist).toEqual(90);
        expect(event.pointerType).toEqual('pen');
        expect(event.isPrimary).toBe(true);
    });

    it('should return coalesced events for move events', () =>
    {
        const event = new FederatedPointerEvent(mockManager);

        event.type = 'pointermove';
        expect(event.getCoalescedEvents()).toEqual([event]);

        event.type = 'mousemove';
        expect(event.getCoalescedEvents()).toEqual([event]);

        event.type = 'touchmove';
        expect(event.getCoalescedEvents()).toEqual([event]);
    });

    it('should return empty array for non-move events', () =>
    {
        const event = new FederatedPointerEvent(mockManager);

        event.type = 'pointerdown';
        expect(event.getCoalescedEvents()).toEqual([]);

        event.type = 'click';
        expect(event.getCoalescedEvents()).toEqual([]);
    });

    it('should throw for getPredictedEvents', () =>
    {
        const event = new FederatedPointerEvent(mockManager);

        expect(() => event.getPredictedEvents()).toThrow();
    });

    it('should default width and height to 0', () =>
    {
        const event = new FederatedPointerEvent(mockManager);

        expect(event.width).toEqual(0);
        expect(event.height).toEqual(0);
    });

    it('should default isPrimary to false', () =>
    {
        const event = new FederatedPointerEvent(mockManager);

        expect(event.isPrimary).toBe(false);
    });
});

describe('FederatedWheelEvent', () =>
{
    const mockManager = {} as EventBoundary;

    it('should have delta properties', () =>
    {
        const event = new FederatedWheelEvent(mockManager);

        event.deltaX = 10;
        event.deltaY = -20;
        event.deltaZ = 0;
        event.deltaMode = 0;

        expect(event.deltaX).toEqual(10);
        expect(event.deltaY).toEqual(-20);
        expect(event.deltaZ).toEqual(0);
        expect(event.deltaMode).toEqual(0);
    });

    it('should have correct delta mode constants', () =>
    {
        expect(FederatedWheelEvent.DOM_DELTA_PIXEL).toEqual(0);
        expect(FederatedWheelEvent.DOM_DELTA_LINE).toEqual(1);
        expect(FederatedWheelEvent.DOM_DELTA_PAGE).toEqual(2);

        const event = new FederatedWheelEvent(mockManager);

        expect(event.DOM_DELTA_PIXEL).toEqual(0);
        expect(event.DOM_DELTA_LINE).toEqual(1);
        expect(event.DOM_DELTA_PAGE).toEqual(2);
    });

    it('should extend FederatedMouseEvent', () =>
    {
        const event = new FederatedWheelEvent(mockManager);

        expect(event).toBeInstanceOf(FederatedMouseEvent);
        expect(event).toBeInstanceOf(FederatedEvent);
    });

    it('should support mouse event properties', () =>
    {
        const event = new FederatedWheelEvent(mockManager);

        event.button = 0;
        event.buttons = 1;
        event.altKey = true;
        event.ctrlKey = false;

        expect(event.button).toEqual(0);
        expect(event.buttons).toEqual(1);
        expect(event.altKey).toBe(true);
        expect(event.ctrlKey).toBe(false);
    });
});
