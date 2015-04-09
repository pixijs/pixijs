var EventEmitter = require('eventemitter3').EventEmitter;

/**
 * A Ticker class that runs an update loop that other objects listen to
 *
 * @class
 * @memberof PIXI.extras
 */
var Ticker = function()
{
    EventEmitter.call(this);

    this.updateBind = this.update.bind(this);

    /**
     * Whether or not this ticker runs
     *
     * @member {boolean}
     */
    this.active = false;

    /**
     * The deltaTime
     *
     * @member {number}
     */
    this.deltaTime = 1;

    /**
     * The time between two frames
     *
     * @member {number}
     */
    this.timeElapsed = 0;

    /**
     * The time at the last frame
     *
     * @member {number}
     */
    this.lastTime = 0;

    /**
     * The speed
     *
     * @member {number}
     */
    this.speed = 1;

    // auto start ticking!
    this.start();
};

Ticker.prototype = Object.create(EventEmitter.prototype);
Ticker.prototype.constructor = Ticker;

/**
 * Starts the ticker, automatically called by the constructor
 *
 */
Ticker.prototype.start = function()
{
    if(this.active)
    {
        return;
    }

    this.active = true;
    requestAnimationFrame(this.updateBind);
};

/**
 * Stops the ticker
 *
 */
Ticker.prototype.stop = function()
{
    if(!this.active)
    {
        return;
    }

    this.active = false;
};

/**
 * The update loop, fires the 'tick' event
 *
 */
Ticker.prototype.update = function()
{
    if(this.active)
    {
        requestAnimationFrame(this.updateBind);

        var currentTime = new Date().getTime();
        var timeElapsed = currentTime - this.lastTime;

        // cap the time!
        if(timeElapsed > 100)
        {
            timeElapsed = 100;
        }

        this.deltaTime = (timeElapsed * 0.06);

        this.deltaTime *= this.speed;

        this.emit('tick', this.deltaTime);

        this.lastTime = currentTime;
    }

};

module.exports = new Ticker();
