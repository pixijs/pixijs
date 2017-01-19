/**
 * Sinon.JS 1.17.7, 2016/12/31
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @author Contributors: https://github.com/cjohansen/Sinon.JS/blob/master/AUTHORS
 *
 * (The BSD License)
 * 
 * Copyright (c) 2010-2014, Christian Johansen, christian@cjohansen.no
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *     * Neither the name of Christian Johansen nor the names of his contributors
 *       may be used to endorse or promote products derived from this software
 *       without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
/**
 * Helps IE run the fake XDomainRequest. By defining global functions, IE allows
 * them to be overwritten at a later point. If these are not defined like
 * this, overwriting them will result in anything from an exception to browser
 * crash.
 *
 * If you don't require fake XDR to work in IE, don't include this file.
 */
/*eslint-disable strict*/
if (typeof window !== "undefined") {
    function XDomainRequest() {} // eslint-disable-line no-unused-vars, no-inner-declarations

    // Reassign the original function. Now its writable attribute
    // should be true. Hackish, I know, but it works.
    /*global sinon*/
    XDomainRequest = sinon.xdr.XDomainRequest || undefined;
}
/*eslint-enable strict*/
