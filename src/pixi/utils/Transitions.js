/**
 * @author Dima Levchenko http://agile.in.ua/
 */

/**
 * 
 *
 * @class Transitions
 * @constructor
 */
PIXI.Transitions = {
  LINEAR: "linear",
  EASE_SIN: "easeSin",
  EASE_COS: "easeCos",
  EASE_IN: "easeIn",
  EASE_OUT: "easeOut",
  EASE_IN_OUT: "easeInOut",
  EASE_OUT_IN: "easeOutIn",
  EASE_IN_BACK: "easeInBack",
  EASE_OUT_BACK: "easeOutBack",
  EASE_IN_OUT_BACK: "easeInOutBack",
  EASE_OUT_IN_BACK: "easeOutInBack",
  EASE_IN_ELASTIC: "easeInElastic",
  EASE_OUT_ELASTIC: "easeOutElastic",
  EASE_IN_OUT_ELASTIC: "easeInOutElastic",
  EASE_OUT_IN_ELASTIC: "easeOutInElastic",
  EASE_IN_BOUNCE: "easeInBounce",
  EASE_OUT_BOUNCE: "easeOutBounce",
  EASE_IN_OUT_BOUNCE: "easeInOutBounce",
  EASE_OUT_IN_BOUNCE: "easeOutInBounce",

  map: null,

  getTransition: function(name) {
    if(null == PIXI.Transitions.map) PIXI.Transitions.registerDefaults();
    return PIXI.Transitions.map[name];
  },

  register: function(name, fn) {
    if(null == PIXI.Transitions.map) PIXI.Transitions.registerDefaults();
    PIXI.Transitions.map[name] = fn;
  },

  registerDefaults: function() {
    PIXI.Transitions.map = {};
    PIXI.Transitions.register(PIXI.Transitions.LINEAR,              PIXI.Transitions.linear);
    PIXI.Transitions.register(PIXI.Transitions.EASE_SIN,            PIXI.Transitions.easeSin);
    PIXI.Transitions.register(PIXI.Transitions.EASE_COS,            PIXI.Transitions.easeCos);
    PIXI.Transitions.register(PIXI.Transitions.EASE_IN,             PIXI.Transitions.easeIn);
    PIXI.Transitions.register(PIXI.Transitions.EASE_OUT,            PIXI.Transitions.easeOut);
    PIXI.Transitions.register(PIXI.Transitions.EASE_IN_OUT,         PIXI.Transitions.easeInOut);
    PIXI.Transitions.register(PIXI.Transitions.EASE_OUT_IN,         PIXI.Transitions.easeOutIn);
    PIXI.Transitions.register(PIXI.Transitions.EASE_IN_BACK,        PIXI.Transitions.easeInBack);
    PIXI.Transitions.register(PIXI.Transitions.EASE_OUT_BACK,       PIXI.Transitions.easeOutBack);
    PIXI.Transitions.register(PIXI.Transitions.EASE_IN_OUT_BACK,    PIXI.Transitions.easeInOutBack);
    PIXI.Transitions.register(PIXI.Transitions.EASE_OUT_IN_BACK,    PIXI.Transitions.easeOutInBack);
    PIXI.Transitions.register(PIXI.Transitions.EASE_IN_ELASTIC,     PIXI.Transitions.easeInElastic);
    PIXI.Transitions.register(PIXI.Transitions.EASE_OUT_ELASTIC,    PIXI.Transitions.easeOutElastic);
    PIXI.Transitions.register(PIXI.Transitions.EASE_IN_OUT_ELASTIC, PIXI.Transitions.easeInOutElastic);
    PIXI.Transitions.register(PIXI.Transitions.EASE_OUT_IN_ELASTIC, PIXI.Transitions.easeOutInElastic);
    PIXI.Transitions.register(PIXI.Transitions.EASE_IN_BOUNCE,      PIXI.Transitions.easeInBounce);
    PIXI.Transitions.register(PIXI.Transitions.EASE_OUT_BOUNCE,     PIXI.Transitions.easeOutBounce);
    PIXI.Transitions.register(PIXI.Transitions.EASE_IN_OUT_BOUNCE,  PIXI.Transitions.easeInOutBounce);
    PIXI.Transitions.register(PIXI.Transitions.EASE_OUT_IN_BOUNCE,  PIXI.Transitions.easeOutInBounce);
  },

  linear: function(ratio) { return ratio; },

  easeSin: function(ratio) { return Math.sin(ratio * Math.PI); },

  easeCos: function(ratio) { return Math.cos(ratio * Math.PI); },

  easeIn: function(ratio) { return ratio * ratio * ratio; },

  easeOut: function(ratio) {
    var invRatio = ratio - 1.0;
    return invRatio * invRatio * invRatio + 1;
  },

  easeInOut: function(ratio) {
    return PIXI.Transitions.easeCombined(PIXI.Transitions.easeIn, PIXI.Transitions.easeOut, ratio);
  },

  easeOutIn: function(ratio) {
    return PIXI.Transitions.easeCombined(PIXI.Transitions.easeOut, PIXI.Transitions.easeIn, ratio);
  },

  easeInBack: function(ratio) {
    var s = 1.70158;
    return Math.pow(ratio, 2) * ((s + 1.0) * ratio - s);
  },

  easeOutBack: function(ratio) {
    var invRatio = ratio - 1.0;
    var s = 1.70158;
    return Math.pow(invRatio, 2) * ((s + 1.0) * invRatio + s) + 1.0;
  },

  easeInOutBack: function(ratio) {
    return PIXI.Transitions.easeCombined(PIXI.Transitions.easeInBack, PIXI.Transitions.easeOutBack, ratio);
  },

  easeOutInBack: function(ratio) {
    return PIXI.Transitions.easeCombined(PIXI.Transitions.easeOutBack, PIXI.Transitions.easeInBack, ratio);
  },

  easeInElastic: function(ratio) {
    if(ratio == 0 || ratio == 1) return ratio;
    var p = 0.3;
    var s = p / 4.0;
    var invRatio = ratio - 1;
    return -1.0 * Math.pow(2.0, 10.0 * invRatio) * Math.sin((invRatio - s)*(2.0 * Math.PI) / p);
  },

  easeOutElastic: function(ratio) {
    if(ratio == 0 || ratio == 1) return ratio;
    var p = 0.3;
    var s = p / 4.0;
    return Math.pow(2.0, -10.0 * ratio) * Math.sin((ratio - s)*(2.0 * Math.PI) / p) + 1;
  },

  easeInOutElastic: function(ratio) {
    return PIXI.Transitions.easeCombined(PIXI.Transitions.easeInElastic, PIXI.Transitions.easeOutElastic, ratio);
  },

  easeOutInElastic: function(ratio) {
    return PIXI.Transitions.easeCombined(PIXI.Transitions.easeOutElastic, PIXI.Transitions.easeInElastic, ratio);
  },

  easeInBounce: function(ratio) {
    return 1.0 - PIXI.Transitions.easeOutBounce(1.0 - ratio);
  },

  easeOutBounce: function(ratio) {
    var l, p = 2.75, s = 7.5625;
    if (ratio < (1.0/p)) l = s * Math.pow(ratio, 2);
    else {
      if (ratio < (2.0/p)) {
        ratio -= 1.5/p;
        l = s * Math.pow(ratio, 2) + 0.75;
      } else {
        if (ratio < 2.5/p) {
          ratio -= 2.25/p;
          l = s * Math.pow(ratio, 2) + 0.9375;
        } else {
          ratio -= 2.625/p;
          l =  s * Math.pow(ratio, 2) + 0.984375;
        }
      }
    }
    return l;
  },

  easeInOutBounce: function(ratio) {
    return PIXI.Transitions.easeCombined(PIXI.Transitions.easeInBounce, PIXI.Transitions.easeOutBounce, ratio);
  },

  easeOutInBounce: function(ratio) {
    return PIXI.Transitions.easeCombined(PIXI.Transitions.easeOutBounce, PIXI.Transitions.easeInBounce, ratio);
  },

  easeCombined: function(startFunc, endFunc, ratio) {
    if (ratio < 0.5) return 0.5 * startFunc(ratio*2.0);
    else             return 0.5 * endFunc((ratio-0.5)*2.0) + 0.5;
  }
};
