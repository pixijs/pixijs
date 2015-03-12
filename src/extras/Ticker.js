var eventTarget = require('../core/utils/eventTarget'),
    EventData   = require('../core/utils/EventData');

/**
 * A Ticker class that runs an update loop that other objects listen to
 *
 * @class
 * @memberof PIXI.extras
 */
var Ticker = function()
{
    this.updateBind = this.update.bind(this);

    /**
     * Whether or not this ticker runs
     *
     * @member {boolean}
     */
    this.active = false;

    /**
     * the event data for this ticker to dispatch the tick event
     *
     * @member {EventData}
     */
    this.eventData = new EventData( this, 'tick', { deltaTime:1 } );

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

eventTarget.mixin(Ticker.prototype);

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

        this.eventData.data.deltaTime = this.deltaTime;

        this.emit( 'tick', this.eventData );

        this.lastTime = currentTime;
    }

};

module.exports = new Ticker();
