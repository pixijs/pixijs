import EventEmitter from 'eventemitter3';
import { Point } from '../maths/point/Point';
import { warn } from '../utils/logging/warn';
import { EventsTicker } from './EventTicker';
import { FederatedMouseEvent } from './FederatedMouseEvent';
import { FederatedPointerEvent } from './FederatedPointerEvent';
import { FederatedWheelEvent } from './FederatedWheelEvent';

import type { Renderable } from '../rendering/renderers/shared/Renderable';
import type { Container } from '../scene/container/Container';
import type { EmitterListeners, TrackingData } from './EventBoundaryTypes';
import type { FederatedEvent } from './FederatedEvent';
import type {
    Cursor, EventMode, FederatedEventHandler,
} from './FederatedEventTarget';

// The maximum iterations used in propagation. This prevent infinite loops.
const PROPAGATION_LIMIT = 2048;

const tempHitLocation = new Point();
const tempLocalMapping = new Point();

/**
 * Event boundaries are "barriers" where events coming from an upstream scene are modified before downstream propagation.
 *
 * ## Root event boundary
 *
 * The {@link EventSystem#rootBoundary rootBoundary} handles events coming from the &lt;canvas /&gt;.
 * {@link EventSystem} handles the normalization from native {@link https://dom.spec.whatwg.org/#event Events}
 * into {@link FederatedEvent FederatedEvents}. The rootBoundary then does the hit-testing and event dispatch
 * for the upstream normalized event.
 *
 * ## Additional event boundaries
 *
 * An additional event boundary may be desired within an application's scene graph. For example, if a portion of the scene is
 * is flat with many children at one level - a spatial hash maybe needed to accelerate hit testing. In this scenario, the
 * container can be detached from the scene and glued using a custom event boundary.
 *
 * ```ts
 * import { Container } from 'pixi.js';
 * import { EventBoundary } from 'pixi.js';
 * import { SpatialHash } from 'pixi-spatial-hash';
 *
 * class HashedHitTestingEventBoundary
 * {
 *     private spatialHash: SpatialHash;
 *
 *     constructor(scene: Container, spatialHash: SpatialHash)
 *     {
 *         super(scene);
 *         this.spatialHash = spatialHash;
 *     }
 *
 *     hitTestRecursive(...)
 *     {
 *         // TODO: If target === this.rootTarget, then use spatial hash to get a
 *         // list of possible children that match the given (x,y) coordinates.
 *     }
 * }
 *
 * class VastScene extends Container
 * {
 *     protected eventBoundary: EventBoundary;
 *     protected scene: Container;
 *     protected spatialHash: SpatialHash;
 *
 *     constructor()
 *     {
 *         this.scene = new Container();
 *         this.spatialHash = new SpatialHash();
 *         this.eventBoundary = new HashedHitTestingEventBoundary(this.scene, this.spatialHash);
 *
 *         // Populate this.scene with a ton of children, while updating this.spatialHash
 *     }
 * }
 * ```
 * @memberof events
 */
export class EventBoundary
{
    /**
     * The root event-target residing below the event boundary.
     * All events are dispatched trickling down and bubbling up to this `rootTarget`.
     */
    public rootTarget: Container;

    /**
     * Emits events after they were dispatched into the scene graph.
     *
     * This can be used for global events listening, regardless of the scene graph being used. It should
     * not be used by interactive libraries for normal use.
     *
     * Special events that do not bubble all the way to the root target are not emitted from here,
     * e.g. pointerenter, pointerleave, click.
     */
    public dispatch: EventEmitter = new EventEmitter();

    /** The cursor preferred by the event targets underneath this boundary. */
    public cursor: Cursor | string;

    /**
     * This flag would emit `pointermove`, `touchmove`, and `mousemove` events on all Containers.
     *
     * The `moveOnAll` semantics mirror those of earlier versions of PixiJS. This was disabled in favor of
     * the Pointer Event API's approach.
     */
    public moveOnAll = false;

    /** Enables the global move events. `globalpointermove`, `globaltouchmove`, and `globalmousemove` */
    public enableGlobalMoveEvents = true;

    /**
     * Maps event types to forwarding handles for them.
     *
     * {@link EventBoundary EventBoundary} provides mapping for "pointerdown", "pointermove",
     * "pointerout", "pointerleave", "pointerover", "pointerup", and "pointerupoutside" by default.
     * @see EventBoundary#addEventMapping
     */
    protected mappingTable: Record<string, Array<{
        fn: (e: FederatedEvent) => void,
        priority: number
    }>>;

    /**
     * State object for mapping methods.
     * @see EventBoundary#trackingData
     */
    protected mappingState: Record<string, any> = {
        trackingData: {}
    };

    /**
     * The event pool maps event constructors to an free pool of instances of those specific events.
     * @see EventBoundary#allocateEvent
     * @see EventBoundary#freeEvent
     */
    protected eventPool: Map<typeof FederatedEvent, FederatedEvent[]> = new Map();

