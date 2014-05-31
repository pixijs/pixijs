/**
 * @author Dima Levchenko http://agile.in.ua/
 */

/**
 * Animates numeric properties of given object in given time.
 *
 * @class Tween
 * @constructor
 * @param target {Object} thing to animate,
 * @param time {Number} time for animation,
 * @param fntype {String} one of PIXI.Transitions.EASE_* values.
 */
PIXI.Tween = function(target, time, fn) {
  this._delay = 0;
  this.reset(target, time, fn);
};

/**
 * Resets the tween to its default values. Useful for pooling tweens.
 *
 * "scale" property is special for PIXI - it is animated as Point.
 *
 * @method reset
 * @param target {Object} thing to animate,
 * @param time {Number} time for animation,
 * @param fntype {String} one of PIXI.Transitions.EASE_* values.
 */
PIXI.Tween.prototype.reset = function(target, time, fn) {
  if(!fn) fn = PIXI.Transitions.LINEAR;

  this._target = target;

  this._currentTime = 0;
  this._totalTime = Math.max(1, time);
  this._progress = 0.0;

  /**
   * The amount of time to wait between repeat cycles (in millis).
   *
   * @property repeatDelay
   * @type Number
   */
  this.delay = this.repeatDelay = 0;

  /**
   * A function that will be called when the tween starts (after a possible delay).
   *
   * @property onStart
   * @type Function
   */

  /**
   * A function that will be called each time the tween is advanced.
   *
   * @property onUpdate
   * @type Function
   */

  /**
   * A function that will be called when the tween is complete.
   *
   * @property onComplete
   * @type Function
   */

  /**
   * A function that will be called each time the tween finishes one repetition (except the last, which will trigger
   * 'onComplete').
   *
   * @property onRepeat
   * @type Function
   */
  this.onStart = this.onUpdate = this.onComplete = this.onRepeat = null;

  /**
   * Indicates if the numeric values should be cast to Integers.
   *
   * @property roundToInt
   * @type Boolean
   */

  /**
   * Indicates if the tween should be reversed when it is repeating.
   *
   * @property reverse
   * @type Boolean
   */
  this.roundToInt = this.reverse = false;

  /**
   * The number of times the tween will be executed.
   *
   * @property repeatCount
   * @type Number
   */
  this.repeatCount = 1;

  this._currentCycle = -1;

  if(typeof fn == "string")
    this.transition = fn;
  else if (fn instanceof Function)
    this.transitionFunc = fn;
  else
    throw new Error("Transition must be either a string or a function");

  if(this._properties)  this._properties.length  = 0; else this._properties  = [];
  if(this._startValues) this._startValues.length = 0; else this._startValues = [];
  if(this._endValues)   this._endValues.length   = 0; else this._endValues   = [];

  return this;
};

/**
 * Animates the property of the target to a certain value.
 *
 * @method animate
 * @param property {String} parameter to animate,
 * @param endValue {Number} final value for property,
 */
PIXI.Tween.prototype.animate = function(property, endValue) {
  if(!this.target) return this;

  this._properties.push(property);
  this._startValues.push(NaN);
  this._endValues.push(endValue);
  return this;
};

/**
 * Animates the 'alpha' property of an object to a certain target value.
 *
 * @method fadeTo
 * @param alpha {Number} final value for alpha,
 */
PIXI.Tween.prototype.fadeTo = function(alpha) {
  this.animate("alpha", alpha);
  return this;
};

/**
 * The end value a certain property is animated to.
 *
 * @method getEndValue
 * @param property {String} property to check,
 * @return {Number} final value for property.
 */
PIXI.Tween.prototype.getEndValue = function(property) {
  var id = this._properties.indexOf(property);
  if(id < 0) throw new Error("The property '" + property + "' is not animated");
  return this._endValues[property];
};

/**
 * Animates the 'x' and 'y' properties of an object simultaneously.
 *
 * @method moveTo
 * @param x {Number} where to animate,
 * @param y {Number} where to animate.
 */
PIXI.Tween.prototype.moveTo = function(x, y) {
  this.animate("x", x);
  this.animate("y", y);
  return this;
};

/**
 * Animates the 'scaleX' and 'scaleY' properties of an object simultaneously.
 *
 * @method scaleTo
 * @param factor {Number} required scale.
 */
PIXI.Tween.prototype.scaleTo = function(factor) {
  this.animate("scale", factor);
  return this;
};

/**
 * Advance the time by a number of millis.
 *
 * @method advanceTime
 * @param time {Number} time to account.
 */
