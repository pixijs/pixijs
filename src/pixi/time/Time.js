/**
 * @author Mikko Haapoja http://mikkoh.com/ @MikkoH
 */

/**
Time is a static class that can be used to ensure that items update independent of framerate. Movieclip's
framerate will be capped by the timeScale property which is updated during every render call.

@class Time
@static
**/
PIXI.Time = {

/**
 * is the update scale based on the target framerate. So for example if you're expecting something
 * doing something like x += 10 per frame at 60fps. You can do this: x += 10 * PIXI.Time.timeScale
 * to ensure that you're moving at a constant rate regardless of framerate. This property is updated
 * everytime the render function of the renderers is called.
 *
 * @property timeScale
 * @type Number
 * @default 1
 */
	timeScale: 1,

	_tFrameRate: 60,
	_minFrameRate: 12,
	_tMilli: 1000 / 60,
	_minMilli: 1000 / 12,
	_prevMilli: Date.now(),
	
//This is the setter function for the targetFrameRate
	setTargetFrameRate: function( framerate ) {

		this._tFrameRate = framerate;
		this._tMilli = 1000 / framerate;
	},

//This is the getter function for the targetFrameRate
	getTargetFrameRate: function() {

		return this._tFrameRate;
	},

//This is the setter function for the minFrameRate
	setMinFrameRate: function( framerate ) {

		if( framerate > this._tFrameRate ) {

			throw 'Your target minimum framerate must be smaller than your target framerate: ' + this._tFrameRate;
		} else {

			this._minFrameRate = framerate;
			this._minMilli = 1000 / framerate;
		}
	},

//This is the getter function for the minFrameRate
	getMinFrameRate: function() {

		return this._minFrameRate;
	},

//This is the update function which will get called by the renderers
	update: function() {

		var curMilli = Date.now();
		var milliDif = curMilli - this._prevMilli;

		if( milliDif > this._minMilli ) {

			milliDif = this._minMilli;
		}

		this.timeScale = milliDif / this._tMilli;

		this._prevMilli = curMilli;
	}
};

/**
 * Indicates the target frame rate for all MovieClip animations.
 *
 * @property targetFrameRate
 * @type Number
 * @default 60
 */
Object.defineProperty( PIXI.Time, 'targetFrameRate', {

	get: PIXI.Time.getTargetFrameRate,
	set: PIXI.Time.setTargetFrameRate
});

/**
 * Indicates the minimum frame rate for all MovieClip animations. If for some reason the framerate drops very low
 * the frame rate of animations will be capped to update at 12 fps. As a note this property is mostly used to
 * cap the next update if render() has not been called for a long time.
 *
 * @property minFrameRate
 * @type Number
 * @default 12
 */
Object.defineProperty( PIXI.Time, 'minFrameRate', {

	get: PIXI.Time.getMinFrameRate,
	set: PIXI.Time.setMinFrameRate
});