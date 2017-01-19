/**
 * Helps IE run the fake XMLHttpRequest. By defining global functions, IE allows
 * them to be overwritten at a later point. If these are not defined like
 * this, overwriting them will result in anything from an exception to browser
 * crash.
 *
 * If you don't require fake XHR to work in IE, don't include this file.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
/*eslint-disable strict*/
if (typeof window !== "undefined") {
    function XMLHttpRequest() {} // eslint-disable-line no-unused-vars, no-inner-declarations

    // Reassign the original function. Now its writable attribute
    // should be true. Hackish, I know, but it works.
    /*global sinon*/
    XMLHttpRequest = sinon.xhr.XMLHttpRequest || undefined;
}
/*eslint-enable strict*/
