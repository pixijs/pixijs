import { FederatedPointerEvent } from './FederatedPointerEvent';
import { Point } from '@pixi/math';

import type { Cursor, FederatedEventTarget } from './FederatedEventTarget';
import type { DisplayObject } from '@pixi/display';
import type { FederatedEvent } from './FederatedEvent';

// The maximum iterations used in propagation. This prevent infinite loops.
const PROPAGATION_LIMIT = 2048;

const tempHitLocation = new Point();
const tempLocalMapping = new Point();

type TrackingData = {
    pressTargetsByButton: {
        [id: number]: FederatedEventTarget;
    };
    clicksByButton: {
        [id: number]: {
            clickCount: number;
            target: FederatedEventTarget;
            timeStamp: number;
        }
    };
    overTarget: FederatedEventTarget;
};

/**
 * EventBoundary
 */
export class EventBoundary
{
    /**
     * The root event-target residing below the event boundary. All events are dispatched
     * trickling down and bubbling up to this.
     */
    public rootTarget: DisplayObject;

    /**
     * The cursor preferred by the event targets underneath this boundary.
     */
    public cursor: Cursor;

    /**
     * Maps event types to forwarding handles for them.
     *
     * {@link PIXI.EventBoundary EventBoundary} provides mapping for "pointerdown", "pointermove",
     * "pointerout", "pointerleave", "pointerover", "pointerup", and "pointerupoutside" by default.
     */
    protected mappingTable: Record<string, Array<{
        fn: (e: FederatedEvent) => void,
        priority: number
    }>>;

    protected mappingState: Record<string, any> = {
        trackingData: {}
    };

    /**
     * @param rootTarget - The holder of the event boundary.
     */
    constructor(rootTarget?: DisplayObject)
    {
        this.rootTarget = rootTarget;

        this.hitPruneFn = this.hitPruneFn.bind(this);
        this.hitTestFn = this.hitTestFn.bind(this);
        this.mapPointerDown = this.mapPointerDown.bind(this);
        this.mapPointerMove = this.mapPointerMove.bind(this);
        this.mapPointerOut = this.mapPointerOut.bind(this);
        this.mapPointerOver = this.mapPointerOver.bind(this);
        this.mapPointerUp = this.mapPointerUp.bind(this);
        this.mapPointerUpOutside = this.mapPointerUpOutside.bind(this);

        this.mappingTable = {};
        this.addEventMapping('pointerdown', this.mapPointerDown);
        this.addEventMapping('pointermove', this.mapPointerMove);
        this.addEventMapping('pointerout', this.mapPointerOut);
        this.addEventMapping('pointerleave', this.mapPointerOut);
        this.addEventMapping('pointerover', this.mapPointerOver);
        this.addEventMapping('pointerup', this.mapPointerUp);
        this.addEventMapping('pointerupoutside', this.mapPointerUpOutside);
    }

    public addEventMapping(type: string, fn: (e: FederatedEvent) => void): void
    {
        if (!this.mappingTable[type])
        {
            this.mappingTable[type] = [];
        }

        this.mappingTable[type].push({
            fn,
            priority: 0,
        });
        this.mappingTable[type].sort((a, b) => a.priority - b.priority);
    }

    /** Dispatches the given event */
    public dispatchEvent(e: FederatedEvent, type?: string): void
    {
        e.propagationStopped = false;
        e.propagationImmediatelyStopped = false;

        this.propagate(e, type);
    }

    /** Maps the given upstream event through the event boundary and propagates it downstream. */
    public mapEvent(e: FederatedEvent): void
    {
        if (!this.rootTarget)
        {
            return;
        }

        const mappers = this.mappingTable[e.type];

        if (mappers)
        {
            for (let i = 0, j = mappers.length; i < j; i++)
            {
                mappers[i].fn(e);
            }
        }
        else
        {
            console.warn(`[EventBoundary]: Event mapping not defined for ${e.type}`);
        }
    }

