/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * @class TiltShiftFilter
 * @contructor
 */
PIXI.TiltShiftFilter = function()
{
    this.tiltShiftXFilter = new PIXI.TiltShiftXFilter();
    this.tiltShiftYFilter = new PIXI.TiltShiftYFilter();
    this.tiltShiftXFilter.updateDelta();
    this.tiltShiftXFilter.updateDelta();

    this.passes = [this.tiltShiftXFilter, this.tiltShiftYFilter];
};

Object.defineProperty(PIXI.TiltShiftFilter.prototype, 'blur', {
    get: function() {
        return this.tiltShiftXFilter.blur;
    },
    set: function(value) {
        this.tiltShiftXFilter.blur = this.tiltShiftYFilter.blur = value;
    }
});

Object.defineProperty(PIXI.TiltShiftFilter.prototype, 'gradientBlur', {
    get: function() {
        return this.tiltShiftXFilter.gradientBlur;
    },
    set: function(value) {
        this.tiltShiftXFilter.gradientBlur = this.tiltShiftYFilter.gradientBlur = value;
    }
});
Object.defineProperty(PIXI.TiltShiftFilter.prototype, 'start', {
    get: function() {
        return this.tiltShiftXFilter.start;
    },
    set: function(value) {
        this.tiltShiftXFilter.start = this.tiltShiftYFilter.start = value;
    }
});
Object.defineProperty(PIXI.TiltShiftFilter.prototype, 'end', {
    get: function() {
        return this.tiltShiftXFilter.end;
    },
    set: function(value) {
        this.tiltShiftXFilter.end = this.tiltShiftYFilter.end = value;
    }
});