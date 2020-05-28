// References:
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// https://gist.github.com/1579671
// http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
// https://gist.github.com/timhall/4078614
// https://github.com/Financial-Times/polyfill-service/tree/master/polyfills/requestAnimationFrame

// Expected to be used with Browserfiy
// Browserify automatically detects the use of `global` and passes the
// correct reference of `global`, `self`, and finally `window`

const ONE_FRAME_TIME = 16;

// Date.now
if (!(Date.now && Date.prototype.getTime))
{
    Date.now = function now(): number
    {
        return new Date().getTime();
    };
}

// performance.now
if (!(global.performance && global.performance.now))
{
    const startTime = Date.now();

    if (!global.performance)
    {
        global.performance = {};
    }

    global.performance.now = (): number => Date.now() - startTime;
}

// requestAnimationFrame
let lastTime = Date.now();
const vendors = ['ms', 'moz', 'webkit', 'o'];

for (let x = 0; x < vendors.length && !global.requestAnimationFrame; ++x)
{
    const p = vendors[x];

    global.requestAnimationFrame = (global as any)[`${p}RequestAnimationFrame`];
    global.cancelAnimationFrame = (global as any)[`${p}CancelAnimationFrame`]
        || (global as any)[`${p}CancelRequestAnimationFrame`];
}

if (!global.requestAnimationFrame)
{
    global.requestAnimationFrame = (callback: (...parms: any[]) => void): NodeJS.Timeout =>
    {
        if (typeof callback !== 'function')
        {
            throw new TypeError(`${callback}is not a function`);
        }

        const currentTime = Date.now();
        let delay = ONE_FRAME_TIME + lastTime - currentTime;

        if (delay < 0)
        {
            delay = 0;
        }

        lastTime = currentTime;

        return setTimeout(() =>
        {
            lastTime = Date.now();
            callback(performance.now());
        }, delay);
    };
}

if (!global.cancelAnimationFrame)
{
    global.cancelAnimationFrame = (id: number): void => clearTimeout(id);
}