    /**
     * Finds the DisplayObject that is the target of a event at the given coordinates.
     *
     * The passed (x,y) coordinates are in the world space above this event boundary.
     */
    public hitTest(
        x: number,
        y: number,
    ): DisplayObject
    {
        const invertedPath = this.hitTestRecursive(
            this.rootTarget,
            this.rootTarget.interactive,
            tempHitLocation.set(x, y),
            this.hitTestFn,
            this.hitPruneFn,
        );

        return invertedPath && invertedPath[0];
    }

    /**
     * Propagate the passed event from from {@link EventBoundary.rootTarget this.rootTarget} to its
     * target {@code e.target}.
     *
     * @param e - The event to propagate.
     */
    public propagate(e: FederatedEvent, type?: string): void
    {
        if (!e.target)
        {
            // This usually occurs when the scene graph is not interactive.
            return;
        }

        const composedPath = e.composedPath();

        // Capturing phase
        e.eventPhase = e.CAPTURING_PHASE;

        for (let i = 0, j = composedPath.length - 1; i < j; i++)
        {
            e.currentTarget = composedPath[i];

            this.notifyTarget(e, type);

            if (e.propagationStopped || e.propagationImmediatelyStopped) return;
        }

        // At target phase
        e.eventPhase = e.AT_TARGET;
        e.currentTarget = e.target;

        this.notifyTarget(e, type);

        if (e.propagationStopped || e.propagationImmediatelyStopped) return;

        // Bubbling phase
        e.eventPhase = e.BUBBLING_PHASE;

        for (let i = composedPath.length - 2; i >= 0; i--)
        {
            e.currentTarget = composedPath[i];

            this.notifyTarget(e, type);

            if (e.propagationStopped || e.propagationImmediatelyStopped) return;
        }
    }

    /**
     * Finds the propagation path from {@link PIXI.EventBoundary.rootTarget rootTarget} to the passed
     * {@code target}. The last element in the path is {@code target}.
     *
     * @param target
     */
    public propagationPath(target: FederatedEventTarget): FederatedEventTarget[]
    {
        const propagationPath = [target];

        for (let i = 0; i < PROPAGATION_LIMIT && target !== this.rootTarget; i++)
        {
            if (!target.parent)
            {
                throw new Error('Cannot find propagation path to disconnected target');
            }

            propagationPath.push(target.parent);

            target = target.parent;
        }

        propagationPath.reverse();

        return propagationPath;
    }

    /**
     * Recursive implementation for {@link EventBoundary.hitTest hitTest}.
     *
     * @param currentTarget - The DisplayObject that is to be hit tested.
     * @param interactive - Flags whether `currentTarget` or one of its parents are interactive.
     * @param location - The location that is being tested for overlap.
     * @param testFn - Callback that determines whether the target passes hit testing. This callback
     *  can assume that `pruneFn` failed to prune the display object.
     * @param pruneFn - Callback that determiness whether the target and all of its children
     *  cannot pass the hit test. It is used as a preliminary optimization to prune entire subtrees
     *  of the scene graph.
     * @return An array holding the hit testing target and all its ancestors in order. The first element
     *  is the target itself and the last is {@link EventBoundary.rootTarget rootTarget}. This is the opposite
     *  order w.r.t. the propagation path. If no hit testing target is found, null is returned.
     */
    protected hitTestRecursive(
        currentTarget: DisplayObject,
        interactive: boolean,
        location: Point,
        testFn: (object: DisplayObject, pt: Point) => boolean,
        pruneFn?: (object: DisplayObject, pt: Point) => boolean,
    ): DisplayObject[]
    {
        if (!currentTarget || !currentTarget.visible)
        {
            return null;
        }

        // Attempt to prune this DisplayObject and its subtree as an optimization.
        if (pruneFn(currentTarget, location))
        {
            return null;
        }

        // Find a child that passes the hit testing and return one, if any.
        if (currentTarget.interactiveChildren && currentTarget.children)
        {
            const children = currentTarget.children;

            for (let i = children.length - 1; i >= 0; i--)
            {
                const child = children[i] as DisplayObject;

                const nestedHit = this.hitTestRecursive(
                    child,
                    interactive || child.interactive,
                    location,
                    testFn,
                    pruneFn,
                );

                if (nestedHit)
                {
                    // Its a good idea to check if a child has lost its parent.
                    // this means it has been removed whilst looping so its best
                    if (!nestedHit[nestedHit.length - 1].parent)
                    {
                        continue;
                    }

                    nestedHit.push(currentTarget);

                    return nestedHit;
                }
            }
        }

        // Finally, hit test this DisplayObject itself.
        if (interactive && testFn(currentTarget, location))
        {
            return [currentTarget];
        }

        return null;
    }

