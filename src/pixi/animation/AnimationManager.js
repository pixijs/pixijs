/**
 * @author Dima Levchenko http://agile.in.ua/
 */

/**
 * AnimationManager takes care of animations' related routes. It allows you to declare animations, and control theis'
 * life.
 *
 * AnimationManagers can be nested. This allows you to disable some of them - and all the related animations will stop
 * as well.
 *
 * Animatable interface is core concept in all the animationManager-, delayed call- and tween-related code. You should
 * implement advanceTime(Number) to be compliant.
 *
 * Maintenance example:
 *
 *     var bunny = summonBunny(); // suppose, you have a bunny
 *
 *     // Usually, you would want to create so-called root animationManager, all other, realm-related animationManagers,
 *     // should be added to this one animationManager.
 *     var a = new PIXI.AnimationManager();
 *     // we can use time for animation control
 *     var time = new Date().getTime();
 *
 *     function animate() {
 *         var newTime = new Date().getTime();
 *         // we pass time as-is. some times smaller shards of time would be preferred, or you might decide to limit
 *         // time delta on upper limit.
 *         a.advanceTime(newTime - time);
 *         time = newTime;
 *
 *         renderer.render(stage);
 *         requestAnimFrame(animate);
 *     }
 *
 * See tween, delayCall and repeatCall for examples of animationManager usage.
 *
 * @class AnimationManager
 * @constructor
 */
PIXI.AnimationManager = function() {
    this.removeEvent = this.removeEvent.bind(this);

    /**
     * List of objects that are currently being animated.
     *
     * @property objects
     * @type Array
     */
    this.objects = [];
};

PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER =
    "PIXI.animation.AnimationManager.events.remove-from-animationManager";

/**
 * Add another animatable object into line for animation.
 *
 * @method add
 * @param obj {Object} animatable object to maintain.
 * @return {Boolean} if objects array changed. e.g. if object was added to line.
 */
PIXI.AnimationManager.prototype.add = function(obj) {
    if(obj && this.objects.indexOf(obj) < 0) {
        this.objects.push(obj);
        if(obj.addEventListener)
            obj.addEventListener(PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER, this.removeEvent);
    }
};

/**
 * Remove animatable object from line for animation.
 *
 * @method remove
 * @param obj {Object} animatable object to remove.
 * @return {Boolean} if objects array changed. e.g. if object was really present in line.
 */
PIXI.AnimationManager.prototype.remove = function(obj) {
    if(obj) {
        var ind = this.objects.indexOf(obj);
        if(ind >= 0) {
            if(this.objects[ind].removeEventListener)
                this.objects[ind].removeEventListener(PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER,
                                                      this.removeEvent);
            this.objects[ind] = null;
        }
    }
};

/**
 * Remove animatable object from line for animation by dispatched event.
 *
 * @method removeEvent
 * @param event {Object} event object with.
 */
PIXI.AnimationManager.prototype.removeEvent = function(event) {
    if(event && event.target) this.remove(event.target);
};

/**
 * Check if object is animated in this animationManager.
 *
 * @method contains
 * @param obj {Object} object to check.
 * @return {Boolean} if object is animated in this animationManager.
 */
PIXI.AnimationManager.prototype.contains = function(obj) {
    return (obj && this.objects.indexOf(obj) >= 0);
};

/**
 * Create tween for given object. Utilizes a tween to animate the target object over time millis. This method provides
 * a convenient alternative for creating and adding a tween manually.
 *
 * Fill 'properties' with key-value pairs that describe both the tween and the animation target. Here is an example:
 *
 *     animationManager.tween(object, 2000, {
 *         transition: Transitions.EASE_IN_OUT,
 *         delay: 20000, // -> tween.delay = 20000
 *         x: 50         // -> tween.animate("x", 50)
 *     });
 *
 *
 * To cancel the tween, call 'AnimationManager.removeTweens' with the same target, or pass the returned PIXI.Tween
 * instance to 'AnimationManager.remove()'.
 *
 * @method tween
 * @param obj {Object} target for tween,
 * @param time {Number} time in millis for this tween,
 * @param props {Object} details of transition.
 * @return {Tween} tween, created for this object.
 */
