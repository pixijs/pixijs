/*!
 * @pixi/polyfill - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/polyfill is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { Polyfill } from 'es6-promise-polyfill';
import objectAssign from 'object-assign';

// Support for IE 9 - 11 which does not include Promises
if (!window.Promise) {
    window.Promise = Polyfill;
}

// References:
if (!Object.assign) {
    Object.assign = objectAssign;
}

// References:
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// https://gist.github.com/1579671
// http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
// https://gist.github.com/timhall/4078614
// https://github.com/Financial-Times/polyfill-service/tree/master/polyfills/requestAnimationFrame
// Expected to be used with Browserfiy
// Browserify automatically detects the use of `global` and passes the
// correct reference of `global`, `self`, and finally `window`
var ONE_FRAME_TIME = 16;
// Date.now
if (!(Date.now && Date.prototype.getTime)) {
    Date.now = function now() {
        return new Date().getTime();
    };
}
// performance.now
if (!(window.performance && window.performance.now)) {
    var startTime_1 = Date.now();
    if (!window.performance) {
        window.performance = {};
    }
    window.performance.now = function () { return Date.now() - startTime_1; };
}
// requestAnimationFrame
var lastTime = Date.now();
var vendors = ['ms', 'moz', 'webkit', 'o'];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    var p = vendors[x];
    window.requestAnimationFrame = window[p + "RequestAnimationFrame"];
    window.cancelAnimationFrame = window[p + "CancelAnimationFrame"]
        || window[p + "CancelRequestAnimationFrame"];
}
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
        if (typeof callback !== 'function') {
            throw new TypeError(callback + "is not a function");
        }
        var currentTime = Date.now();
        var delay = ONE_FRAME_TIME + lastTime - currentTime;
        if (delay < 0) {
            delay = 0;
        }
        lastTime = currentTime;
        return window.setTimeout(function () {
            lastTime = Date.now();
            callback(performance.now());
        }, delay);
    };
}
if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) { return clearTimeout(id); };
}

// References:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
if (!Math.sign) {
    Math.sign = function mathSign(x) {
        x = Number(x);
        if (x === 0 || isNaN(x)) {
            return x;
        }
        return x > 0 ? 1 : -1;
    };
}

// References:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
if (!Number.isInteger) {
    Number.isInteger = function numberIsInteger(value) {
        return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    };
}

if (!window.ArrayBuffer) {
    window.ArrayBuffer = Array;
}
if (!window.Float32Array) {
    window.Float32Array = Array;
}
if (!window.Uint32Array) {
    window.Uint32Array = Array;
}
if (!window.Uint16Array) {
    window.Uint16Array = Array;
}
if (!window.Uint8Array) {
    window.Uint8Array = Array;
}
if (!window.Int32Array) {
    window.Int32Array = Array;
}
//# sourceMappingURL=polyfill.es.js.map