    /**
     * Checks whether the display object or any of its children cannot pass the hit test
     * at all.
     *
     * {@link EventBoundary}'s implementation uses the {@link PIXI.DisplayObject.hitArea hitArea}
     * and {@link PIXI.DisplayObject._mask} for pruning.
     *
     * @param displayObject
     * @param location
     */
    protected hitPruneFn(displayObject: DisplayObject, location: Point): boolean
    {
        if (displayObject.hitArea)
        {
            displayObject.worldTransform.applyInverse(location, tempLocalMapping);

            if (!displayObject.hitArea.contains(tempLocalMapping.x, tempLocalMapping.y))
            {
                return true;
            }
        }

        if (displayObject._mask)
        {
            const mask = displayObject._mask as any;

            if (!(mask.containsPoint && mask.containsPoint(location)))
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks whether the display object passes hit testing for the given location.
     *
     * @param displayObject
     * @param location
     * @returns Whether `displayObject` passes hit testing for `location`.
     */
    protected hitTestFn(displayObject: DisplayObject, location: Point): boolean
    {
        // If the display object failed pruning with a hitArea, then it must pass it.
        if (displayObject.hitArea)
        {
            return true;
        }

        if ((displayObject as any).containsPoint)
        {
            return (displayObject as any).containsPoint(location) as boolean;
        }

        // TODO: Should we hit test based on bounds?

        return false;
    }

    /**
     * Notify all the listeners to the event's {@code currentTarget}
     *
     * @param e
     */
    protected notifyTarget(e: FederatedEvent, type?: string): void
    {
        type = type ?? e.type;

        const key = e.eventPhase === e.CAPTURING_PHASE ? `capture${type}` : type;
        const listeners = e.currentTarget.listeners(key);

        for (
            let i = 0, j = listeners.length;
            i < j && !e.propagationImmediatelyStopped;
            i++)
        {
            listeners[i](e);
        }
    }

    /**
     * Maps `pointerdown` events downstream, and also emits `touchstart`, `rightdown`, `mousedown`
     * events for those pointer types.
     *
     * @param from
     */
    protected mapPointerDown(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const e = this.createEvent(from);

        this.dispatchEvent(e, 'pointerdown');

        if (e.pointerType === 'touch')
        {
            this.dispatchEvent(e, 'touchstart');
        }
        else if (e.pointerType === 'mouse' || e.pointerType === 'pen')
        {
            const isRightButton = e.button === 2;

            this.dispatchEvent(e, isRightButton ? 'rightdown' : 'mousedown');
        }

        const trackingData = this.trackingData(from.pointerId);

        trackingData.pressTargetsByButton[from.button] = e.target;
    }

    protected mapPointerMove(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const e = this.createEvent(from);
        const isMouse = e.pointerType === 'mouse' || e.pointerType === 'pen';
        const trackingData = this.trackingData(from.pointerId);

        // First pointerout
        if (trackingData.overTarget && !e.composedPath().includes(trackingData.overTarget))
        {
            const outType = from.type === 'mousemove' ? 'mouseout' : 'pointerout';
            const outEvent = this.createEvent(from, outType, trackingData.overTarget);

            this.dispatchEvent(outEvent, 'pointerout');

            if (isMouse) this.dispatchEvent(outEvent, 'mouseout');
        }

        // Then pointerover
        if (trackingData.overTarget !== e.target)
        {
            const overType = from.type === 'mousemove' ? 'mouseover' : 'pointerover';
            const overEvent = this.cloneEvent(e, overType);// clone faster

            this.dispatchEvent(overEvent, 'pointerover');

            if (isMouse) this.dispatchEvent(overEvent, 'mouseover');
        }

        // Then pointermove
        this.dispatchEvent(e, 'pointermove');

        if (e.pointerType === 'touch') this.dispatchEvent(e, 'touchmove');
        if (isMouse)
        {
            this.dispatchEvent(e, 'mousemove');
            this.cursor = e.target?.cursor;
        }

        trackingData.overTarget = e.target;
    }

    protected mapPointerOver(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const trackingData = this.trackingData(from.pointerId);
        const e = this.createEvent(from);

        this.dispatchEvent(e, 'pointerover');

        if (e.pointerType === 'mouse')
        {
            this.dispatchEvent(e, 'mouseover');
            this.cursor = e.target?.cursor;
        }

        trackingData.overTarget = e.target;
    }

    protected mapPointerOut(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const trackingData = this.trackingData(from.pointerId);

        if (trackingData.overTarget)
        {
            const e = this.createEvent(from, 'pointerout', trackingData.overTarget);

            this.dispatchEvent(e);

            if (e.pointerType === 'mouse' || e.pointerType === 'pen') this.dispatchEvent(e, 'mouseout');

            trackingData.overTarget = null;
        }

        this.cursor = null;
    }

    /**
     * Maps `pointerup` events downstream, and also emits `touchend`, `rightup`, `mouseup` for those
     * pointer types.
     *
     * It also bubbles `pointerupoutside` events from the target of the corresponding `pointerdown`
     * event. Similarly, `touchendoutside`, rightupoutside`, and `mouseupoutside` events are fired.
     *
     * @param from
     */
    protected mapPointerUp(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const now = performance.now();
        const e = this.createEvent(from);

        this.dispatchEvent(e, 'pointerup');

        if (e.pointerType === 'touch')
        {
            this.dispatchEvent(e, 'touchend');
        }
        else if (e.pointerType === 'mouse' || e.pointerType === 'pen')
        {
            const isRightButton = e.button === 2;

            this.dispatchEvent(e, isRightButton ? 'rightup' : 'mouseup');
        }

        const trackingData = this.trackingData(from.pointerId);
        const pressTarget = trackingData.pressTargetsByButton[from.button];

        let clickTarget = pressTarget;

        // pointerupoutside only bubbles. It only bubbles upto the parent that doesn't contain
        // the pointerup location.
        if (pressTarget && !e.composedPath().includes(pressTarget))
        {
            let currentTarget = pressTarget;

            while (currentTarget && !e.composedPath().includes(currentTarget))
            {
                e.currentTarget = currentTarget;

                this.notifyTarget(e, 'pointerupoutside');

                if (e.pointerType === 'touch')
                {
                    this.notifyTarget(e, 'touchendoutside');
                }
                else if (e.pointerType === 'mouse' || e.pointerType === 'pen')
                {
                    const isRightButton = e.button === 2;

                    this.notifyTarget(e, isRightButton ? 'rightupoutside' : 'mouseupoutside');
                }

                currentTarget = currentTarget.parent;
            }

            delete trackingData.pressTargetsByButton[from.button];

            // currentTarget is the most specific ancestor holding both the pointerdown and pointerup
            // targets. That is - it's our click target!
            clickTarget = pressTarget;
        }

        // click!
        if (clickTarget)
        {
            const clickEvent = this.cloneEvent(e, 'click');

            clickEvent.target = clickTarget;
            clickEvent.path = null;

            if (!trackingData.clicksByButton[from.button])
            {
                trackingData.clicksByButton[from.button] = {
                    clickCount: 0,
                    target: clickEvent.target,
                    timeStamp: now,
                };
            }

            const clickHistory = trackingData.clicksByButton[from.button];

            if (clickHistory.target === clickEvent.target
                && now - clickHistory.timeStamp < 200)
            {
                ++clickHistory.clickCount;
            }
            else
            {
                clickHistory.clickCount = 1;
            }

            clickHistory.target = clickEvent.target;
            clickHistory.timeStamp = now;

            clickEvent.detail = clickHistory.clickCount;

            if (clickEvent.pointerType === 'mouse')
            {
                this.dispatchEvent(clickEvent, 'click');
            }
            else if (clickEvent.pointerType === 'touch')
            {
                this.dispatchEvent(clickEvent, 'tap');
            }
            else
            {
                this.dispatchEvent(clickEvent, 'pointertap');
            }
        }
    }

    protected mapPointerUpOutside(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const trackingData = this.trackingData(from.pointerId);
        const pressTarget = trackingData.pressTargetsByButton[from.button];
        const e = this.createEvent(from);

        if (pressTarget)
        {
            let currentTarget = pressTarget;

            while (currentTarget)
            {
                e.currentTarget = currentTarget;

                this.notifyTarget(e, 'pointerupoutside');

                if (e.pointerType === 'touch')
                {
                    this.notifyTarget(e, 'touchendoutside');
                }
                else if (e.pointerType === 'mouse' || e.pointerType === 'pen')
                {
                    this.notifyTarget(e, e.button === 2 ? 'rightupoutside' : 'mouseupoutside');
                }

                currentTarget = currentTarget.parent;
            }

            delete trackingData.pressTargetsByButton[from.button];
        }
    }

    protected createEvent(from: FederatedPointerEvent, type?: string, target?: FederatedEventTarget): FederatedPointerEvent
    {
        target = target ?? this.hitTest(from.global.x, from.global.y) as FederatedEventTarget;

        const event = new FederatedPointerEvent(this);

        event.nativeEvent = from.nativeEvent;
        event.originalEvent = from;
        event.target = target;

        this.copyPointerData(from, event);
        this.copyData(from, event);

        if (typeof type === 'string')
        {
            event.type = type;
        }

        return event;
    }

    protected cloneEvent(from: FederatedPointerEvent, type?: string): FederatedPointerEvent
    {
        const event = new FederatedPointerEvent(this);

        event.nativeEvent = from.nativeEvent;
        event.originalEvent = from.originalEvent;

        this.copyPointerData(from, event);
        this.copyData(from, event);

        // copy propagation path for perf
        event.target = from.target;
        event.path = from.composedPath().slice();
        event.type = type ?? event.type;

        return event;
    }

    protected copyPointerData(from: FederatedPointerEvent, to: FederatedPointerEvent): void
    {
        to.pointerId = from.pointerId;
        to.width = from.width;
        to.height = from.height;
        to.isPrimary = from.isPrimary;
        to.pointerType = from.pointerType;
        to.pressure = from.pressure;
        to.tangentialPressure = from.tangentialPressure;
        to.tiltX = from.tiltX;
        to.tiltY = from.tiltY;
        to.twist = from.twist;
        to.altKey = from.altKey;
        to.button = from.button;
        to.buttons = from.buttons;
        to.clientX = from.clientX;
        to.clientY = from.clientY;
        to.ctrlKey = from.ctrlKey;
        to.metaKey = from.metaKey;
        to.movementX = from.movementX;
        to.movementY = from.movementY;
        to.pageX = from.pageX;
        to.pageY = from.pageY;
        to.x = from.x;
        to.y = from.y;

        to.screen.copyFrom(from.screen);
        to.global.copyFrom(from.global);
    }

    protected copyData(from: FederatedEvent, to: FederatedEvent): void
    {
        to.isTrusted = from.isTrusted;
        to.srcElement = from.srcElement;
        to.timeStamp = performance.now();
        to.type = from.type;
    }

    protected trackingData(id: number): TrackingData
    {
        if (!this.mappingState.trackingData[id])
        {
            this.mappingState.trackingData[id] = {
                pressTargetsByButton: {},
                clicksByButton: {},
                overTarget: null
            };
        }

        return this.mappingState.trackingData[id];
    }
}