PIXI.AnimationManager.prototype.tween = function(obj, time, props) {
    var t = PIXI.Tween.fromPool(obj, time, props.transition);

    if(props.delay) t.delay = props.delay;
    if(props.repeatCount) t.repeatCount = props.repeatCount;
    if(props.reverse) t.reverse = props.reverse;

    var exceptions = ["delay", "transition", "repeatCount", "reverse"];
    for(var prop in props) {
        if(!props.hasOwnProperty(prop)) continue;
        if(exceptions.indexOf(prop) >= 0) continue;
        t.animate(prop, props[prop]);
    }

    this.add(t);
    t.addEventListener(PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER, this.removePooledTween);

    return t;
};

PIXI.AnimationManager.prototype.removePooledTween = function(event) {
    PIXI.Tween.toPool(event.target);
};

/**
 * Removes all tweens with a certain target.
 *
 * @method removeTweens
 * @param target {Object} target of tweens, which should be removed.
 * @return {Boolean} if there were any tweens animating given target.
 */
PIXI.AnimationManager.prototype.removeTweens = function(target) {
    if(target === null) return false;

    var anyFound = false;
    for(var i = this.objects.length - 1; i >= 0; --i) {
        var tween = this.objects[i];
        if(tween instanceof PIXI.Tween && tween.target === target) {
            anyFound = true;
            tween.removeEventListener(PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER, this.removeEvent);
            this.objects[i] = null;
        }
    }
    return anyFound;
};

/**
 * Checks, if there are tweens working with given target object.
 *
 * @method containsTweens
 * @param target {Object} tweened object.
 * @return {Boolean} if there is any tween working with given target.
 */
/*jshint unused: false*/
PIXI.AnimationManager.prototype.containsTweens = function(target) {
    if (target === null) return false;

    for(var i = this.objects.length - 1; i >= 0; --i) {
        var tween = this.objects[i];
        if (tween instanceof PIXI.Tween && tween.target === target) return true;
    }

    return false;
};

/**
 * Remove all tweens.
 *
 * @method purge
 */
PIXI.AnimationManager.prototype.purge = function() {
    // this method should remove listeners from objects, which can be listened. for now, we can just:
    for(var i = this.objects.length - 1; --i; i >= 0) {
        if(this.objects[i].removeEventListener)
            this.objects[i].removeEventListener(
                PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER, this.removeEvent);
    }
    this.objects.length = 0;
    return this;
};

/**
 * Calls function after given delay. Compared to setTimeout(Function, Number), AnimationManager accounts time respecting
 * advanceTime(Number) calls, so, if you will pause, or stop this animationManager - call will be exacuted later.
 *
 * @method delayCall
 * @param f {Function} function to execute after given time. Use bind tecnique to set function context and parameters.
 * @param delay {Number} delay in millis.
 * @return {Animatable} Encapsulation of given delay.
 */
PIXI.AnimationManager.prototype.delayCall = function(f, delay) {
    if(null === f) return null;

    var d = PIXI.DelayedCall.fromPool(f, delay);
    this.add(d);
    d.addEventListener(PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER, this.removePooledDelayedCall);

    return d;
};

PIXI.AnimationManager.prototype.removePooledDelayedCall = function(event) {
    PIXI.DelayedCall.toPool(event.target);
};

/**
 * Repeatedly calls function with given intercals. Compared to setTimeout(Function, Number), AnimationManager accounts
 * time respecting advanceTime(Number) calls, so, if you will pause, or stop this animationManager - call will be
 * exacuted later.
 *
 * @method repeatCall
 * @param fn {Function} function to execute. Use bind tecnique to set function context and parameters.
 * @param interval {Number} interval in millis.
 * @return {Animatable} Encapsulation of given repeated call.
 */
PIXI.AnimationManager.prototype.repeatCall = function(fn, interval, repeatCount) {
    if(null === fn) return null;

    var d = PIXI.DelayedCall.fromPool(fn, interval);
    d.repeatCount = repeatCount;
    d.addEventListener(PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER, this.removePooledDelayedCall);
    this.add(d);

    return d;
};

/**
 * Inform animationManager about time elapsed.
 *
 * @param time {int} time elapsed.
 */
PIXI.AnimationManager.prototype.advanceTime = function(time) {
    var il = this.objects.length, currentIndex = 0;
    if(il === 0) return;
    for(var i = 0; i < il; ++i) {
        var object = this.objects[i];
        if(object) {
            if(currentIndex !== i) {
                this.objects[currentIndex] = object;
                this.objects[i] = null;
            }
            object.advanceTime(time);
            ++currentIndex;
        }
    }
    if(currentIndex !== i) {
        var numObjects = this.objects.length;
        while(i < numObjects)
            this.objects[currentIndex++] = this.objects[i++];
        this.objects.length = currentIndex;
    }
};
