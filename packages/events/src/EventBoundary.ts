import { FederatedPointerEvent } from './FederatedPointerEvent';
import { Point } from '@pixi/math';

import type { Cursor, FederatedEventTarget } from './FederatedEventTarget';
import type { DisplayObject } from '@pixi/display';
import type { FederatedEvent } from './FederatedEvent';

// The maximum iterations used in propagation. This prevent infinite loops.
const PROPAGATION_LIMIT = 2048;

const tempHitLocation = new Point();
const tempLocalMapping = new Point();

/**
 * The tracking data for each display object.
 */
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
 *
 * @memberof PIXI
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
     * @return - Whether `displayObject` passes hit testing for `location`.
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
     * Notify all the listeners to the event's `currentTarget`.
     *
     * @param e - The event passed to the target.
     */
    protected notifyTarget(e: FederatedEvent, type?: string): void
    {
        type = type ?? e.type;

        let key = e.eventPhase === e.CAPTURING_PHASE || e.eventPhase === e.AT_TARGET ? `capture${type}` : type;
        let listeners = e.currentTarget.listeners(key);

        for (
            let i = 0, j = listeners.length;
            i < j && !e.propagationImmediatelyStopped;
            i++)
        {
            listeners[i](e);
        }

        if (e.eventPhase === e.AT_TARGET)
        {
            key = type;
            listeners = e.currentTarget.listeners(key);

            for (
                let i = 0, j = listeners.length;
                i < j && !e.propagationImmediatelyStopped;
                i++)
            {
                listeners[i](e);
            }
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

    /**
     * Maps the upstream `pointermove` to downstream `pointerout`, `pointerover`, and `pointermove` events, in
     * that order. The tracking data for the specific pointer has an updated `overTarget`. `mouseout`, `mouseover`,
     * `mousemove`, and `touchmove` events are fired as well for specific pointer types.
     *
     * @param from - The upstream `pointermove` event.
     */
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

    /**
     * Maps the upstream `pointerover` to a downstream `pointerover` event. The tracking data for the specific
     * pointer gets a new `overTarget`.
     *
     * @param from - The upstream `pointerover` event.
     */
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

    /**
     * Maps the upstream `pointerout` to a downstream `pointerout` event. The tracking data for the specific pointer
     * is cleared of a `overTarget`.
     *
     * @param from - The upstream `pointerout` event.
     */
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
     * Maps the upstream `pointerup` event to downstream `pointerup`, `pointerupoutside`, and `click`/`pointertap` events, in
     * that order. The `pointerupoutside` event bubbles from the original `pointerdown` target to the most specific
     * ancestor of the `pointerdown` and `pointerup` targets, which is also the `click` event's target. `touchend`,
     * `rightup`, `mouseup`, `touchendoutside`, `rightupoutside`, `mouseupoutside`, and `tap` are fired as well for
     * specific pointer types.
     *
     * @param from - The upstream `pointerup` event.
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

    /**
     * Maps the upstream `pointerupoutside` event to a downstream `pointerupoutside` event that bubbles
     * from the original `pointerdown` target to the boundary's root. (The most specific ancestor of the `pointerdown`
     * event and the `pointerup` event must the {@code EventBoundary}'s root because the `pointerup` event
     * occurred outside of the boundary.) `touchendoutside`, `mouseupoutside`, and `rightupoutside` events
     * are fired as well for specific pointer types.
     *
     * The tracking data for the specific pointer is cleared of a `pressTarget`.
     *
     * @param from - The upstream `pointerupoutside` event.
     */
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

    /**
     * Creates an event whose {@code originalEvent} is {@code from}, with an optional {@code type} and
     * {@code target} override.
     *
     * @param from - The {@code originalEvent} for the returned event.
     * @param [type=from.type] - The type of the returned event.
     * @param target - The target of the returned event.
     */
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

    /**
     * Clones the event {@code from}, with an optional {@code type} override.
     *
     * @param from - The event to clone.
     * @param [type=from.type] - The type of the returned event.
     */
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

    /**
     * Copies pointer {@link FederatedEvent} data from {@code from} into {@code to}. This consists of
     * the following properties:
     * + pointerId
     * + width
     * + height
     * + isPrimary
     * + pointerType
     * + pressure
     * + tangentialPressure
     * + tiltX
     * + tiltY
     * + altKey
     * + button
     * + buttons
     * + clientX
     * + clientY
     * + metaKey
     * + movementX
     * + movementY
     * + pageX
     * + pageY
     * + x
     * + y
     * + screen
     * + global
     *
     * @param from
     * @param to
     */
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

    /**
     * Copies base {@link FederatedEvent} data from {@code from} into {@code to}. This consists of
     * the following properties:
     * + isTrusted
     * + srcElement
     * + timeStamp
     * + type
     *
     * @param from - The event to copy data from.
     * @param to - The event to copy data into.
     */
    protected copyData(from: FederatedEvent, to: FederatedEvent): void
    {
        to.isTrusted = from.isTrusted;
        to.srcElement = from.srcElement;
        to.timeStamp = performance.now();
        to.type = from.type;
    }

    /**
     * @param id - The pointer ID.
     * @return The tracking data stored for the given pointer. If no data exists, a blank
     *  state will be created.
     */
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

/**
 * Fired when a mouse button (usually a mouse left-button) is pressed on the display.
 * object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#mousedown
 * @param {PIXI.FederatedPointerEvent} event - The mousedown event.
 */

/**
 * Capture phase equivalent of {@code mousedown}.
 *
 * @event PIXI.DisplayObject#mousedowncapture - The capture phase mousedown.
 * @param {PIXI.FederatedPointerEvent}
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
 * on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#rightdown
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightdown}.
 *
 * @event PIXI.DisplayObject#rightdowncapture
 * @param {PIXI.FederatedPointerEvent} event - The rightdowncapture event.
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is released over the display
 * object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#mouseup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseup}.
 *
 * @event PIXI.DisplayObject#mouseupcature
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is released
 * over the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#rightup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightup}.
 *
 * @event PIXI.DisplayObject#rightupcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
 * the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * A {@code click} event fires after the {@code pointerdown} and {@code pointerup} events, in that
 * order. If the mouse is moved over another DisplayObject after the {@code pointerdown} event, the
 * {@code click} event is fired on the most specific common ancestor of the two target DisplayObjects.
 *
 * The {@code detail} property of the event is the number of clicks that occurred within a 200ms
 * window of each other upto the current click. For example, it will be {@code 2} for a double click.
 *
 * @event PIXI.DisplayObject#click
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code click}.
 *
 * @event PIXI.DisplayObject#clickcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
 * and released on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * This event follows the semantics of {@code click}.
 *
 * @event PIXI.DisplayObject#rightclick
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightclick}.
 *
 * @event PIXI.DisplayObject#rightclickcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is released outside the
 * display object that initially registered a
 * [mousedown]{@link PIXI.DisplayObject#event:mousedown}.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
 * other events. It only bubbles to the most specific ancestor of the targets of the corresponding {@code pointerdown}
 * and {@code pointerup} events, i.e. the target of the {@code click} event.
 *
 * @event PIXI.DisplayObject#mouseupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseupoutside}.
 *
 * @event PIXI.DisplayObject#mouseupoutsdiecature
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is released
 * outside the display object that initially registered a
 * [rightdown]{@link PIXI.DisplayObject#event:rightdown}.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#rightupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightupoutside}.
 *
 * @event PIXI.DisplayObject#rightupoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved while over the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#mousemove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mousemove}.
 *
 * @event PIXI.DisplayObject#mousemovecature
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved onto the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#mouseover
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseover}.
 *
 * @event PIXI.DisplayObject#mouseovercature
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved off the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * This may be fired on a DisplayObject that was removed from the scene graph immediately after
 * a {@code mouseover} event.
 *
 * @event PIXI.DisplayObject#mouseout
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseout}.
 *
 * @event PIXI.DisplayObject#mouseoutcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is pressed on the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointerdown
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerdown}.
 *
 * @event PIXI.DisplayObject#pointerdowncapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is released over the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointerup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerup}.
 *
 * @event PIXI.DisplayObject#pointerupcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the operating system cancels a pointer event.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointercancel
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointercancel}.
 *
 * @event PIXI.DisplayObject#pointercancelcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is pressed and released on the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointertap
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointertap}.
 *
 * @event PIXI.DisplayObject#pointertapcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is released outside the display object that initially
 * registered a [pointerdown]{@link PIXI.DisplayObject#event:pointerdown}.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
 * other events. It only bubbles to the most specific ancestor of the targets of the corresponding {@code pointerdown}
 * and {@code pointerup} events, i.e. the target of the {@code click} event.
 *
 * @event PIXI.DisplayObject#pointerupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerupoutside}.
 *
 * @event PIXI.DisplayObject#pointerupoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved while over the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointermove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointermove}.
 *
 * @event PIXi.DisplayObject#pointermovecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved onto the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointerover
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerover}.
 *
 * @event PIXi.DisplayObject#pointerovercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved off the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointerout
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerout}.
 *
 * @event PIXi.DisplayObject#pointeroutcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is placed on the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#touchstart
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchstart}.
 *
 * @event PIXi.DisplayObject#touchstartcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is removed from the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#touchend
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchend}.
 *
 * @event PIXi.DisplayObject#touchendcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the operating system cancels a touch.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#touchcancel
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchcancel}.
 *
 * @event PIXi.DisplayObject#touchcancelcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is placed and removed from the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#tap
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code tap}.
 *
 * @event PIXi.DisplayObject#tapcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is removed outside of the display object that initially
 * registered a [touchstart]{@link PIXI.DisplayObject#event:touchstart}.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#touchendoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchendoutside}.
 *
 * @event PIXi.DisplayObject#touchendoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is moved along the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#touchmove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchmove}.
 *
 * @event PIXi.DisplayObject#touchmovecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */
