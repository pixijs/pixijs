/**
 * Helps IE run the fake timers. By defining global functions, IE allows
 * them to be overwritten at a later point. If these are not defined like
 * this, overwriting them will result in anything from an exception to browser
 * crash.
 *
 * If you don't require fake timers to work in IE, don't include this file.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
/*eslint-disable strict, no-inner-declarations, no-unused-vars*/
if (typeof window !== "undefined") {
    function setTimeout() {}
    function clearTimeout() {}
    function setImmediate() {}
    function clearImmediate() {}
    function setInterval() {}
    function clearInterval() {}
    function Date() {}

    // Reassign the original functions. Now their writable attribute
    // should be true. Hackish, I know, but it works.
    /*global sinon*/
    setTimeout = sinon.timers.setTimeout;
    clearTimeout = sinon.timers.clearTimeout;
    setImmediate = sinon.timers.setImmediate;
    clearImmediate = sinon.timers.clearImmediate;
    setInterval = sinon.timers.setInterval;
    clearInterval = sinon.timers.clearInterval;
    Date = sinon.timers.Date; // eslint-disable-line no-native-reassign
}
/*eslint-enable no-inner-declarations*/