    /** Every interactive element gathered from the scene. Only used in `pointermove` */
    private readonly _allInteractiveElements: Container[] = [];
    /** Every element that passed the hit test. Only used in `pointermove` */
    private _hitElements: Container[] = [];
    /** Whether or not to collect all the interactive elements from the scene. Enabled in `pointermove` */
    private _isPointerMoveEvent = false;

    /**
     * @param rootTarget - The holder of the event boundary.
     */
    constructor(rootTarget?: Container)
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
        this.mapWheel = this.mapWheel.bind(this);

        this.mappingTable = {};
        this.addEventMapping('pointerdown', this.mapPointerDown);
        this.addEventMapping('pointermove', this.mapPointerMove);
        this.addEventMapping('pointerout', this.mapPointerOut);
        this.addEventMapping('pointerleave', this.mapPointerOut);
        this.addEventMapping('pointerover', this.mapPointerOver);
        this.addEventMapping('pointerup', this.mapPointerUp);
        this.addEventMapping('pointerupoutside', this.mapPointerUpOutside);
        this.addEventMapping('wheel', this.mapWheel);
    }

    /**
     * Adds an event mapping for the event `type` handled by `fn`.
     *
     * Event mappings can be used to implement additional or custom events. They take an event
     * coming from the upstream scene (or directly from the {@link EventSystem}) and dispatch new downstream events
     * generally trickling down and bubbling up to {@link EventBoundary.rootTarget this.rootTarget}.
     *
     * To modify the semantics of existing events, the built-in mapping methods of EventBoundary should be overridden
     * instead.
     * @param type - The type of upstream event to map.
     * @param fn - The mapping method. The context of this function must be bound manually, if desired.
     */
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

    /**
     * Dispatches the given event
     * @param e - The event to dispatch.
     * @param type - The type of event to dispatch. Defaults to `e.type`.
     */
    public dispatchEvent(e: FederatedEvent, type?: string): void
    {
        e.propagationStopped = false;
        e.propagationImmediatelyStopped = false;

        this.propagate(e, type);
        this.dispatch.emit(type || e.type, e);
    }

    /**
     * Maps the given upstream event through the event boundary and propagates it downstream.
     * @param e - The event to map.
     */
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
            // #if _DEBUG
            warn(`[EventBoundary]: Event mapping not defined for ${e.type}`);
            // #endif
        }
    }

    /**
     * Finds the Container that is the target of a event at the given coordinates.
     *
     * The passed (x,y) coordinates are in the world space above this event boundary.
     * @param x - The x coordinate of the event.
     * @param y - The y coordinate of the event.
     */
    public hitTest(
        x: number,
        y: number,
    ): Container
    {
        EventsTicker.pauseUpdate = true;
        // if we are using global move events, we need to hit test the whole scene graph
        const useMove = this._isPointerMoveEvent && this.enableGlobalMoveEvents;
        const fn = useMove ? 'hitTestMoveRecursive' : 'hitTestRecursive';
        const invertedPath = this[fn](
            this.rootTarget,
            this.rootTarget.eventMode,
            tempHitLocation.set(x, y),
            this.hitTestFn,
            this.hitPruneFn,
        );

        return invertedPath && invertedPath[0];
    }

    /**
     * Propagate the passed event from from {@link EventBoundary.rootTarget this.rootTarget} to its
     * target {@code e.target}.
     * @param e - The event to propagate.
     * @param type - The type of event to propagate. Defaults to `e.type`.
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
     * Emits the event {@code e} to all interactive containers. The event is propagated in the bubbling phase always.
     *
     * This is used in the `globalpointermove` event.
     * @param e - The emitted event.
     * @param type - The listeners to notify.
     * @param targets - The targets to notify.
     */
    public all(e: FederatedEvent, type?: string | string[], targets = this._allInteractiveElements): void
    {
        if (targets.length === 0) return;

        e.eventPhase = e.BUBBLING_PHASE;

        const events = Array.isArray(type) ? type : [type];

        // loop through all interactive elements and notify them of the event
        // loop through targets backwards
        for (let i = targets.length - 1; i >= 0; i--)
        {
            events.forEach((event) =>
            {
                e.currentTarget = targets[i];
                this.notifyTarget(e, event);
            });
        }
    }

    /**
     * Finds the propagation path from {@link EventBoundary.rootTarget rootTarget} to the passed
     * {@code target}. The last element in the path is {@code target}.
     * @param target - The target to find the propagation path to.
     */
    public propagationPath(target: Container): Container[]
    {
        const propagationPath = [target];

        for (let i = 0; i < PROPAGATION_LIMIT && (target !== this.rootTarget && target.parent); i++)
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

    protected hitTestMoveRecursive(
        currentTarget: Container,
        eventMode: EventMode,
        location: Point,
        testFn: (object: Container, pt: Point) => boolean,
        pruneFn: (object: Container, pt: Point) => boolean,
        ignore = false
    ): Container[]
    {
        let shouldReturn = false;

        // only bail out early if it is not interactive
        if (this._interactivePrune(currentTarget)) return null;

        if (currentTarget.eventMode === 'dynamic' || eventMode === 'dynamic')
        {
            EventsTicker.pauseUpdate = false;
        }

        if (currentTarget.interactiveChildren && currentTarget.children)
        {
            const children = currentTarget.children;

            for (let i = children.length - 1; i >= 0; i--)
            {
                const child = children[i] as Container;

                const nestedHit = this.hitTestMoveRecursive(
                    child,
                    this._isInteractive(eventMode) ? eventMode : child.eventMode,
                    location,
                    testFn,
                    pruneFn,
                    ignore || pruneFn(currentTarget, location)
                );

                if (nestedHit)
                {
                    // Its a good idea to check if a child has lost its parent.
                    // this means it has been removed whilst looping so its best
                    if (nestedHit.length > 0 && !nestedHit[nestedHit.length - 1].parent)
                    {
                        continue;
                    }

                    // Only add the current hit-test target to the hit-test chain if the chain
                    // has already started (i.e. the event target has been found) or if the current
                    // target is interactive (i.e. it becomes the event target).
                    const isInteractive = currentTarget.isInteractive();

                    if (nestedHit.length > 0 || isInteractive)
                    {
                        if (isInteractive) this._allInteractiveElements.push(currentTarget);
                        nestedHit.push(currentTarget);
                    }

                    // store all hit elements to be returned once we have traversed the whole tree
                    if (this._hitElements.length === 0) this._hitElements = nestedHit;

                    shouldReturn = true;
                }
            }
        }

        const isInteractiveMode = this._isInteractive(eventMode);
        const isInteractiveTarget = currentTarget.isInteractive();

        if (isInteractiveTarget && isInteractiveTarget) this._allInteractiveElements.push(currentTarget);

        // we don't carry on hit testing something once we have found a hit,
        // now only care about gathering the interactive elements
        if (ignore || this._hitElements.length > 0) return null;

        if (shouldReturn) return this._hitElements as Container[];

        // Finally, hit test this Container itself.
        if (isInteractiveMode && (!pruneFn(currentTarget, location) && testFn(currentTarget, location)))
        {
            // The current hit-test target is the event's target only if it is interactive. Otherwise,
            // the first interactive ancestor will be the event's target.
            return isInteractiveTarget ? [currentTarget] : [];
        }

        return null;
    }

    /**
     * Recursive implementation for {@link EventBoundary.hitTest hitTest}.
     * @param currentTarget - The Container that is to be hit tested.
     * @param eventMode - The event mode for the `currentTarget` or one of its parents.
     * @param location - The location that is being tested for overlap.
     * @param testFn - Callback that determines whether the target passes hit testing. This callback
     *  can assume that `pruneFn` failed to prune the container.
     * @param pruneFn - Callback that determiness whether the target and all of its children
     *  cannot pass the hit test. It is used as a preliminary optimization to prune entire subtrees
     *  of the scene graph.
     * @returns An array holding the hit testing target and all its ancestors in order. The first element
     *  is the target itself and the last is {@link EventBoundary.rootTarget rootTarget}. This is the opposite
     *  order w.r.t. the propagation path. If no hit testing target is found, null is returned.
     */
    protected hitTestRecursive(
        currentTarget: Container,
        eventMode: EventMode,
        location: Point,
        testFn: (object: Container, pt: Point) => boolean,
        pruneFn: (object: Container, pt: Point) => boolean
    ): Container[]
    {
        // Attempt to prune this Container and its subtree as an optimization.
        if (this._interactivePrune(currentTarget) || pruneFn(currentTarget, location))
        {
            return null;
        }
        if (currentTarget.eventMode === 'dynamic' || eventMode === 'dynamic')
        {
            EventsTicker.pauseUpdate = false;
        }

        // Find a child that passes the hit testing and return one, if any.
        if (currentTarget.interactiveChildren && currentTarget.children)
        {
            const children = currentTarget.children;
            const relativeLocation = location;

            for (let i = children.length - 1; i >= 0; i--)
            {
                const child = children[i] as Container;

                const nestedHit = this.hitTestRecursive(
                    child,
                    this._isInteractive(eventMode) ? eventMode : child.eventMode,
                    relativeLocation,
                    testFn,
                    pruneFn
                );

                if (nestedHit)
                {
                    // Its a good idea to check if a child has lost its parent.
                    // this means it has been removed whilst looping so its best
                    if (nestedHit.length > 0 && !nestedHit[nestedHit.length - 1].parent)
                    {
                        continue;
                    }

                    // Only add the current hit-test target to the hit-test chain if the chain
                    // has already started (i.e. the event target has been found) or if the current
                    // target is interactive (i.e. it becomes the event target).
                    const isInteractive = currentTarget.isInteractive();

                    if (nestedHit.length > 0 || isInteractive) nestedHit.push(currentTarget);

                    return nestedHit;
                }
            }
        }

        const isInteractiveMode = this._isInteractive(eventMode);
        const isInteractiveTarget = currentTarget.isInteractive();

        // Finally, hit test this Container itself.
        if (isInteractiveMode && testFn(currentTarget, location))
        {
            // The current hit-test target is the event's target only if it is interactive. Otherwise,
            // the first interactive ancestor will be the event's target.
            return isInteractiveTarget ? [currentTarget] : [];
        }

        return null;
    }

    private _isInteractive(int: EventMode): int is 'static' | 'dynamic'
    {
        return int === 'static' || int === 'dynamic';
    }

    private _interactivePrune(container: Container): boolean
    {
        // If container is a mask, invisible, or not renderable then it cannot be hit directly.
        if (!container || !container.visible || !container.renderable || !container.measurable)
        {
            return true;
        }

        // If this Container is none then it cannot be hit by anything.
        if (container.eventMode === 'none')
        {
            return true;
        }

        // If this Container is passive and it has no interactive children then it cannot be hit
        if (container.eventMode === 'passive' && !container.interactiveChildren)
        {
            return true;
        }

        return false;
    }

    /**
     * Checks whether the container or any of its children cannot pass the hit test at all.
     *
     * {@link EventBoundary}'s implementation uses the {@link Container.hitArea hitArea}
     * and {@link Container._maskEffect} for pruning.
     * @param container - The container to prune.
     * @param location - The location to test for overlap.
     */
    protected hitPruneFn(container: Container, location: Point): boolean
    {
        if (container.hitArea)
        {
            container.worldTransform.applyInverse(location, tempLocalMapping);

            if (!container.hitArea.contains(tempLocalMapping.x, tempLocalMapping.y))
            {
                return true;
            }
        }

        if (container.effects && container.effects.length)
        {
            for (let i = 0; i < container.effects.length; i++)
            {
                const effect = container.effects[i];

                if (effect.containsPoint)
                {
                    const effectContainsPoint = effect.containsPoint(location, this.hitTestFn);

                    if (!effectContainsPoint)
                    {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Checks whether the container passes hit testing for the given location.
     * @param container - The container to test.
     * @param location - The location to test for overlap.
     * @returns - Whether `container` passes hit testing for `location`.
     */
    protected hitTestFn(container: Container, location: Point): boolean
    {
        // If the container failed pruning with a hitArea, then it must pass it.
        if (container.hitArea)
        {
            return true;
        }

        if ((container as Renderable)?.containsPoint)
        {
            container.worldTransform.applyInverse(location, tempLocalMapping);

            return (container as Renderable).containsPoint(tempLocalMapping) as boolean;
        }

        // TODO: Should we hit test based on bounds?

        return false;
    }

    /**
     * Notify all the listeners to the event's `currentTarget`.
     *
     * If the `currentTarget` contains the property `on<type>`, then it is called here,
     * simulating the behavior from version 6.x and prior.
     * @param e - The event passed to the target.
     * @param type - The type of event to notify. Defaults to `e.type`.
     */
    protected notifyTarget(e: FederatedEvent, type?: string): void
    {
        if (!e.currentTarget.isInteractive())
        {
            return;
        }

        type ??= e.type;

        // call the `on${type}` for the current target if it exists
        const handlerKey = `on${type}` as keyof Container;

        (e.currentTarget[handlerKey] as FederatedEventHandler<FederatedEvent>)?.(e);

        const key = e.eventPhase === e.CAPTURING_PHASE || e.eventPhase === e.AT_TARGET ? `${type}capture` : type;

        this._notifyListeners(e, key);

        if (e.eventPhase === e.AT_TARGET)
        {
            this._notifyListeners(e, type);
        }
    }

    /**
     * Maps the upstream `pointerdown` events to a downstream `pointerdown` event.
     *
     * `touchstart`, `rightdown`, `mousedown` events are also dispatched for specific pointer types.
     * @param from - The upstream `pointerdown` event.
     */
    protected mapPointerDown(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            // #if _DEBUG
            warn('EventBoundary cannot map a non-pointer event as a pointer event');
            // #endif

            return;
        }

        const e = this.createPointerEvent(from);

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

        trackingData.pressTargetsByButton[from.button] = e.composedPath();

        this.freeEvent(e);
    }

    /**
     * Maps the upstream `pointermove` to downstream `pointerout`, `pointerover`, and `pointermove` events, in that order.
     *
     * The tracking data for the specific pointer has an updated `overTarget`. `mouseout`, `mouseover`,
     * `mousemove`, and `touchmove` events are fired as well for specific pointer types.
     * @param from - The upstream `pointermove` event.
     */
    protected mapPointerMove(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            // #if _DEBUG
            warn('EventBoundary cannot map a non-pointer event as a pointer event');
            // #endif

            return;
        }

        this._allInteractiveElements.length = 0;
        this._hitElements.length = 0;
        this._isPointerMoveEvent = true;
        const e = this.createPointerEvent(from);

        this._isPointerMoveEvent = false;
        const isMouse = e.pointerType === 'mouse' || e.pointerType === 'pen';
        const trackingData = this.trackingData(from.pointerId);
        const outTarget = this.findMountedTarget(trackingData.overTargets);

        // First pointerout/pointerleave
        if (trackingData.overTargets?.length > 0 && outTarget !== e.target)
        {
            // pointerout always occurs on the overTarget when the pointer hovers over another element.
            const outType = from.type === 'mousemove' ? 'mouseout' : 'pointerout';
            const outEvent = this.createPointerEvent(from, outType, outTarget);

            this.dispatchEvent(outEvent, 'pointerout');
            if (isMouse) this.dispatchEvent(outEvent, 'mouseout');

            // If the pointer exits overTarget and its descendants, then a pointerleave event is also fired. This event
            // is dispatched to all ancestors that no longer capture the pointer.
            if (!e.composedPath().includes(outTarget))
            {
                const leaveEvent = this.createPointerEvent(from, 'pointerleave', outTarget);

                leaveEvent.eventPhase = leaveEvent.AT_TARGET;

                while (leaveEvent.target && !e.composedPath().includes(leaveEvent.target))
                {
                    leaveEvent.currentTarget = leaveEvent.target;

                    this.notifyTarget(leaveEvent);
                    if (isMouse) this.notifyTarget(leaveEvent, 'mouseleave');

                    leaveEvent.target = leaveEvent.target.parent;
                }

                this.freeEvent(leaveEvent);
            }

            this.freeEvent(outEvent);
        }

        // Then pointerover
        if (outTarget !== e.target)
        {
            // pointerover always occurs on the new overTarget
            const overType = from.type === 'mousemove' ? 'mouseover' : 'pointerover';
            const overEvent = this.clonePointerEvent(e, overType);// clone faster

            this.dispatchEvent(overEvent, 'pointerover');
            if (isMouse) this.dispatchEvent(overEvent, 'mouseover');

            // Probe whether the newly hovered Container is an ancestor of the original overTarget.
            let overTargetAncestor = outTarget?.parent;

            while (overTargetAncestor && overTargetAncestor !== this.rootTarget.parent)
            {
                if (overTargetAncestor === e.target) break;

                overTargetAncestor = overTargetAncestor.parent;
            }

            // The pointer has entered a non-ancestor of the original overTarget. This means we need a pointerentered
            // event.
            const didPointerEnter = !overTargetAncestor || overTargetAncestor === this.rootTarget.parent;

            if (didPointerEnter)
            {
                const enterEvent = this.clonePointerEvent(e, 'pointerenter');

                enterEvent.eventPhase = enterEvent.AT_TARGET;

                while (enterEvent.target
                        && enterEvent.target !== outTarget
                        && enterEvent.target !== this.rootTarget.parent)
                {
                    enterEvent.currentTarget = enterEvent.target;

                    this.notifyTarget(enterEvent);
                    if (isMouse) this.notifyTarget(enterEvent, 'mouseenter');

                    enterEvent.target = enterEvent.target.parent;
                }

                this.freeEvent(enterEvent);
            }

            this.freeEvent(overEvent);
        }

        const allMethods: string[] = [];
        const allowGlobalPointerEvents = this.enableGlobalMoveEvents ?? true;

        this.moveOnAll ? allMethods.push('pointermove') : this.dispatchEvent(e, 'pointermove');
        allowGlobalPointerEvents && allMethods.push('globalpointermove');

        // Then pointermove
        if (e.pointerType === 'touch')
        {
            this.moveOnAll ? allMethods.splice(1, 0, 'touchmove') : this.dispatchEvent(e, 'touchmove');
            allowGlobalPointerEvents && allMethods.push('globaltouchmove');
        }

        if (isMouse)
        {
            this.moveOnAll ? allMethods.splice(1, 0, 'mousemove') : this.dispatchEvent(e, 'mousemove');
            allowGlobalPointerEvents && allMethods.push('globalmousemove');
            this.cursor = e.target?.cursor;
        }

        if (allMethods.length > 0)
        {
            this.all(e, allMethods);
        }
        this._allInteractiveElements.length = 0;
        this._hitElements.length = 0;

        trackingData.overTargets = e.composedPath();

        this.freeEvent(e);
    }

    /**
     * Maps the upstream `pointerover` to downstream `pointerover` and `pointerenter` events, in that order.
     *
     * The tracking data for the specific pointer gets a new `overTarget`.
     * @param from - The upstream `pointerover` event.
     */
    protected mapPointerOver(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            // #if _DEBUG
            warn('EventBoundary cannot map a non-pointer event as a pointer event');
            // #endif

            return;
        }

        const trackingData = this.trackingData(from.pointerId);
        const e = this.createPointerEvent(from);
        const isMouse = e.pointerType === 'mouse' || e.pointerType === 'pen';

        this.dispatchEvent(e, 'pointerover');
        if (isMouse) this.dispatchEvent(e, 'mouseover');
        if (e.pointerType === 'mouse') this.cursor = e.target?.cursor;

        // pointerenter events must be fired since the pointer entered from upstream.
        const enterEvent = this.clonePointerEvent(e, 'pointerenter');

        enterEvent.eventPhase = enterEvent.AT_TARGET;

        while (enterEvent.target && enterEvent.target !== this.rootTarget.parent)
        {
            enterEvent.currentTarget = enterEvent.target;

            this.notifyTarget(enterEvent);
            if (isMouse) this.notifyTarget(enterEvent, 'mouseenter');

            enterEvent.target = enterEvent.target.parent;
        }

        trackingData.overTargets = e.composedPath();

        this.freeEvent(e);
        this.freeEvent(enterEvent);
    }

    /**
     * Maps the upstream `pointerout` to downstream `pointerout`, `pointerleave` events, in that order.
     *
     * The tracking data for the specific pointer is cleared of a `overTarget`.
     * @param from - The upstream `pointerout` event.
     */
    protected mapPointerOut(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            // #if _DEBUG
            warn('EventBoundary cannot map a non-pointer event as a pointer event');
            // #endif

            return;
        }

        const trackingData = this.trackingData(from.pointerId);

        if (trackingData.overTargets)
        {
            const isMouse = from.pointerType === 'mouse' || from.pointerType === 'pen';
            const outTarget = this.findMountedTarget(trackingData.overTargets);

            // pointerout first
            const outEvent = this.createPointerEvent(from, 'pointerout', outTarget);

            this.dispatchEvent(outEvent);
            if (isMouse) this.dispatchEvent(outEvent, 'mouseout');

            // pointerleave(s) are also dispatched b/c the pointer must've left rootTarget and its descendants to
            // get an upstream pointerout event (upstream events do not know rootTarget has descendants).
            const leaveEvent = this.createPointerEvent(from, 'pointerleave', outTarget);

            leaveEvent.eventPhase = leaveEvent.AT_TARGET;

            while (leaveEvent.target && leaveEvent.target !== this.rootTarget.parent)
            {
                leaveEvent.currentTarget = leaveEvent.target;

                this.notifyTarget(leaveEvent);
                if (isMouse) this.notifyTarget(leaveEvent, 'mouseleave');

                leaveEvent.target = leaveEvent.target.parent;
            }

            trackingData.overTargets = null;

            this.freeEvent(outEvent);
            this.freeEvent(leaveEvent);
        }

        this.cursor = null;
    }

    /**
     * Maps the upstream `pointerup` event to downstream `pointerup`, `pointerupoutside`,
     * and `click`/`rightclick`/`pointertap` events, in that order.
     *
     * The `pointerupoutside` event bubbles from the original `pointerdown` target to the most specific
     * ancestor of the `pointerdown` and `pointerup` targets, which is also the `click` event's target. `touchend`,
     * `rightup`, `mouseup`, `touchendoutside`, `rightupoutside`, `mouseupoutside`, and `tap` are fired as well for
     * specific pointer types.
     * @param from - The upstream `pointerup` event.
     */
    protected mapPointerUp(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            // #if _DEBUG
            warn('EventBoundary cannot map a non-pointer event as a pointer event');
            // #endif

            return;
        }

        const now = performance.now();
        const e = this.createPointerEvent(from);

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
        const pressTarget = this.findMountedTarget(trackingData.pressTargetsByButton[from.button]);

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
            clickTarget = currentTarget;
        }

        // click!
        if (clickTarget)
        {
            const clickEvent = this.clonePointerEvent(e, 'click');

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
                const isRightButton = clickEvent.button === 2;

                this.dispatchEvent(clickEvent, isRightButton ? 'rightclick' : 'click');
            }
            else if (clickEvent.pointerType === 'touch')
            {
                this.dispatchEvent(clickEvent, 'tap');
            }

            this.dispatchEvent(clickEvent, 'pointertap');

            this.freeEvent(clickEvent);
        }

        this.freeEvent(e);
    }

    /**
     * Maps the upstream `pointerupoutside` event to a downstream `pointerupoutside` event, bubbling from the original
     * `pointerdown` target to `rootTarget`.
     *
     * (The most specific ancestor of the `pointerdown` event and the `pointerup` event must the
     * `{@link EventBoundary}'s root because the `pointerup` event occurred outside of the boundary.)
     *
     * `touchendoutside`, `mouseupoutside`, and `rightupoutside` events are fired as well for specific pointer
     * types. The tracking data for the specific pointer is cleared of a `pressTarget`.
     * @param from - The upstream `pointerupoutside` event.
     */
    protected mapPointerUpOutside(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            // #if _DEBUG
            warn('EventBoundary cannot map a non-pointer event as a pointer event');
            // #endif

            return;
        }

        const trackingData = this.trackingData(from.pointerId);
        const pressTarget = this.findMountedTarget(trackingData.pressTargetsByButton[from.button]);
        const e = this.createPointerEvent(from);

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

        this.freeEvent(e);
    }

    /**
     * Maps the upstream `wheel` event to a downstream `wheel` event.
     * @param from - The upstream `wheel` event.
     */
    protected mapWheel(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedWheelEvent))
        {
            // #if _DEBUG
            warn('EventBoundary cannot map a non-wheel event as a wheel event');
            // #endif

            return;
        }

        const wheelEvent = this.createWheelEvent(from);

        this.dispatchEvent(wheelEvent);
        this.freeEvent(wheelEvent);
    }

    /**
     * Finds the most specific event-target in the given propagation path that is still mounted in the scene graph.
     *
     * This is used to find the correct `pointerup` and `pointerout` target in the case that the original `pointerdown`
     * or `pointerover` target was unmounted from the scene graph.
     * @param propagationPath - The propagation path was valid in the past.
     * @returns - The most specific event-target still mounted at the same location in the scene graph.
     */
    protected findMountedTarget(propagationPath: Container[]): Container
    {
        if (!propagationPath)
        {
            return null;
        }

        let currentTarget = propagationPath[0];

        for (let i = 1; i < propagationPath.length; i++)
        {
            // Set currentTarget to the next target in the path only if it is still attached to the
            // scene graph (i.e. parent still points to the expected ancestor).
            if (propagationPath[i].parent === currentTarget)
            {
                currentTarget = propagationPath[i];
            }
            else
            {
                break;
            }
        }

        return currentTarget;
    }

    /**
     * Creates an event whose {@code originalEvent} is {@code from}, with an optional `type` and `target` override.
     *
     * The event is allocated using {@link EventBoundary#allocateEvent this.allocateEvent}.
     * @param from - The {@code originalEvent} for the returned event.
     * @param [type=from.type] - The type of the returned event.
     * @param target - The target of the returned event.
     */
    protected createPointerEvent(
        from: FederatedPointerEvent,
        type?: string,
        target?: Container
    ): FederatedPointerEvent
    {
        const event = this.allocateEvent(FederatedPointerEvent);

        this.copyPointerData(from, event);
        this.copyMouseData(from, event);
        this.copyData(from, event);

        event.nativeEvent = from.nativeEvent;
        event.originalEvent = from;
        event.target = target
            ?? this.hitTest(event.global.x, event.global.y) as Container
            ?? this._hitElements[0];

        if (typeof type === 'string')
        {
            event.type = type;
        }

        return event;
    }

    /**
     * Creates a wheel event whose {@code originalEvent} is {@code from}.
     *
     * The event is allocated using {@link EventBoundary#allocateEvent this.allocateEvent}.
     * @param from - The upstream wheel event.
     */
    protected createWheelEvent(from: FederatedWheelEvent): FederatedWheelEvent
    {
        const event = this.allocateEvent(FederatedWheelEvent);

        this.copyWheelData(from, event);
        this.copyMouseData(from, event);
        this.copyData(from, event);

        event.nativeEvent = from.nativeEvent;
        event.originalEvent = from;
        event.target = this.hitTest(event.global.x, event.global.y);

        return event;
    }

    /**
     * Clones the event {@code from}, with an optional {@code type} override.
     *
     * The event is allocated using {@link EventBoundary#allocateEvent this.allocateEvent}.
     * @param from - The event to clone.
     * @param [type=from.type] - The type of the returned event.
     */
    protected clonePointerEvent(from: FederatedPointerEvent, type?: string): FederatedPointerEvent
    {
        const event = this.allocateEvent(FederatedPointerEvent);

        event.nativeEvent = from.nativeEvent;
        event.originalEvent = from.originalEvent;

        this.copyPointerData(from, event);
        this.copyMouseData(from, event);
        this.copyData(from, event);

        // copy propagation path for perf
        event.target = from.target;
        event.path = from.composedPath().slice();
        event.type = type ?? event.type;

        return event;
    }

    /**
     * Copies wheel {@link FederatedWheelEvent} data from {@code from} into {@code to}.
     *
     * The following properties are copied:
     * + deltaMode
     * + deltaX
     * + deltaY
     * + deltaZ
     * @param from - The event to copy data from.
     * @param to - The event to copy data into.
     */
    protected copyWheelData(from: FederatedWheelEvent, to: FederatedWheelEvent): void
    {
        to.deltaMode = from.deltaMode;
        to.deltaX = from.deltaX;
        to.deltaY = from.deltaY;
        to.deltaZ = from.deltaZ;
    }

    /**
     * Copies pointer {@link FederatedPointerEvent} data from {@code from} into {@code to}.
     *
     * The following properties are copied:
     * + pointerId
     * + width
     * + height
     * + isPrimary
     * + pointerType
     * + pressure
     * + tangentialPressure
     * + tiltX
     * + tiltY
     * @param from - The event to copy data from.
     * @param to - The event to copy data into.
     */
    protected copyPointerData(from: FederatedEvent, to: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent && to instanceof FederatedPointerEvent)) return;

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
    }

    /**
     * Copies mouse {@link FederatedMouseEvent} data from {@code from} to {@code to}.
     *
     * The following properties are copied:
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
     * + shiftKey
     * + global
     * @param from - The event to copy data from.
     * @param to - The event to copy data into.
     */
    protected copyMouseData(from: FederatedEvent, to: FederatedEvent): void
    {
        if (!(from instanceof FederatedMouseEvent && to instanceof FederatedMouseEvent)) return;

        to.altKey = from.altKey;
        to.button = from.button;
        to.buttons = from.buttons;
        to.client.copyFrom(from.client);
        to.ctrlKey = from.ctrlKey;
        to.metaKey = from.metaKey;
        to.movement.copyFrom(from.movement);
        to.screen.copyFrom(from.screen);
        to.shiftKey = from.shiftKey;
        to.global.copyFrom(from.global);
    }

    /**
     * Copies base {@link FederatedEvent} data from {@code from} into {@code to}.
     *
     * The following properties are copied:
     * + isTrusted
     * + srcElement
     * + timeStamp
     * + type
     * @param from - The event to copy data from.
     * @param to - The event to copy data into.
     */
    protected copyData(from: FederatedEvent, to: FederatedEvent): void
    {
        to.isTrusted = from.isTrusted;
        to.srcElement = from.srcElement;
        to.timeStamp = performance.now();
        to.type = from.type;
        to.detail = from.detail;
        to.view = from.view;
        to.which = from.which;
        to.layer.copyFrom(from.layer);
        to.page.copyFrom(from.page);
    }

    /**
     * @param id - The pointer ID.
     * @returns The tracking data stored for the given pointer. If no data exists, a blank
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

    /**
     * Allocate a specific type of event from {@link EventBoundary#eventPool this.eventPool}.
     *
     * This allocation is constructor-agnostic, as long as it only takes one argument - this event
     * boundary.
     * @param constructor - The event's constructor.
     */
    protected allocateEvent<T extends FederatedEvent>(
        constructor: { new(boundary: EventBoundary): T }
    ): T
    {
        if (!this.eventPool.has(constructor as any))
        {
            this.eventPool.set(constructor as any, []);
        }

        const event = this.eventPool.get(constructor as any).pop() as T
            || new constructor(this);

        event.eventPhase = event.NONE;
        event.currentTarget = null;
        event.defaultPrevented = false;
        event.path = null;
        event.target = null;

        return event;
    }

    /**
     * Frees the event and puts it back into the event pool.
     *
     * It is illegal to reuse the event until it is allocated again, using `this.allocateEvent`.
     *
     * It is also advised that events not allocated from {@link EventBoundary#allocateEvent this.allocateEvent}
     * not be freed. This is because of the possibility that the same event is freed twice, which can cause
     * it to be allocated twice & result in overwriting.
     * @param event - The event to be freed.
     * @throws Error if the event is managed by another event boundary.
     */
    protected freeEvent<T extends FederatedEvent>(event: T): void
    {
        if (event.manager !== this) throw new Error('It is illegal to free an event not managed by this EventBoundary!');

        const constructor = event.constructor;

        if (!this.eventPool.has(constructor as any))
        {
            this.eventPool.set(constructor as any, []);
        }

        this.eventPool.get(constructor as any).push(event);
    }

    /**
     * Similar to {@link EventEmitter.emit}, except it stops if the `propagationImmediatelyStopped` flag
     * is set on the event.
     * @param e - The event to call each listener with.
     * @param type - The event key.
     */
    private _notifyListeners(e: FederatedEvent, type: string): void
    {
        const listeners = ((e.currentTarget as any)._events as EmitterListeners)[type];

        if (!listeners) return;

        if ('fn' in listeners)
        {
            if (listeners.once) e.currentTarget.removeListener(type, listeners.fn, undefined, true);
            listeners.fn.call(listeners.context, e);
        }
        else
        {
            for (
                let i = 0, j = listeners.length;
                i < j && !e.propagationImmediatelyStopped;
                i++)
            {
                if (listeners[i].once) e.currentTarget.removeListener(type, listeners[i].fn, undefined, true);
                listeners[i].fn.call(listeners[i].context, e);
            }
        }
    }
}