PIXI.Tween.prototype.advanceTime = function(time) {
  if(time == 0 || (this.repeatCount == 1 && this._currentTime == this._totalTime)) return false;

  var i;
  var previousTime = this._currentTime;
  var restTime = this._totalTime - this._currentTime;
  var carryOverTime = time > restTime ? time - restTime : 0;

  this._currentTime += time;

  if(this._currentTime <= 0)
    return false; // the delay is not over yet
  else if(this._currentTime > this._totalTime)
    this._currentTime = this._totalTime;

  if(this._currentCycle < 0 && previousTime <= 0 && this._currentTime > 0) {
    this._currentCycle++;
    if(this.onStart != null) this.onStart();
  }

  var ratio = this._currentTime / this.totalTime;
  var reversed = this.reverse && (this._currentCycle % 2 == 1);
  var numProperties = this._startValues.length;
  this._progress = reversed ? this._transitionFunc(1.0 - ratio) : this._transitionFunc(ratio);

  for(i = 0; i < numProperties; ++i) {
    if(this._startValues[i] != this._startValues[i]) {// isNaN check - "isNaN" causes allocation!
      if(this._properties[i] == "scale") {
        if(this._target.scale)
          this._startValues[i] = new PIXI.Point(this._target.scale.x, this._target.scale.y);
        else this._startValues[i] = new PIXI.Point(0, 0);
      } else
        this._startValues[i] = this._target[this._properties[i]];
    }

    var startValue = this._startValues[i];
    var endValue = this._endValues[i];
    if(this._properties[i] == "scale") {
      var dx = endValue.x - startValue.x;
      var cx = startValue.x + this._progress * dx;
      var dy = endValue.y - startValue.y;
      var cy = startValue.y + this._progress * dy;

      if(this.roundToInt) {
        cx = Math.round(cx);
        cy = Math.round(cy);
      }
      this._target.scale = new PIXI.Point(cx, cy);
    } else {
      var delta = endValue - startValue;
      var currentValue = startValue + this._progress * delta;

      if(this.roundToInt) currentValue = Math.round(currentValue);
      this._target[this._properties[i]] = currentValue;
    }
  }

  if(this.onUpdate) this.onUpdate();

  var isComplete = false;
  if(previousTime < this._totalTime && this._currentTime >= this._totalTime) {
    if(this.repeatCount == 0 || this.repeatCount > 1) {
      this._currentTime = -this.repeatDelay;
      this._currentCycle++;
      if(this.repeatCount > 1) this.repeatCount--;
      if(this.onRepeat) this.onRepeat();
    } else {
      isComplete = true;
      if(this.onComplete) this.onComplete(); // delay call???
    }
  }

  if(carryOverTime) return this.advanceTime(carryOverTime);
  return isComplete;
};

/**
 * Indicates if the tween is finished.
 *
 * @property cacheAsBitmap
 * @default false
 * @type Boolean
 */
Object.defineProperty(PIXI.Tween.prototype, "isComplete", {
  get: function() {
    return this.currentTime >= this.totalTime && this.repeatCount == 1;
  }
});

/**
 * The target object that is animated.
 *
 * @property target
 * @type Object
 */
Object.defineProperty(PIXI.Tween.prototype, "target", {
  get: function() {
    return this._target;
  }
});

/**
 * Use transition from standard.
 *
 * @property transition
 * @type String
 */
Object.defineProperty(PIXI.Tween.prototype, "transition", {
  get: function() {
    return  this._transition;
  },
  set: function(value) {
    this._transition = value;
    this._transitionFunc = PIXI.Transitions.getTransition(value);

    if(!this._transitionFunc) throw new Error("Invalid transiton: " + value);
  }
});

/**
 * Use custom function.
 *
 * @property transitionFunc
 * @type Function
 */
Object.defineProperty(PIXI.Tween.prototype, "transitionFunc", {
  get: function() {
    return this._transitionFunc;
  },
  set: function(value) {
    this._transition = "custom";
    this._transitionFunc = value;
  }
});

/**
 * The total time the tween will take per repetition (in millis).
 *
 * @property totalTime
 * @type Number
 */
Object.defineProperty(PIXI.Tween.prototype, "totalTime", {
  get: function() { return this._totalTime; }
});

/**
 * The time that has passed since the tween was created (in millis).
 *
 * @property currentTime
 * @type Number
 */
Object.defineProperty(PIXI.Tween.prototype, "currentTime", {
  get: function() { return this._currentTime; }
});

/**
 * The current progress between 0 and 1, as calculated by the transition function.
 *
 * @property progress
 * @type Number
 */
Object.defineProperty(PIXI.Tween.prototype, "progress", {
  get: function() { return this._progress; }
});

/**
 * The delay before the tween is started (in millis).
 *
 * @property delay
 * @type Number
 */
Object.defineProperty(PIXI.Tween.prototype, "delay", {
  get: function() { return this._delay; },
  set: function(value) {
    this._currentTime = this._currentTime + this._delay - value;
    this._delay = value;
  }
});

// Object.defineProperty(PIXI.Tween.prototype, "cacheAsBitmap", {
//   get: function() {
//   },
//   set: function(value) {
//   }
// });
