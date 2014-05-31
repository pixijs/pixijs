/**
 * @author Dima Levchenko http://agile.in.ua/
 */

/**
 * Juggler takes care of animations' related routes. It allows you to declare animations, and control theis' life.
 * Jugglers can be nested. This allows you to disable one of them - and all the related animations will stop as well.
 * Animatable interface is core concept in all the juggler- and tween-related code. You should implement
 *   advanceTime(int) to be compliant.
 *
 * @class Juggler
 * @constructor
 */
PIXI.Juggler = function() {
  /**
   * Total life time of juggler in milliseconds.
   *
   * @property elapsedTime
   * @type Number
   */
  this.elapsedTime = 0;

  /**
   * List of objects that are currently being animated.
   *
   * @property objects
   * @type Array
   */
  this.objects = [];
}

/**
 * Add another animatable object into line for animation.
 *
 * @method add
 * @param obj {Object} animatable object to maintain.
 * @return {Boolean} if objects array changed. e.g. if object was added to line.
 */
PIXI.Juggler.prototype.add = function(obj) {
  if(obj && this.objects.indexOf(obj) < 0) {
    this.objects.push(obj);
    // we can listen to events somehow to handle remove
  }
};

/**
 * Remove animatable object from line for animation.
 *
 * @method remove
 * @param obj {Object} animatable object to remove.
 * @return {Boolean} if objects array changed. e.g. if object was really present in line.
 */
PIXI.Juggler.prototype.remove = function(obj) {
  if(obj) {
    var ind = this.objects.indexOf(obj);
    if(ind >= 0) {
      // if we listen to events, we should remove listener first!
      this.objects[ind] = null;
    }
  }
};

/**
 * Check if object is animated in this juggler.
 *
 * @method contains
 * @param obj {Object} object to check.
 * @return {Boolean} if object is animated in this juggler.
 */
PIXI.Juggler.prototype.contains = function(obj) {
  return (obj && this.objects.indexOf(obj) >= 0);
};

/**
 * Create tween for given object.
 *
 * @method tween
 * @param obj {Object} target for tween,
 * @param time {Number} time in millis for this tween,
 * @param props {Object} details of transition.
 * @return {Tween} tween, created for this object.
 */
PIXI.Juggler.prototype.tween = function(obj, time, props) {
  var t = new PIXI.Tween(obj, time, props["transition"]);
  if(props.hasOwnProperty("delay")) t.delay = props.delay;
  if(props.hasOwnProperty("repeatCount")) t.repeatCount = props.repeatCount;
  if(props.hasOwnProperty("reverse")) t.reverse = props.reverse;
  var exceptions = ["delay", "transition", "repeatCount", "reverse"];
  for(var prop in props) {
    if(!props.hasOwnProperty(prop)) continue;
    if(exceptions.indexOf(prop) >= 0) continue;
    t.animate(prop, props[prop]);
  }
  this.add(t);
  return t;
};

/**
 * Remove all tweens associated with this target
 *
 * @method removeTweens
 * @param target {Object} target of tweens, which should be removed.
 * @return {Boolean} if there were any tweens animating given target.
 */
PIXI.Juggler.prototype.removeTweens = function(target) {
};

/**
 * Checks, if there are tweens working with given target object.
 *
 * @param target {Object} tweened object.
 * @return {Boolean} if there is any tween working with given target.
 */
PIXI.Juggler.prototype.containsTweens = function(target) {
};

/**
 * Remove all tweens.
 *
 * @method purge
 */
PIXI.Juggler.prototype.purge = function() {
  // this method should remove listeners from objects, which can be listened. for now, we can just:
  this.objects = [];
  return this;
};

/**
 * Calls function after given delay. Compared to setTimeout(Function, Number), Juggler accounts time respecting
 * advanceTime(Number) calls, so, if you will pause, or stop this juggler - call will be exacuted later.
 *
 * @method delayCall
 * @param f {Function} function to execute after given time. Use bind tecnique to set function context and parameters.
 * @param delay {Number} delay in millis.
 * @return {Animatable} Encapsulation of given delay.
 */
PIXI.Juggler.prototype.delayCall = function(f, delay) {
};

/**
 * Repeatedly calls function with given intercals. Compared to setTimeout(Function, Number), Juggler accounts time
 * respecting advanceTime(Number) calls, so, if you will pause, or stop this juggler - call will be exacuted later.
 *
 * @method @repeatCall
 * @param f {Function} function to execute. Use bind tecnique to set function context and parameters.
 * @param interval {Number} interval in millis.
 * @return {Animatable} Encapsulation of given repeated call.
 */
PIXI.Juggler.prototype.repeatCall = function(f, interval, repeatCount) {
};

/**
 * Inform juggler about time elapsed.
 *
 * @param time {int} time elapsed.
 */
PIXI.Juggler.prototype.advanceTime = function(time) {
  var il = this.objects.length, currentIndex = 0;
  this.elapsedTime += time;
  if(il == 0) return;
  for(var i = 0; i < il; ++i) {
    var object = this.objects[i];
    if(object) {
      // next two lines is work-around - if advancetime returns false - we decide it should be removed!
      if(object.advanceTime(time))
        this.objects[i] = null;
      if(currentIndex != i) {
        this.objects[currentIndex] = object;
        this.objects[i] = null;
      }
      ++currentIndex;
    }
  }
  if(currentIndex != i) {
    var numObjects = this.objects.length;
    while(i < numObjects)
      this.objects[currentIndex++] = this.objects[i++];
    this.objects.length = currentIndex;
  }
};
