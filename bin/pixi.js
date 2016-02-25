/**
 * @license
 * pixi.js - v3.0.10
 * Compiled 2016-02-25T20:39:20.286Z
 *
 * pixi.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 *
 *
 * The MIT License
 * 
 * Copyright (c) 2013-2015 Mathew Groves
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * 
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PIXI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (typeof arguments[1] === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var hasError = false;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            if (hasError) return;
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    hasError = true;

                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback.apply(null, [null].concat(args));
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while(!q.paused && workers < q.concurrency && q.tasks.length){

                    var tasks = q.payload ?
                        q.tasks.splice(0, q.payload) :
                        q.tasks.splice(0, q.tasks.length);

                    var data = _map(tasks, function (task) {
                        return task.data;
                    });

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);
                    var cb = only_once(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        var has = Object.prototype.hasOwnProperty;
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (has.call(memo, key)) {   
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (has.call(queues, key)) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":3}],2:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.0 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],7:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":5,"./encode":6}],8:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":4,"querystring":7}],9:[function(require,module,exports){
'use strict';

module.exports = earcut;

function earcut(data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = linkedList(data, 0, outerLen, dim, true),
        triangles = [];

    if (!outerNode) return triangles;

    var minX, minY, maxX, maxY, x, y, size;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and size are later used to transform coords into integers for z-order calculation
        size = Math.max(maxX - minX, maxY - minY);
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, size);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(data, start, end, dim, clockwise) {
    var sum = 0,
        i, j, last;

    // calculate original winding order of a polygon ring
    for (i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }

    // link points into circular doubly-linked list in the specified winding order
    if (clockwise === (sum > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) return null;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, dim, minX, minY, size, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && size) indexCurve(ear, minX, minY, size);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (size ? isEarHashed(ear, minX, minY, size) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);

            removeNode(ear);

            // skipping the next vertice leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, size, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(ear, triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, size, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, size);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next;

    while (p !== ear.prev) {
        if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

function isEarHashed(ear, minX, minY, size) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x),
        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y),
        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x),
        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(minTX, minTY, minX, minY, size),
        maxZ = zOrder(maxTX, maxTY, minX, minY, size);

    // first look for points inside the triangle in increasing z-order
    var p = ear.nextZ;

    while (p && p.z <= maxZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.nextZ;
    }

    // then look for points in decreasing z-order
    p = ear.prevZ;

    while (p && p.z >= minZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        // a self-intersection where edge (v[i-1],v[i]) intersects (v[i+1],v[i+2])
        if (intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

            triangles.push(a.i / dim);
            triangles.push(p.i / dim);
            triangles.push(b.i / dim);

            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return p;
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, dim, minX, minY, size) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, dim, minX, minY, size);
                earcutLinked(c, triangles, dim, minX, minY, size);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
}

function compareX(a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
        var b = splitPolygon(outerNode, hole);
        filterPoints(b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                m = p.x < p.next.x ? p : p.next;
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    if (hole.x === m.x) return m.prev; // hole touches outer segment; pick lower endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        tanMin = Infinity,
        tan;

    p = m.next;

    while (p !== stop) {
        if (hx >= p.x && p.x >= m.x &&
                pointInTriangle(hy < m.y ? hx : qx, hy, m.x, m.y, hy < m.y ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if ((tan < tanMin || (tan === tanMin && p.x > m.x)) && locallyInside(p, hole)) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    }

    return m;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, size) {
    var p = start;
    do {
        if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, size);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }

            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize === 0) {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                } else if (qSize === 0 || !q) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else if (p.z <= q.z) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and size of the data bounding box
function zOrder(x, y, minX, minY, size) {
    // coords are transformed into non-negative 15-bit integer range
    x = 32767 * (x - minX) / size;
    y = 32767 * (y - minY) / size;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
           (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
           (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return equals(a, b) || a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) &&
           locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b);
}

// signed area of a triangle
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    return area(p1, q1, p2) > 0 !== area(p1, q1, q2) > 0 &&
           area(p2, q2, p1) > 0 !== area(p2, q2, q1) > 0;
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ?
        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
        b2 = new Node(b.i, b.x, b.y),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function Node(i, x, y) {
    // vertice index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertice nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}

},{}],10:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],11:[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],12:[function(require,module,exports){
(function (process){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
/*jshint onevar: false, indent:4 */
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    var _each = function (arr, iterator) {
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(done) );
        });
        function done(err) {
          if (err) {
              callback(err);
              callback = function () {};
          }
          else {
              completed += 1;
              if (completed >= arr.length) {
                  callback();
              }
          }
        }
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        if (!callback) {
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err) {
                    callback(err);
                });
            });
        } else {
            var results = [];
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err, v) {
                    results[x.index] = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        var remainingTasks = keys.length
        if (!remainingTasks) {
            return callback();
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            remainingTasks--
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (!remainingTasks) {
                var theCallback = callback;
                // prevent final callback from calling itself if it errors
                callback = function () {};

                theCallback(null, results);
            }
        });

        _each(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        // Use defaults if times not passed
        if (typeof times === 'function') {
            callback = task;
            task = times;
            times = DEFAULT_TIMES;
        }
        // Make sure times is a number
        times = parseInt(times, 10) || DEFAULT_TIMES;
        var wrappedTask = function(wrappedCallback, wrappedResults) {
            var retryAttempt = function(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            };
            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }
        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            started: false,
            paused: false,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            kill: function () {
              q.drain = null;
              q.tasks = [];
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                if (q.paused === true) { return; }
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= q.concurrency; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
          return a.priority - b.priority;
        };

        function _binarySearch(sequence, item, compare) {
          var beg = -1,
              end = sequence.length - 1;
          while (beg < end) {
            var mid = beg + ((end - beg + 1) >>> 1);
            if (compare(item, sequence[mid]) >= 0) {
              beg = mid;
            } else {
              end = mid - 1;
            }
          }
          return beg;
        }

        function _insert(q, data, priority, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  priority: priority,
                  callback: typeof callback === 'function' ? callback : null
              };

              q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
          _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            drained: true,
            push: function (data, callback) {
                if (!_isArray(data)) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    cargo.drained = false;
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain && !cargo.drained) cargo.drain();
                    cargo.drained = true;
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0, tasks.length);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'))
},{"_process":3}],13:[function(require,module,exports){
var async       = require('async'),
    urlParser   = require('url'),
    Resource    = require('./Resource'),
    EventEmitter = require('eventemitter3');

/**
 * Manages the state and loading of multiple resources to load.
 *
 * @class
 * @param [baseUrl=''] {string} The base url for all resources loaded by this loader.
 * @param [concurrency=10] {number} The number of resources to load concurrently.
 */
function Loader(baseUrl, concurrency) {
    EventEmitter.call(this);

    concurrency = concurrency || 10;

    /**
     * The base url for all resources loaded by this loader.
     *
     * @member {string}
     */
    this.baseUrl = baseUrl || '';

    /**
     * The progress percent of the loader going through the queue.
     *
     * @member {number}
     */
    this.progress = 0;

    /**
     * Loading state of the loader, true if it is currently loading resources.
     *
     * @member {boolean}
     */
    this.loading = false;

    /**
     * The percentage of total progress that a single resource represents.
     *
     * @member {number}
     */
    this._progressChunk = 0;

    /**
     * The middleware to run before loading each resource.
     *
     * @member {function[]}
     */
    this._beforeMiddleware = [];

    /**
     * The middleware to run after loading each resource.
     *
     * @member {function[]}
     */
    this._afterMiddleware = [];

    /**
     * The `_loadResource` function bound with this object context.
     *
     * @private
     * @member {function}
     */
    this._boundLoadResource = this._loadResource.bind(this);

    /**
     * The `_onLoad` function bound with this object context.
     *
     * @private
     * @member {function}
     */
    this._boundOnLoad = this._onLoad.bind(this);

    /**
     * The resource buffer that fills until `load` is called to start loading resources.
     *
     * @private
     * @member {Resource[]}
     */
    this._buffer = [];

    /**
     * Used to track load completion.
     *
     * @private
     * @member {number}
     */
    this._numToLoad = 0;

    /**
     * The resources waiting to be loaded.
     *
     * @private
     * @member {Resource[]}
     */
    this._queue = async.queue(this._boundLoadResource, concurrency);

    /**
     * All the resources for this loader keyed by name.
     *
     * @member {object<string, Resource>}
     */
    this.resources = {};

    /**
     * Emitted once per loaded or errored resource.
     *
     * @event progress
     * @memberof Loader#
     */

    /**
     * Emitted once per errored resource.
     *
     * @event error
     * @memberof Loader#
     */

    /**
     * Emitted once per loaded resource.
     *
     * @event load
     * @memberof Loader#
     */

    /**
     * Emitted when the loader begins to process the queue.
     *
     * @event start
     * @memberof Loader#
     */

    /**
     * Emitted when the queued resources all load.
     *
     * @event complete
     * @memberof Loader#
     */
}

Loader.prototype = Object.create(EventEmitter.prototype);
Loader.prototype.constructor = Loader;
module.exports = Loader;

/**
 * Adds a resource (or multiple resources) to the loader queue.
 *
 * This function can take a wide variety of different parameters. The only thing that is always
 * required the url to load. All the following will work:
 *
 * ```js
 * loader
 *     // normal param syntax
 *     .add('key', 'http://...', function () {})
 *     .add('http://...', function () {})
 *     .add('http://...')
 *
 *     // object syntax
 *     .add({
 *         name: 'key2',
 *         url: 'http://...'
 *     }, function () {})
 *     .add({
 *         url: 'http://...'
 *     }, function () {})
 *     .add({
 *         name: 'key3',
 *         url: 'http://...'
 *         onComplete: function () {}
 *     })
 *     .add({
 *         url: 'https://...',
 *         onComplete: function () {},
 *         crossOrigin: true
 *     })
 *
 *     // you can also pass an array of objects or urls or both
 *     .add([
 *         { name: 'key4', url: 'http://...', onComplete: function () {} },
 *         { url: 'http://...', onComplete: function () {} },
 *         'http://...'
 *     ]);
 * ```
 *
 * @alias enqueue
 * @param [name] {string} The name of the resource to load, if not passed the url is used.
 * @param url {string} The url for this resource, relative to the baseUrl of this loader.
 * @param [options] {object} The options for the load.
 * @param [options.crossOrigin] {boolean} Is this request cross-origin? Default is to determine automatically.
 * @param [options.loadType=Resource.LOAD_TYPE.XHR] {Resource.XHR_LOAD_TYPE} How should this resource be loaded?
 * @param [options.xhrType=Resource.XHR_RESPONSE_TYPE.DEFAULT] {Resource.XHR_RESPONSE_TYPE} How should the data being
 *      loaded be interpreted when using XHR?
 * @param [callback] {function} Function to call when this specific resource completes loading.
 * @return {Loader}
 */
Loader.prototype.add = Loader.prototype.enqueue = function (name, url, options, cb) {
    // special case of an array of objects or urls
    if (Array.isArray(name)) {
        for (var i = 0; i < name.length; ++i) {
            this.add(name[i]);
        }

        return this;
    }

    // if an object is passed instead of params
    if (typeof name === 'object') {
        cb = url || name.callback || name.onComplete;
        options = name;
        url = name.url;
        name = name.name || name.key || name.url;
    }

    // case where no name is passed shift all args over by one.
    if (typeof url !== 'string') {
        cb = options;
        options = url;
        url = name;
    }

    // now that we shifted make sure we have a proper url.
    if (typeof url !== 'string') {
        throw new Error('No url passed to add resource to loader.');
    }

    // options are optional so people might pass a function and no options
    if (typeof options === 'function') {
        cb = options;
        options = null;
    }

    // check if resource already exists.
    if (this.resources[name]) {
        throw new Error('Resource with name "' + name + '" already exists.');
    }

    // add base url if this isn't an absolute url
    url = this._handleBaseUrl(url);

    // create the store the resource
    this.resources[name] = new Resource(name, url, options);

    if (typeof cb === 'function') {
        this.resources[name].once('afterMiddleware', cb);
    }

    this._numToLoad++;

    // if already loading add it to the worker queue
    if (this._queue.started) {
        this._queue.push(this.resources[name]);
        this._progressChunk = (100 - this.progress) / (this._queue.length() + this._queue.running());
    }
    // otherwise buffer it to be added to the queue later
    else {
        this._buffer.push(this.resources[name]);
        this._progressChunk = 100 / this._buffer.length;
    }

    return this;
};

Loader.prototype._handleBaseUrl = function (url) {
    var parsedUrl = urlParser.parse(url);

    // absolute url, just use it as is.
    if (parsedUrl.protocol || parsedUrl.pathname.indexOf('//') === 0) {
        return url;
    }

    // if baseUrl doesn't end in slash and url doesn't start with slash, then add a slash inbetween
    if (
        this.baseUrl.length &&
        this.baseUrl.lastIndexOf('/') !== this.baseUrl.length - 1 &&
        url.charAt(0) !== '/'
    ) {
        return this.baseUrl + '/' + url;
    }
    else {
        return this.baseUrl + url;
    }
};


/**
 * Sets up a middleware function that will run *before* the
 * resource is loaded.
 *
 * @alias pre
 * @param middleware {function} The middleware function to register.
 * @return {Loader}
 */
Loader.prototype.before = Loader.prototype.pre = function (fn) {
    this._beforeMiddleware.push(fn);

    return this;
};

/**
 * Sets up a middleware function that will run *after* the
 * resource is loaded.
 *
 * @alias use
 * @param middleware {function} The middleware function to register.
 * @return {Loader}
 */
Loader.prototype.after = Loader.prototype.use = function (fn) {
    this._afterMiddleware.push(fn);

    return this;
};

/**
 * Resets the queue of the loader to prepare for a new load.
 *
 * @return {Loader}
 */
Loader.prototype.reset = function () {
    // this.baseUrl = baseUrl || '';

    this.progress = 0;

    this.loading = false;

    this._progressChunk = 0;

    // this._beforeMiddleware.length = 0;
    // this._afterMiddleware.length = 0;

    this._buffer.length = 0;

    this._numToLoad = 0;

    this._queue.kill();
    this._queue.started = false;

    this.resources = {};
};

/**
 * Starts loading the queued resources.
 *
 * @fires start
 * @param [callback] {function} Optional callback that will be bound to the `complete` event.
 * @return {Loader}
 */
Loader.prototype.load = function (cb) {
    // register complete callback if they pass one
    if (typeof cb === 'function') {
        this.once('complete', cb);
    }

    // if the queue has already started we are done here
    if (this._queue.started) {
        return this;
    }

    // notify of start
    this.emit('start', this);

    // start the internal queue
    for (var i = 0; i < this._buffer.length; ++i) {
        this._queue.push(this._buffer[i]);
    }

    // empty the buffer
    this._buffer.length = 0;

    return this;
};

/**
 * Loads a single resource.
 *
 * @fires progress
 * @private
 */
Loader.prototype._loadResource = function (resource, dequeue) {
    var self = this;

    resource._dequeue = dequeue;

    this._runMiddleware(resource, this._beforeMiddleware, function () {
        // resource.on('progress', self.emit.bind(self, 'progress'));

        resource.load(self._boundOnLoad);
    });
};

/**
 * Called once each resource has loaded.
 *
 * @fires complete
 * @private
 */
Loader.prototype._onComplete = function () {
    this.emit('complete', this, this.resources);
};

/**
 * Called each time a resources is loaded.
 *
 * @fires progress
 * @fires error
 * @fires load
 * @private
 */
Loader.prototype._onLoad = function (resource) {
    this.progress += this._progressChunk;

    this.emit('progress', this, resource);

    // run middleware, this *must* happen before dequeue so sub-assets get added properly
    this._runMiddleware(resource, this._afterMiddleware, function () {
        resource.emit('afterMiddleware', resource);

        this._numToLoad--;

        // do completion check
        if (this._numToLoad === 0) {
            this.progress = 100;
            this._onComplete();
        }
        
        if (resource.error) {
            this.emit('error', resource.error, this, resource);
        }
        else {
            this.emit('load', this, resource);
        }
    });
    


    // remove this resource from the async queue
    resource._dequeue();
};

/**
 * Run middleware functions on a resource.
 *
 * @private
 */
Loader.prototype._runMiddleware = function (resource, fns, cb) {
    var self = this;

    async.eachSeries(fns, function (fn, next) {
        fn.call(self, resource, next);
    }, cb.bind(this, resource));
};

Loader.LOAD_TYPE = Resource.LOAD_TYPE;
Loader.XHR_READY_STATE = Resource.XHR_READY_STATE;
Loader.XHR_RESPONSE_TYPE = Resource.XHR_RESPONSE_TYPE;

},{"./Resource":14,"async":12,"eventemitter3":10,"url":8}],14:[function(require,module,exports){
var EventEmitter = require('eventemitter3'),
    _url = require('url'),
    // tests is CORS is supported in XHR, if not we need to use XDR
    useXdr = !!(window.XDomainRequest && !('withCredentials' in (new XMLHttpRequest()))),
    tempAnchor = null;

/**
 * Manages the state and loading of a single resource represented by
 * a single URL.
 *
 * @class
 * @param name {string} The name of the resource to load.
 * @param url {string|string[]} The url for this resource, for audio/video loads you can pass an array of sources.
 * @param [options] {object} The options for the load.
 * @param [options.crossOrigin] {string|boolean} Is this request cross-origin? Default is to determine automatically.
 * @param [options.loadType=Resource.LOAD_TYPE.XHR] {Resource.LOAD_TYPE} How should this resource be loaded?
 * @param [options.xhrType=Resource.XHR_RESPONSE_TYPE.DEFAULT] {Resource.XHR_RESPONSE_TYPE} How should the data being
 *      loaded be interpreted when using XHR?
 * @param [options.metadata] {object} Extra info for middleware.
 */
function Resource(name, url, options) {
    EventEmitter.call(this);

    options = options || {};

    if (typeof name !== 'string' || typeof url !== 'string') {
        throw new Error('Both name and url are required for constructing a resource.');
    }

    /**
     * The name of this resource.
     *
     * @member {string}
     * @readonly
     */
    this.name = name;

    /**
     * The url used to load this resource.
     *
     * @member {string}
     * @readonly
     */
    this.url = url;

    /**
     * Stores whether or not this url is a data url.
     *
     * @member {boolean}
     * @readonly
     */
    this.isDataUrl = this.url.indexOf('data:') === 0;

    /**
     * The data that was loaded by the resource.
     *
     * @member {any}
     */
    this.data = null;

    /**
     * Is this request cross-origin? If unset, determined automatically.
     *
     * @member {string}
     */
    this.crossOrigin = options.crossOrigin === true ? 'anonymous' : options.crossOrigin;

    /**
     * The method of loading to use for this resource.
     *
     * @member {Resource.LOAD_TYPE}
     */
    this.loadType = options.loadType || this._determineLoadType();

    /**
     * The type used to load the resource via XHR. If unset, determined automatically.
     *
     * @member {string}
     */
    this.xhrType = options.xhrType;

    /**
     * Extra info for middleware
     *
     * @member {object}
     */
    this.metadata = options.metadata || {};

    /**
     * The error that occurred while loading (if any).
     *
     * @member {Error}
     * @readonly
     */
    this.error = null;

    /**
     * The XHR object that was used to load this resource. This is only set
     * when `loadType` is `Resource.LOAD_TYPE.XHR`.
     *
     * @member {XMLHttpRequest}
     */
    this.xhr = null;

    /**
     * Describes if this resource was loaded as json. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isJson = false;

    /**
     * Describes if this resource was loaded as xml. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isXml = false;

    /**
     * Describes if this resource was loaded as an image tag. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isImage = false;

    /**
     * Describes if this resource was loaded as an audio tag. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isAudio = false;

    /**
     * Describes if this resource was loaded as a video tag. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isVideo = false;

    /**
     * The `dequeue` method that will be used a storage place for the async queue dequeue method
     * used privately by the loader.
     *
     * @member {function}
     * @private
     */
    this._dequeue = null;

    /**
     * The `complete` function bound to this resource's context.
     *
     * @member {function}
     * @private
     */
    this._boundComplete = this.complete.bind(this);

    /**
     * The `_onError` function bound to this resource's context.
     *
     * @member {function}
     * @private
     */
    this._boundOnError = this._onError.bind(this);

    /**
     * The `_onProgress` function bound to this resource's context.
     *
     * @member {function}
     * @private
     */
    this._boundOnProgress = this._onProgress.bind(this);

    // xhr callbacks
    this._boundXhrOnError = this._xhrOnError.bind(this);
    this._boundXhrOnAbort = this._xhrOnAbort.bind(this);
    this._boundXhrOnLoad = this._xhrOnLoad.bind(this);
    this._boundXdrOnTimeout = this._xdrOnTimeout.bind(this);

    /**
     * Emitted when the resource beings to load.
     *
     * @event start
     * @memberof Resource#
     */

    /**
     * Emitted each time progress of this resource load updates.
     * Not all resources types and loader systems can support this event
     * so sometimes it may not be available. If the resource
     * is being loaded on a modern browser, using XHR, and the remote server
     * properly sets Content-Length headers, then this will be available.
     *
     * @event progress
     * @memberof Resource#
     */

    /**
     * Emitted once this resource has loaded, if there was an error it will
     * be in the `error` property.
     *
     * @event complete
     * @memberof Resource#
     */
}

Resource.prototype = Object.create(EventEmitter.prototype);
Resource.prototype.constructor = Resource;
module.exports = Resource;

/**
 * Marks the resource as complete.
 *
 * @fires complete
 */
Resource.prototype.complete = function () {
    // TODO: Clean this up in a wrapper or something...gross....
    if (this.data && this.data.removeEventListener) {
        this.data.removeEventListener('error', this._boundOnError);
        this.data.removeEventListener('load', this._boundComplete);
        this.data.removeEventListener('progress', this._boundOnProgress);
        this.data.removeEventListener('canplaythrough', this._boundComplete);
    }

    if (this.xhr) {
        if (this.xhr.removeEventListener) {
            this.xhr.removeEventListener('error', this._boundXhrOnError);
            this.xhr.removeEventListener('abort', this._boundXhrOnAbort);
            this.xhr.removeEventListener('progress', this._boundOnProgress);
            this.xhr.removeEventListener('load', this._boundXhrOnLoad);
        }
        else {
            this.xhr.onerror = null;
            this.xhr.ontimeout = null;
            this.xhr.onprogress = null;
            this.xhr.onload = null;
        }
    }

    this.emit('complete', this);
};

/**
 * Kicks off loading of this resource.
 *
 * @fires start
 * @param [callback] {function} Optional callback to call once the resource is loaded.
 */
Resource.prototype.load = function (cb) {
    this.emit('start', this);

    // if a callback is set, listen for complete event
    if (cb) {
        this.once('complete', cb);
    }

    // if unset, determine the value
    if (this.crossOrigin === false || typeof this.crossOrigin !== 'string') {
        this.crossOrigin = this._determineCrossOrigin(this.url);
    }

    switch(this.loadType) {
        case Resource.LOAD_TYPE.IMAGE:
            this._loadImage();
            break;

        case Resource.LOAD_TYPE.AUDIO:
            this._loadElement('audio');
            break;

        case Resource.LOAD_TYPE.VIDEO:
            this._loadElement('video');
            break;

        case Resource.LOAD_TYPE.XHR:
            /* falls through */
        default:
            if (useXdr && this.crossOrigin) {
                this._loadXdr();
            }
            else {
                this._loadXhr();
            }
            break;
    }
};

/**
 * Loads this resources using an Image object.
 *
 * @private
 */
Resource.prototype._loadImage = function () {
    this.data = new Image();

    if (this.crossOrigin) {
        this.data.crossOrigin = this.crossOrigin;
    }

    this.data.src = this.url;

    this.isImage = true;

    this.data.addEventListener('error', this._boundOnError, false);
    this.data.addEventListener('load', this._boundComplete, false);
    this.data.addEventListener('progress', this._boundOnProgress, false);
};

/**
 * Loads this resources using an HTMLAudioElement or HTMLVideoElement.
 *
 * @private
 */
Resource.prototype._loadElement = function (type) {
    if (type === 'audio' && typeof Audio !== 'undefined') {
        this.data = new Audio();
    }
    else {
        this.data = document.createElement(type);
    }

    if (this.data === null) {
        this.error = new Error('Unsupported element ' + type);
        this.complete();
        return;
    }

    // support for CocoonJS Canvas+ runtime, lacks document.createElement('source')
    if (navigator.isCocoonJS) {
        this.data.src = Array.isArray(this.url) ? this.url[0] : this.url;
    }
    else {
        if (Array.isArray(this.url)) {
            for (var i = 0; i < this.url.length; ++i) {
                this.data.appendChild(this._createSource(type, this.url[i]));
            }
        }
        else {
            this.data.appendChild(this._createSource(type, this.url));
        }
    }

    this['is' + type[0].toUpperCase() + type.substring(1)] = true;

    this.data.addEventListener('error', this._boundOnError, false);
    this.data.addEventListener('load', this._boundComplete, false);
    this.data.addEventListener('progress', this._boundOnProgress, false);
    this.data.addEventListener('canplaythrough', this._boundComplete, false);

    this.data.load();
};

/**
 * Loads this resources using an XMLHttpRequest.
 *
 * @private
 */
Resource.prototype._loadXhr = function () {
    // if unset, determine the value
    if (typeof this.xhrType !== 'string') {
        this.xhrType = this._determineXhrType();
    }

    var xhr = this.xhr = new XMLHttpRequest();

    // set the request type and url
    xhr.open('GET', this.url, true);

    // load json as text and parse it ourselves. We do this because some browsers
    // *cough* safari *cough* can't deal with it.
    if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON || this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
        xhr.responseType = Resource.XHR_RESPONSE_TYPE.TEXT;
    }
    else {
        xhr.responseType = this.xhrType;
    }

    xhr.addEventListener('error', this._boundXhrOnError, false);
    xhr.addEventListener('abort', this._boundXhrOnAbort, false);
    xhr.addEventListener('progress', this._boundOnProgress, false);
    xhr.addEventListener('load', this._boundXhrOnLoad, false);

    xhr.send();
};

/**
 * Loads this resources using an XDomainRequest. This is here because we need to support IE9 (gross).
 *
 * @private
 */
Resource.prototype._loadXdr = function () {
    // if unset, determine the value
    if (typeof this.xhrType !== 'string') {
        this.xhrType = this._determineXhrType();
    }

    var xdr = this.xhr = new XDomainRequest();

    // XDomainRequest has a few quirks. Occasionally it will abort requests
    // A way to avoid this is to make sure ALL callbacks are set even if not used
    // More info here: http://stackoverflow.com/questions/15786966/xdomainrequest-aborts-post-on-ie-9
    xdr.timeout = 5000;

    xdr.onerror = this._boundXhrOnError;
    xdr.ontimeout = this._boundXdrOnTimeout;
    xdr.onprogress = this._boundOnProgress;
    xdr.onload = this._boundXhrOnLoad;

    xdr.open('GET', this.url, true);

    //  Note: The xdr.send() call is wrapped in a timeout to prevent an issue with the interface where some requests are lost
    //  if multiple XDomainRequests are being sent at the same time.
    // Some info here: https://github.com/photonstorm/phaser/issues/1248
    setTimeout(function () {
        xdr.send();
    }, 0);
};

/**
 * Creates a source used in loading via an element.
 *
 * @param type {string} The element type (video or audio).
 * @param url {string} The source URL to load from.
 * @param [mime] {string} The mime type of the video
 * @private
 */
Resource.prototype._createSource = function (type, url, mime) {
    if (!mime) {
        mime = type + '/' + url.substr(url.lastIndexOf('.') + 1);
    }

    var source = document.createElement('source');

    source.src = url;
    source.type = mime;

    return source;
};

/**
 * Called if a load errors out.
 *
 * @param event {Event} The error event from the element that emits it.
 * @private
 */
Resource.prototype._onError = function (event) {
    this.error = new Error('Failed to load element using ' + event.target.nodeName);
    this.complete();
};

/**
 * Called if a load progress event fires for xhr/xdr.
 *
 * @fires progress
 * @param event {XMLHttpRequestProgressEvent|Event}
 * @private
 */
Resource.prototype._onProgress =  function (event) {
    if (event && event.lengthComputable) {
        this.emit('progress', this, event.loaded / event.total);
    }
};

/**
 * Called if an error event fires for xhr/xdr.
 *
 * @param event {XMLHttpRequestErrorEvent|Event}
 * @private
 */
Resource.prototype._xhrOnError = function () {
    this.error = new Error(
        reqType(this.xhr) + ' Request failed. ' +
        'Status: ' + this.xhr.status + ', text: "' + this.xhr.statusText + '"'
    );

    this.complete();
};

/**
 * Called if an abort event fires for xhr.
 *
 * @param event {XMLHttpRequestAbortEvent}
 * @private
 */
Resource.prototype._xhrOnAbort = function () {
    this.error = new Error(reqType(this.xhr) + ' Request was aborted by the user.');
    this.complete();
};

/**
 * Called if a timeout event fires for xdr.
 *
 * @param event {Event}
 * @private
 */
Resource.prototype._xdrOnTimeout = function () {
    this.error = new Error(reqType(this.xhr) + ' Request timed out.');
    this.complete();
};

/**
 * Called when data successfully loads from an xhr/xdr request.
 *
 * @param event {XMLHttpRequestLoadEvent|Event}
 * @private
 */
Resource.prototype._xhrOnLoad = function () {
    var xhr = this.xhr,
        status = xhr.status !== undefined ? xhr.status : 200; //XDR has no `.status`, assume 200.

    // status can be 0 when using the file:// protocol, also check if a response was found
    if (status === 200 || status === 204 || (status === 0 && xhr.responseText.length > 0)) {
        // if text, just return it
        if (this.xhrType === Resource.XHR_RESPONSE_TYPE.TEXT) {
            this.data = xhr.responseText;
        }
        // if json, parse into json object
        else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON) {
            try {
                this.data = JSON.parse(xhr.responseText);
                this.isJson = true;
            } catch(e) {
                this.error = new Error('Error trying to parse loaded json:', e);
            }
        }
        // if xml, parse into an xml document or div element
        else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
            try {
                if (window.DOMParser) {
                    var domparser = new DOMParser();
                    this.data = domparser.parseFromString(xhr.responseText, 'text/xml');
                }
                else {
                    var div = document.createElement('div');
                    div.innerHTML = xhr.responseText;
                    this.data = div;
                }
                this.isXml = true;
            } catch (e) {
                this.error = new Error('Error trying to parse loaded xml:', e);
            }
        }
        // other types just return the response
        else {
            this.data = xhr.response || xhr.responseText;
        }
    }
    else {
        this.error = new Error('[' + xhr.status + ']' + xhr.statusText + ':' + xhr.responseURL);
    }

    this.complete();
};

function reqType(xhr) {
    return xhr.toString().replace('object ', '');
}

/**
 * Sets the `crossOrigin` property for this resource based on if the url
 * for this resource is cross-origin. If crossOrigin was manually set, this
 * function does nothing.
 *
 * @private
 * @param url {string} The url to test.
 * @param [location=window.location] {object} The location object to test against.
 * @return {string} The crossOrigin value to use (or empty string for none).
 */
Resource.prototype._determineCrossOrigin = function (url, loc) {
    // data: and javascript: urls are considered same-origin
    if (url.indexOf('data:') === 0) {
        return '';
    }

    // default is window.location
    loc = loc || window.location;

    if (!tempAnchor) {
        tempAnchor = document.createElement('a');
    }

    // let the browser determine the full href for the url of this resource and then
    // parse with the node url lib, we can't use the properties of the anchor element
    // because they don't work in IE9 :(
    tempAnchor.href = url;
    url = _url.parse(tempAnchor.href);

    var samePort = (!url.port && loc.port === '') || (url.port === loc.port);

    // if cross origin
    if (url.hostname !== loc.hostname || !samePort || url.protocol !== loc.protocol) {
        return 'anonymous';
    }

    return '';
};

/**
 * Determines the responseType of an XHR request based on the extension of the
 * resource being loaded.
 *
 * @private
 * @return {Resource.XHR_RESPONSE_TYPE} The responseType to use.
 */
Resource.prototype._determineXhrType = function () {
    return Resource._xhrTypeMap[this._getExtension()] || Resource.XHR_RESPONSE_TYPE.TEXT;
};

Resource.prototype._determineLoadType = function () {
    return Resource._loadTypeMap[this._getExtension()] || Resource.LOAD_TYPE.XHR;
};

Resource.prototype._getExtension = function () {
    var url = this.url,
        ext;

    if (this.isDataUrl) {
        var slashIndex = url.indexOf('/');
        ext = url.substring(slashIndex + 1, url.indexOf(';', slashIndex));
    }
    else {
        var queryStart = url.indexOf('?');
        if (queryStart !== -1) {
            url = url.substring(0, queryStart);
        }

        ext = url.substring(url.lastIndexOf('.') + 1);
    }

    return ext;
};

/**
 * Determines the mime type of an XHR request based on the responseType of
 * resource being loaded.
 *
 * @private
 * @return {string} The mime type to use.
 */
Resource.prototype._getMimeFromXhrType = function (type) {
    switch(type) {
        case Resource.XHR_RESPONSE_TYPE.BUFFER:
            return 'application/octet-binary';

        case Resource.XHR_RESPONSE_TYPE.BLOB:
            return 'application/blob';

        case Resource.XHR_RESPONSE_TYPE.DOCUMENT:
            return 'application/xml';

        case Resource.XHR_RESPONSE_TYPE.JSON:
            return 'application/json';

        case Resource.XHR_RESPONSE_TYPE.DEFAULT:
        case Resource.XHR_RESPONSE_TYPE.TEXT:
            /* falls through */
        default:
            return 'text/plain';

    }
};

/**
 * The types of loading a resource can use.
 *
 * @static
 * @constant
 * @property {object} LOAD_TYPE
 * @property {number} LOAD_TYPE.XHR - Uses XMLHttpRequest to load the resource.
 * @property {number} LOAD_TYPE.IMAGE - Uses an `Image` object to load the resource.
 * @property {number} LOAD_TYPE.AUDIO - Uses an `Audio` object to load the resource.
 * @property {number} LOAD_TYPE.VIDEO - Uses a `Video` object to load the resource.
 */
Resource.LOAD_TYPE = {
    XHR:    1,
    IMAGE:  2,
    AUDIO:  3,
    VIDEO:  4
};

/**
 * The XHR ready states, used internally.
 *
 * @static
 * @constant
 * @property {object} XHR_READY_STATE
 * @property {number} XHR_READY_STATE.UNSENT - open()has not been called yet.
 * @property {number} XHR_READY_STATE.OPENED - send()has not been called yet.
 * @property {number} XHR_READY_STATE.HEADERS_RECEIVED - send() has been called, and headers and status are available.
 * @property {number} XHR_READY_STATE.LOADING - Downloading; responseText holds partial data.
 * @property {number} XHR_READY_STATE.DONE - The operation is complete.
 */
Resource.XHR_READY_STATE = {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
};

/**
 * The XHR ready states, used internally.
 *
 * @static
 * @constant
 * @property {object} XHR_RESPONSE_TYPE
 * @property {string} XHR_RESPONSE_TYPE.DEFAULT - defaults to text
 * @property {string} XHR_RESPONSE_TYPE.BUFFER - ArrayBuffer
 * @property {string} XHR_RESPONSE_TYPE.BLOB - Blob
 * @property {string} XHR_RESPONSE_TYPE.DOCUMENT - Document
 * @property {string} XHR_RESPONSE_TYPE.JSON - Object
 * @property {string} XHR_RESPONSE_TYPE.TEXT - String
 */
Resource.XHR_RESPONSE_TYPE = {
    DEFAULT:    'text',
    BUFFER:     'arraybuffer',
    BLOB:       'blob',
    DOCUMENT:   'document',
    JSON:       'json',
    TEXT:       'text'
};

Resource._loadTypeMap = {
    'gif':      Resource.LOAD_TYPE.IMAGE,
    'png':      Resource.LOAD_TYPE.IMAGE,
    'bmp':      Resource.LOAD_TYPE.IMAGE,
    'jpg':      Resource.LOAD_TYPE.IMAGE,
    'jpeg':     Resource.LOAD_TYPE.IMAGE,
    'tif':      Resource.LOAD_TYPE.IMAGE,
    'tiff':     Resource.LOAD_TYPE.IMAGE,
    'webp':     Resource.LOAD_TYPE.IMAGE,
    'tga':      Resource.LOAD_TYPE.IMAGE
};

Resource._xhrTypeMap = {
    // xml
    'xhtml':    Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    'html':     Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    'htm':      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    'xml':      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    'tmx':      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    'tsx':      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    'svg':      Resource.XHR_RESPONSE_TYPE.DOCUMENT,

    // images
    'gif':      Resource.XHR_RESPONSE_TYPE.BLOB,
    'png':      Resource.XHR_RESPONSE_TYPE.BLOB,
    'bmp':      Resource.XHR_RESPONSE_TYPE.BLOB,
    'jpg':      Resource.XHR_RESPONSE_TYPE.BLOB,
    'jpeg':     Resource.XHR_RESPONSE_TYPE.BLOB,
    'tif':      Resource.XHR_RESPONSE_TYPE.BLOB,
    'tiff':     Resource.XHR_RESPONSE_TYPE.BLOB,
    'webp':     Resource.XHR_RESPONSE_TYPE.BLOB,
    'tga':      Resource.XHR_RESPONSE_TYPE.BLOB,

    // json
    'json':     Resource.XHR_RESPONSE_TYPE.JSON,

    // text
    'text':     Resource.XHR_RESPONSE_TYPE.TEXT,
    'txt':      Resource.XHR_RESPONSE_TYPE.TEXT
};

/**
 * Sets the load type to be used for a specific extension.
 *
 * @static
 * @param extname {string} The extension to set the type for, e.g. "png" or "fnt"
 * @param loadType {Resource.LOAD_TYPE} The load type to set it to.
 */
Resource.setExtensionLoadType = function (extname, loadType) {
    setExtMap(Resource._loadTypeMap, extname, loadType);
};

/**
 * Sets the load type to be used for a specific extension.
 *
 * @static
 * @param extname {string} The extension to set the type for, e.g. "png" or "fnt"
 * @param xhrType {Resource.XHR_RESPONSE_TYPE} The xhr type to set it to.
 */
Resource.setExtensionXhrType = function (extname, xhrType) {
    setExtMap(Resource._xhrTypeMap, extname, xhrType);
};

function setExtMap(map, extname, val) {
    if (extname && extname.indexOf('.') === 0) {
        extname = extname.substring(1);
    }

    if (!extname) {
        return;
    }

    map[extname] = val;
}

},{"eventemitter3":10,"url":8}],15:[function(require,module,exports){
module.exports = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    encodeBinary: function (input) {
        var output = "";
        var bytebuffer;
        var encodedCharIndexes = new Array(4);
        var inx = 0;
        var jnx = 0;
        var paddingBytes = 0;

        while (inx < input.length) {
            // Fill byte buffer array
            bytebuffer = new Array(3);
            for (jnx = 0; jnx < bytebuffer.length; jnx++) {
                if (inx < input.length) {
                    // throw away high-order byte, as documented at:
                    // https://developer.mozilla.org/En/Using_XMLHttpRequest#Handling_binary_data
                    bytebuffer[jnx] = input.charCodeAt(inx++) & 0xff;
                }
                else {
                    bytebuffer[jnx] = 0;
                }
            }

            // Get each encoded character, 6 bits at a time
            // index 1: first 6 bits
            encodedCharIndexes[0] = bytebuffer[0] >> 2;
            // index 2: second 6 bits (2 least significant bits from input byte 1 + 4 most significant bits from byte 2)
            encodedCharIndexes[1] = ((bytebuffer[0] & 0x3) << 4) | (bytebuffer[1] >> 4);
            // index 3: third 6 bits (4 least significant bits from input byte 2 + 2 most significant bits from byte 3)
            encodedCharIndexes[2] = ((bytebuffer[1] & 0x0f) << 2) | (bytebuffer[2] >> 6);
            // index 3: forth 6 bits (6 least significant bits from input byte 3)
            encodedCharIndexes[3] = bytebuffer[2] & 0x3f;

            // Determine whether padding happened, and adjust accordingly
            paddingBytes = inx - (input.length - 1);
            switch (paddingBytes) {
                case 2:
                    // Set last 2 characters to padding char
                    encodedCharIndexes[3] = 64;
                    encodedCharIndexes[2] = 64;
                    break;

                case 1:
                    // Set last character to padding char
                    encodedCharIndexes[3] = 64;
                    break;

                default:
                    break; // No padding - proceed
            }

            // Now we will grab each appropriate character out of our keystring
            // based on our index array and append it to the output string
            for (jnx = 0; jnx < encodedCharIndexes.length; jnx++) {
                output += this._keyStr.charAt(encodedCharIndexes[jnx]);
            }
        }
        return output;
    }
};

},{}],16:[function(require,module,exports){
module.exports = require('./Loader');

module.exports.Resource = require('./Resource');

module.exports.middleware = {
    caching: {
        memory: require('./middlewares/caching/memory')
    },
    parsing: {
        blob: require('./middlewares/parsing/blob')
    }
};

},{"./Loader":13,"./Resource":14,"./middlewares/caching/memory":17,"./middlewares/parsing/blob":18}],17:[function(require,module,exports){
// a simple in-memory cache for resources
var cache = {};

module.exports = function () {
    return function (resource, next) {
        // if cached, then set data and complete the resource
        if (cache[resource.url]) {
            resource.data = cache[resource.url];
            resource.complete();
        }
        // if not cached, wait for complete and store it in the cache.
        else {
            resource.once('complete', function () {
               cache[this.url] = this.data;
            });
        }
        
        next();
    };
};

},{}],18:[function(require,module,exports){
var Resource = require('../../Resource'),
    b64 = require('../../b64');

window.URL = window.URL || window.webkitURL;

// a middleware for transforming XHR loaded Blobs into more useful objects

module.exports = function () {
    return function (resource, next) {
        if (!resource.data) {
            return next();
        }

        // if this was an XHR load of a blob
        if (resource.xhr && resource.xhrType === Resource.XHR_RESPONSE_TYPE.BLOB) {
            // if there is no blob support we probably got a binary string back
            if (!window.Blob || typeof resource.data === 'string') {
                var type = resource.xhr.getResponseHeader('content-type');

                // this is an image, convert the binary string into a data url
                if (type && type.indexOf('image') === 0) {
                    resource.data = new Image();
                    resource.data.src = 'data:' + type + ';base64,' + b64.encodeBinary(resource.xhr.responseText);

                    resource.isImage = true;

                    // wait until the image loads and then callback
                    resource.data.onload = function () {
                        resource.data.onload = null;

                        next();
                    };
                }
            }
            // if content type says this is an image, then we should transform the blob into an Image object
            else if (resource.data.type.indexOf('image') === 0) {
                var src = URL.createObjectURL(resource.data);

                resource.blob = resource.data;
                resource.data = new Image();
                resource.data.src = src;

                resource.isImage = true;

                // cleanup the no longer used blob after the image loads
                resource.data.onload = function () {
                    URL.revokeObjectURL(src);
                    resource.data.onload = null;

                    next();
                };
            }
        }
        else {
            next();
        }
    };
};

},{"../../Resource":14,"../../b64":15}],19:[function(require,module,exports){
var core = require('../core');

// add some extra variables to the container..
Object.assign(
    core.DisplayObject.prototype,
    require('./accessibleTarget')
);


/**
 * The Accessibility manager reacreates the ability to tab and and have content read by screen readers. This is very important as it can possibly help people with disabilities access pixi content.
 * Much like interaction any DisplayObject can be made accessible. This manager will map the events as if the mouse was being used, minimizing the efferot required to implement.
 *
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} A reference to the current renderer
 */
function AccessibilityManager(renderer)
{
	// first we create a div that will sit over the pixi element. This is where the div overlays will go.
    var div = document.createElement('div');
    
    div.style.width = 100 + 'px';
    div.style.height = 100 + 'px';
    div.style.position = 'absolute';
    div.style.top = 0;
    div.style.left = 0;
   //
    div.style.zIndex = 2;
   	
   	/**
   	 * This is the dom element that will sit over the pixi element. This is where the div overlays will go.
   	 * 
   	 * @type {HTMLElement}
   	 * @private
   	 */
   	this.div = div;

   	/**
   	 * A simple pool for storing divs.
   	 * 
   	 * @type {Array}
   	 * @private
   	 */
 	this.pool = [];

 	/**
 	 * This is a tick used to check if an object is no longer being rendered.
 	 * 
 	 * @type {Number}
 	 * @private
 	 */
   	this.renderId = 0;

   	/**
   	 * Setting this to true will visually show the divs
   	 * 
   	 * @type {Boolean}
   	 */
   	this.debug = false;

  	/**
     * The renderer this accessibility manager works for.
     *
     * @member {PIXI.SystemRenderer}
     */
   	this.renderer = renderer;

   	/**
     * The array of currently active accessible items.
     *
     * @member {Array}
     * @private
     */
   	this.children = [];
   	
   	/**
     * pre bind the functions..
     */
   	this._onKeyDown = this._onKeyDown.bind(this);
   	this._onMouseMove = this._onMouseMove.bind(this);
   	
   	/**
     * stores the state of the manager. If there are no accessible objects or the mouse is moving the will be false.
     *
     * @member {Array}
     * @private
     */
   	this.isActive = false;


   	// let listen for tab.. once pressed we can fire up and show the accessibility layer
   	window.addEventListener('keydown', this._onKeyDown, false);
}


AccessibilityManager.prototype.constructor = AccessibilityManager;
module.exports = AccessibilityManager;

/**
 * Activating will cause the Accessibility layer to be shown. This is called when a user preses the tab key
 * @private
 */
AccessibilityManager.prototype.activate = function()
{
	if(this.isActive)
	{
		return;
	}

	this.isActive = true;

	window.document.addEventListener('mousemove', this._onMouseMove, true);
	window.removeEventListener('keydown', this._onKeyDown, false);

	this.renderer.on('postrender', this.update, this);

	this.renderer.view.parentNode.appendChild(this.div);	
};

/**
 * Deactivating will cause the Accessibility layer to be hidden. This is called when a user moves the mouse
 * @private
 */
AccessibilityManager.prototype.deactivate = function()
{
	if(!this.isActive)
	{
		return;
	}

	this.isActive = false;

	window.document.removeEventListener('mousemove', this._onMouseMove);
	window.addEventListener('keydown', this._onKeyDown, false);

	this.renderer.off('postrender', this.update);

	this.div.parentNode.removeChild(this.div);

};

/**
 * This recursive function will run throught he scene graph and add any new accessible objects to the DOM layer.
 * @param element {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} the DisplayObject to check.
 * @private
 */
AccessibilityManager.prototype.updateAccessibleObjects = function(displayObject)
{
	if(!displayObject.visible)
	{
		return;
	}

	if(displayObject.accessible && displayObject.interactive)
	{
		if(!displayObject._accessibleActive)
		{
			this.addChild(displayObject);
		}
	   	
	   	displayObject.renderId = this.renderId;
	}


	if(displayObject.interactiveChildren)
	{

		var children = displayObject.children;

		for (var i = children.length - 1; i >= 0; i--) {
		
			this.updateAccessibleObjects(children[i]);
		}
	}
};


/**
 * Before each render this function will ensure that all divs are mapped correctly to their DisplayObjects
 * @private
 */
AccessibilityManager.prototype.update = function()
{

	// update children...
	this.updateAccessibleObjects(this.renderer._lastObjectRendered);

	var rect = this.renderer.view.getBoundingClientRect();
	var sx = rect.width  / this.renderer.width;
	var sy = rect.height / this.renderer.height;

	var div = this.div;

	div.style.left = rect.left + 'px';
	div.style.top = rect.top + 'px';
	div.style.width = this.renderer.width + 'px';
	div.style.height = this.renderer.height + 'px';

	for (var i = 0; i < this.children.length; i++)
	{

		var child = this.children[i];

		if(child.renderId !== this.renderId)
		{
			child._accessibleActive = false;

            core.utils.removeItems(this.children, i, 1);
			this.div.removeChild( child._accessibleDiv );
			this.pool.push(child._accessibleDiv);
			child._accessibleDiv = null;

			i--;

			if(this.children.length === 0)
			{
				this.deactivate();
			}
		}
		else
		{
			// map div to display..
			div = child._accessibleDiv;
			var hitArea = child.hitArea;
			var wt = child.worldTransform;

			if(child.hitArea)
			{
				div.style.left = ((wt.tx + (hitArea.x * wt.a)) * sx) + 'px';
				div.style.top =  ((wt.ty + (hitArea.y * wt.d)) * sy) +  'px';

				div.style.width = (hitArea.width * wt.a * sx) + 'px';
				div.style.height = (hitArea.height * wt.d * sy) + 'px';
			
			}
			else
			{
				hitArea = child.getBounds();

				this.capHitArea(hitArea);

				div.style.left = (hitArea.x * sx) + 'px';
				div.style.top =  (hitArea.y * sy) +  'px';

				div.style.width = (hitArea.width * sx) + 'px';
				div.style.height = (hitArea.height * sy) + 'px';
			}		
		}
	}

	// increment the render id..
	this.renderId++;
};

AccessibilityManager.prototype.capHitArea = function (hitArea)
{
    if (hitArea.x < 0)
    {
        hitArea.width += hitArea.x;
        hitArea.x = 0;
    }

    if (hitArea.y < 0)
    {
        hitArea.height += hitArea.y;
        hitArea.y = 0;
    }

    if ( hitArea.x + hitArea.width > this.renderer.width )
    {
        hitArea.width = this.renderer.width - hitArea.x;
    }

    if ( hitArea.y + hitArea.height > this.renderer.height )
    {
        hitArea.height = this.renderer.height - hitArea.y;
    }
};


/**
 * Adds a DisplayObject to the accessibility manager
 * @private
 */
AccessibilityManager.prototype.addChild = function(displayObject)
{
//	this.activate();
	
	var div = this.pool.pop();

	if(!div)
	{
		div = document.createElement('button'); 

	    div.style.width = 100 + 'px';
	    div.style.height = 100 + 'px';
	    div.style.backgroundColor = this.debug ? 'rgba(255,0,0,0.5)' : 'transparent';
	    div.style.position = 'absolute';
	    div.style.zIndex = 2;
	    div.style.borderStyle = 'none';

	    
	    div.addEventListener('click', this._onClick.bind(this));
	    div.addEventListener('focus', this._onFocus.bind(this));
	    div.addEventListener('focusout', this._onFocusOut.bind(this));
	}
	   	



	div.title = displayObject.accessibleTitle || 'displayObject ' + this.tabIndex;

	//
	
	displayObject._accessibleActive = true;
	displayObject._accessibleDiv = div;
	div.displayObject = displayObject;


	this.children.push(displayObject);
	this.div.appendChild( displayObject._accessibleDiv );
	displayObject._accessibleDiv.tabIndex = displayObject.tabIndex;
};


/**
 * Maps the div button press to pixi's InteractionManager (click)
 * @private
 */
AccessibilityManager.prototype._onClick = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.displayObject, 'click', interactionManager.eventData);
};

/**
 * Maps the div focus events to pixis InteractionManager (mouseover)
 * @private
 */
AccessibilityManager.prototype._onFocus = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.displayObject, 'mouseover', interactionManager.eventData);
};

/**
 * Maps the div focus events to pixis InteractionManager (mouseout)
 * @private
 */
AccessibilityManager.prototype._onFocusOut = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.displayObject, 'mouseout', interactionManager.eventData);
};

/**
 * Is called when a key is pressed
 *
 * @private
 */
AccessibilityManager.prototype._onKeyDown = function(e)
{
	if(e.keyCode !== 9)
	{
		return;
	}

	this.activate();
};

/**
 * Is called when the mouse moves across the renderer element
 *
 * @private
 */
AccessibilityManager.prototype._onMouseMove = function()
{
	this.deactivate();
};


/**
 * Destroys the accessibility manager
 *
 */
AccessibilityManager.prototype.destroy = function () 
{
	this.div = null;

	for (var i = 0; i < this.children.length; i++)
	{
		this.children[i].div = null;
	}

	
	window.document.removeEventListener('mousemove', this._onMouseMove);
	window.removeEventListener('keydown', this._onKeyDown);
		
	this.pool = null;
	this.children = null;
	this.renderer = null;

};

core.WebGLRenderer.registerPlugin('accessibility', AccessibilityManager);
core.CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);


},{"../core":29,"./accessibleTarget":20}],20:[function(require,module,exports){
/**
 * Default property values of accessible objects
 * used by {@link PIXI.accessibility.AccessibilityManager}.
 *
 * @mixin
 * @memberof PIXI
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          MyObject.prototype,
 *          PIXI.accessibility.accessibleTarget
 *      );
 */
var accessibleTarget = {
    
    /**
     * @todo Needs docs.
     */
    accessible:false,

    /**
     * @todo Needs docs.
     */
    accessibleTitle:null,

    /**
     * @todo Needs docs.
     */
    tabIndex:0,

    /**
     * @todo Needs docs.
     */
    _accessibleActive:false,

    /**
     * @todo Needs docs.
     */
    _accessibleDiv:false

};

module.exports = accessibleTarget;

},{}],21:[function(require,module,exports){
/**
 * @file        Main export of the PIXI accessibility library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.interaction
 */
module.exports = {
    accessibleTarget:     require('./accessibleTarget'),
    AccessibilityManager: require('./AccessibilityManager')
};

},{"./AccessibilityManager":19,"./accessibleTarget":20}],22:[function(require,module,exports){
/**
 * Constant values used in pixi
 *
 * @lends PIXI
 */
var CONST = {
    /**
     * String of the current PIXI version
     *
     * @static
     * @constant
     * @property {string} VERSION
     */
    VERSION: '3.0.10',

    /**
     * @property {number} PI_2 - Two Pi
     * @constant
     * @static
     */
    PI_2: Math.PI * 2,

    /**
     * @property {number} RAD_TO_DEG - Constant conversion factor for converting radians to degrees
     * @constant
     * @static
     */
    RAD_TO_DEG: 180 / Math.PI,

    /**
     * @property {Number} DEG_TO_RAD - Constant conversion factor for converting degrees to radians
     * @constant
     * @static
     */
    DEG_TO_RAD: Math.PI / 180,

    /**
     * Target frames per millisecond.
     *
     * @static
     * @constant
     * @property {number} TARGET_FPMS=0.06
     */
    TARGET_FPMS: 0.06,

    /**
     * Constant to identify the Renderer Type.
     *
     * @static
     * @constant
     * @property {object} RENDERER_TYPE
     * @property {number} RENDERER_TYPE.UNKNOWN
     * @property {number} RENDERER_TYPE.WEBGL
     * @property {number} RENDERER_TYPE.CANVAS
     */
    RENDERER_TYPE: {
        UNKNOWN:    0,
        WEBGL:      1,
        CANVAS:     2
    },

    /**
     * Various blend modes supported by PIXI. IMPORTANT - The WebGL renderer only supports
     * the NORMAL, ADD, MULTIPLY and SCREEN blend modes. Anything else will silently act like
     * NORMAL.
     *
     * @static
     * @constant
     * @property {object} BLEND_MODES
     * @property {number} BLEND_MODES.NORMAL
     * @property {number} BLEND_MODES.ADD
     * @property {number} BLEND_MODES.MULTIPLY
     * @property {number} BLEND_MODES.SCREEN
     * @property {number} BLEND_MODES.OVERLAY
     * @property {number} BLEND_MODES.DARKEN
     * @property {number} BLEND_MODES.LIGHTEN
     * @property {number} BLEND_MODES.COLOR_DODGE
     * @property {number} BLEND_MODES.COLOR_BURN
     * @property {number} BLEND_MODES.HARD_LIGHT
     * @property {number} BLEND_MODES.SOFT_LIGHT
     * @property {number} BLEND_MODES.DIFFERENCE
     * @property {number} BLEND_MODES.EXCLUSION
     * @property {number} BLEND_MODES.HUE
     * @property {number} BLEND_MODES.SATURATION
     * @property {number} BLEND_MODES.COLOR
     * @property {number} BLEND_MODES.LUMINOSITY
     */
    BLEND_MODES: {
        NORMAL:         0,
        ADD:            1,
        MULTIPLY:       2,
        SCREEN:         3,
        OVERLAY:        4,
        DARKEN:         5,
        LIGHTEN:        6,
        COLOR_DODGE:    7,
        COLOR_BURN:     8,
        HARD_LIGHT:     9,
        SOFT_LIGHT:     10,
        DIFFERENCE:     11,
        EXCLUSION:      12,
        HUE:            13,
        SATURATION:     14,
        COLOR:          15,
        LUMINOSITY:     16
    },

    /**
     * Various webgl draw modes. These can be used to specify which GL drawMode to use
     * under certain situations and renderers.
     *
     * @static
     * @constant
     * @property {object} DRAW_MODES
     * @property {number} DRAW_MODES.POINTS
     * @property {number} DRAW_MODES.LINES
     * @property {number} DRAW_MODES.LINE_LOOP
     * @property {number} DRAW_MODES.LINE_STRIP
     * @property {number} DRAW_MODES.TRIANGLES
     * @property {number} DRAW_MODES.TRIANGLE_STRIP
     * @property {number} DRAW_MODES.TRIANGLE_FAN
     */
    DRAW_MODES: {
        POINTS:         0,
        LINES:          1,
        LINE_LOOP:      2,
        LINE_STRIP:     3,
        TRIANGLES:      4,
        TRIANGLE_STRIP: 5,
        TRIANGLE_FAN:   6
    },

    /**
     * The scale modes that are supported by pixi.
     *
     * The DEFAULT scale mode affects the default scaling mode of future operations.
     * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
     *
     * @static
     * @constant
     * @property {object} SCALE_MODES
     * @property {number} SCALE_MODES.DEFAULT=LINEAR
     * @property {number} SCALE_MODES.LINEAR Smooth scaling
     * @property {number} SCALE_MODES.NEAREST Pixelating scaling
     */
    SCALE_MODES: {
        DEFAULT:    0,
        LINEAR:     0,
        NEAREST:    1
    },

    /**
     * The prefix that denotes a URL is for a retina asset
     *
     * @static
     * @constant
     * @property {string} RETINA_PREFIX
     */
    //example: '@2x',
    RETINA_PREFIX: /@(.+)x/,

    RESOLUTION:1,

    FILTER_RESOLUTION:1,

    /**
     * The default render options if none are supplied to {@link PIXI.WebGLRenderer}
     * or {@link PIXI.CanvasRenderer}.
     *
     * @static
     * @constant
     * @property {object} DEFAULT_RENDER_OPTIONS
     * @property {HTMLCanvasElement} DEFAULT_RENDER_OPTIONS.view=null
     * @property {boolean} DEFAULT_RENDER_OPTIONS.transparent=false
     * @property {boolean} DEFAULT_RENDER_OPTIONS.antialias=false
     * @property {boolean} DEFAULT_RENDER_OPTIONS.forceFXAA=false
     * @property {boolean} DEFAULT_RENDER_OPTIONS.preserveDrawingBuffer=false
     * @property {number} DEFAULT_RENDER_OPTIONS.resolution=1
     * @property {number} DEFAULT_RENDER_OPTIONS.backgroundColor=0x000000
     * @property {boolean} DEFAULT_RENDER_OPTIONS.clearBeforeRender=true
     * @property {boolean} DEFAULT_RENDER_OPTIONS.autoResize=false
     */
    DEFAULT_RENDER_OPTIONS: {
        view: null,
        resolution: 1,
        antialias: false,
        forceFXAA: false,
        autoResize: false,
        transparent: false,
        backgroundColor: 0x000000,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        roundPixels: false
    },

    /**
     * Constants that identify shapes, mainly to prevent `instanceof` calls.
     *
     * @static
     * @constant
     * @property {object} SHAPES
     * @property {object} SHAPES.POLY=0
     * @property {object} SHAPES.RECT=1
     * @property {object} SHAPES.CIRC=2
     * @property {object} SHAPES.ELIP=3
     * @property {object} SHAPES.RREC=4
     */
    SHAPES: {
        POLY: 0,
        RECT: 1,
        CIRC: 2,
        ELIP: 3,
        RREC: 4
    },

    // TODO: maybe change to SPRITE.BATCH_SIZE: 2000
    // TODO: maybe add PARTICLE.BATCH_SIZE: 15000
    SPRITE_BATCH_SIZE: 2000 //nice balance between mobile and desktop machines
};

module.exports = CONST;

},{}],23:[function(require,module,exports){
var math = require('../math'),
    utils = require('../utils'),
    DisplayObject = require('./DisplayObject'),
    RenderTexture = require('../textures/RenderTexture'),
    _tempMatrix = new math.Matrix();

/**
 * A Container represents a collection of display objects.
 * It is the base class of all display objects that act as a container for other objects.
 *
 *```js
 * var container = new PIXI.Container();
 * container.addChild(sprite);
 * ```
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI
 */
function Container()
{
    DisplayObject.call(this);

    /**
     * The array of children of this container.
     *
     * @member {PIXI.DisplayObject[]}
     * @readonly
     */
    this.children = [];
}

// constructor
Container.prototype = Object.create(DisplayObject.prototype);
Container.prototype.constructor = Container;
module.exports = Container;

Object.defineProperties(Container.prototype, {
    /**
     * The width of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Container#
     */
    width: {
        get: function ()
        {
            return this.scale.x * this.getLocalBounds().width;
        },
        set: function (value)
        {

            var width = this.getLocalBounds().width;

            if (width !== 0)
            {
                this.scale.x = value / width;
            }
            else
            {
                this.scale.x = 1;
            }


            this._width = value;
        }
    },

    /**
     * The height of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Container#
     */
    height: {
        get: function ()
        {
            return  this.scale.y * this.getLocalBounds().height;
        },
        set: function (value)
        {

            var height = this.getLocalBounds().height;

            if (height !== 0)
            {
                this.scale.y = value / height ;
            }
            else
            {
                this.scale.y = 1;
            }

            this._height = value;
        }
    }
});

/**
 * Overridable method that can be used by Container subclasses whenever the children array is modified
 *
 * @private
 */
Container.prototype.onChildrenChange = function () {};

/**
 * Adds a child to the container.
 * 
 * You can also add multple items like so: myContainer.addChild(thinkOne, thingTwo, thingThree)
 * @param child {PIXI.DisplayObject} The DisplayObject to add to the container
 * @return {PIXI.DisplayObject} The child that was added.
 */
Container.prototype.addChild = function (child)
{ 
    var argumentsLength = arguments.length;

    // if there is only one argument we can bypass looping through the them
    if(argumentsLength > 1)
    {
        // loop through the arguments property and add all children
        // use it the right way (.length and [i]) so that this function can still be optimised by JS runtimes
        for (var i = 0; i < argumentsLength; i++)
        {
            this.addChild( arguments[i] );
        }
    }     
    else
    {
        // if the child has a parent then lets remove it as Pixi objects can only exist in one place
        if (child.parent)
        {
            child.parent.removeChild(child);
        }

        child.parent = this;
        
        this.children.push(child);

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(this.children.length-1);
        child.emit('added', this);
    }

    return child;
};

/**
 * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
 *
 * @param child {PIXI.DisplayObject} The child to add
 * @param index {number} The index to place the child in
 * @return {PIXI.DisplayObject} The child that was added.
 */
Container.prototype.addChildAt = function (child, index)
{
    if (index >= 0 && index <= this.children.length)
    {
        if (child.parent)
        {
            child.parent.removeChild(child);
        }

        child.parent = this;

        this.children.splice(index, 0, child);

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index);
        child.emit('added', this);

        return child;
    }
    else
    {
        throw new Error(child + 'addChildAt: The index '+ index +' supplied is out of bounds ' + this.children.length);
    }
};

/**
 * Swaps the position of 2 Display Objects within this container.
 *
 * @param child {PIXI.DisplayObject}
 * @param child2 {PIXI.DisplayObject}
 */
Container.prototype.swapChildren = function (child, child2)
{
    if (child === child2)
    {
        return;
    }

    var index1 = this.getChildIndex(child);
    var index2 = this.getChildIndex(child2);

    if (index1 < 0 || index2 < 0)
    {
        throw new Error('swapChildren: Both the supplied DisplayObjects must be children of the caller.');
    }

    this.children[index1] = child2;
    this.children[index2] = child;
    this.onChildrenChange(index1 < index2 ? index1 : index2);
};

/**
 * Returns the index position of a child DisplayObject instance
 *
 * @param child {PIXI.DisplayObject} The DisplayObject instance to identify
 * @return {number} The index position of the child display object to identify
 */
Container.prototype.getChildIndex = function (child)
{
    var index = this.children.indexOf(child);

    if (index === -1)
    {
        throw new Error('The supplied DisplayObject must be a child of the caller');
    }

    return index;
};

/**
 * Changes the position of an existing child in the display object container
 *
 * @param child {PIXI.DisplayObject} The child DisplayObject instance for which you want to change the index number
 * @param index {number} The resulting index number for the child display object
 */
Container.prototype.setChildIndex = function (child, index)
{
    if (index < 0 || index >= this.children.length)
    {
        throw new Error('The supplied index is out of bounds');
    }

    var currentIndex = this.getChildIndex(child);

    utils.removeItems(this.children, currentIndex, 1); // remove from old position
    this.children.splice(index, 0, child); //add at new position
    this.onChildrenChange(index);
};

/**
 * Returns the child at the specified index
 *
 * @param index {number} The index to get the child at
 * @return {PIXI.DisplayObject} The child at the given index, if any.
 */
Container.prototype.getChildAt = function (index)
{
    if (index < 0 || index >= this.children.length)
    {
        throw new Error('getChildAt: Supplied index ' + index + ' does not exist in the child list, or the supplied DisplayObject is not a child of the caller');
    }

    return this.children[index];
};

/**
 * Removes a child from the container.
 *
 * @param child {PIXI.DisplayObject} The DisplayObject to remove
 * @return {PIXI.DisplayObject} The child that was removed.
 */
Container.prototype.removeChild = function (child)
{
    var argumentsLength = arguments.length;

    // if there is only one argument we can bypass looping through the them
    if(argumentsLength > 1)
    {
        // loop through the arguments property and add all children
        // use it the right way (.length and [i]) so that this function can still be optimised by JS runtimes
        for (var i = 0; i < argumentsLength; i++)
        {
            this.removeChild( arguments[i] );
        }
    }     
    else
    {   
        var index = this.children.indexOf(child);

        if (index === -1)
        {
            return;
        }

        child.parent = null;
        utils.removeItems(this.children, index, 1);

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index);
        child.emit('removed', this);
    }

    return child;
};

/**
 * Removes a child from the specified index position.
 *
 * @param index {number} The index to get the child from
 * @return {PIXI.DisplayObject} The child that was removed.
 */
Container.prototype.removeChildAt = function (index)
{
    var child = this.getChildAt(index);

    child.parent = null;
    utils.removeItems(this.children, index, 1);

    // TODO - lets either do all callbacks or all events.. not both!
    this.onChildrenChange(index);
    child.emit('removed', this);

    return child;
};

/**
 * Removes all children from this container that are within the begin and end indexes.
 *
 * @param beginIndex {number} The beginning position. Default value is 0.
 * @param endIndex {number} The ending position. Default value is size of the container.
 */
Container.prototype.removeChildren = function (beginIndex, endIndex)
{
    var begin = beginIndex || 0;
    var end = typeof endIndex === 'number' ? endIndex : this.children.length;
    var range = end - begin;
    var removed, i;

    if (range > 0 && range <= end)
    {
        removed = this.children.splice(begin, range);

        for (i = 0; i < removed.length; ++i)
        {
            removed[i].parent = null;
        }

        this.onChildrenChange(beginIndex);

        for (i = 0; i < removed.length; ++i)
        {
            removed[i].emit('removed', this);
        }

        return removed;
    }
    else if (range === 0 && this.children.length === 0)
    {
        return [];
    }
    else
    {
        throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
    }
};

/**
 * Useful function that returns a texture of the display object that can then be used to create sprites
 * This can be quite useful if your displayObject is static / complicated and needs to be reused multiple times.
 *
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} The renderer used to generate the texture.
 * @param resolution {number} The resolution of the texture being generated
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} a texture of the display object
 */
Container.prototype.generateTexture = function (renderer, resolution, scaleMode)
{
    var bounds = this.getLocalBounds();

    var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0, scaleMode, resolution);

    _tempMatrix.tx = -bounds.x;
    _tempMatrix.ty = -bounds.y;

    renderTexture.render(this, _tempMatrix);

    return renderTexture;
};

/*
 * Updates the transform on all children of this container for rendering
 *
 * @private
 */
Container.prototype.updateTransform = function ()
{
    if (!this.visible)
    {
        return;
    }

    this.displayObjectUpdateTransform();

    for (var i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].updateTransform();
    }
};

// performance increase to avoid using call.. (10x faster)
Container.prototype.containerUpdateTransform = Container.prototype.updateTransform;

/**
 * Retrieves the bounds of the Container as a rectangle. The bounds calculation takes all visible children into consideration.
 *
 * @return {PIXI.Rectangle} The rectangular bounding area
 */
Container.prototype.getBounds = function ()
{
    if(!this._currentBounds)
    {

        if (this.children.length === 0)
        {
            return math.Rectangle.EMPTY;
        }

        // TODO the bounds have already been calculated this render session so return what we have

        var minX = Infinity;
        var minY = Infinity;

        var maxX = -Infinity;
        var maxY = -Infinity;

        var childBounds;
        var childMaxX;
        var childMaxY;

        var childVisible = false;

        for (var i = 0, j = this.children.length; i < j; ++i)
        {
            var child = this.children[i];

            if (!child.visible)
            {
                continue;
            }

            childVisible = true;

            childBounds = this.children[i].getBounds();

            minX = minX < childBounds.x ? minX : childBounds.x;
            minY = minY < childBounds.y ? minY : childBounds.y;

            childMaxX = childBounds.width + childBounds.x;
            childMaxY = childBounds.height + childBounds.y;

            maxX = maxX > childMaxX ? maxX : childMaxX;
            maxY = maxY > childMaxY ? maxY : childMaxY;
        }

        if (!childVisible)
        {
            return math.Rectangle.EMPTY;
        }

        var bounds = this._bounds;

        bounds.x = minX;
        bounds.y = minY;
        bounds.width = maxX - minX;
        bounds.height = maxY - minY;

        this._currentBounds = bounds;
    }

    return this._currentBounds;
};

Container.prototype.containerGetBounds = Container.prototype.getBounds;

/**
 * Retrieves the non-global local bounds of the Container as a rectangle.
 * The calculation takes all visible children into consideration.
 *
 * @return {PIXI.Rectangle} The rectangular bounding area
 */
Container.prototype.getLocalBounds = function ()
{
    var matrixCache = this.worldTransform;

    this.worldTransform = math.Matrix.IDENTITY;

    for (var i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].updateTransform();
    }

    this.worldTransform = matrixCache;

    this._currentBounds = null;

    return this.getBounds( math.Matrix.IDENTITY );
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 */
Container.prototype.renderWebGL = function (renderer)
{

    // if the object is not visible or the alpha is 0 then no need to render this element
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
    {
        return;
    }

    var i, j;

    // do a quick check to see if this element has a mask or a filter.
    if (this._mask || this._filters)
    {
        renderer.currentRenderer.flush();

        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (this._filters && this._filters.length)
        {
            renderer.filterManager.pushFilter(this, this._filters);
        }

        if (this._mask)
        {
            renderer.maskManager.pushMask(this, this._mask);
        }

        renderer.currentRenderer.start();

        // add this object to the batch, only rendered if it has a texture.
        this._renderWebGL(renderer);

        // now loop through the children and make sure they get rendered
        for (i = 0, j = this.children.length; i < j; i++)
        {
            this.children[i].renderWebGL(renderer);
        }

        renderer.currentRenderer.flush();

        if (this._mask)
        {
            renderer.maskManager.popMask(this, this._mask);
        }

        if (this._filters)
        {
            renderer.filterManager.popFilter();

        }
        renderer.currentRenderer.start();
    }
    else
    {
        this._renderWebGL(renderer);

        // simple render children!
        for (i = 0, j = this.children.length; i < j; ++i)
        {
            this.children[i].renderWebGL(renderer);
        }
    }
};

/**
 * To be overridden by the subclass
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 * @private
 */
Container.prototype._renderWebGL = function (renderer) // jshint unused:false
{
    // this is where content itself gets rendered...
};

/**
 * To be overridden by the subclass
 *
 * @param renderer {PIXI.CanvasRenderer} The renderer
 * @private
 */
Container.prototype._renderCanvas = function (renderer) // jshint unused:false
{
    // this is where content itself gets rendered...
};


/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} The renderer
 */
Container.prototype.renderCanvas = function (renderer)
{
    // if not visible or the alpha is 0 then no need to render this
    if (!this.visible || this.alpha <= 0 || !this.renderable)
    {
        return;
    }

    if (this._mask)
    {
        renderer.maskManager.pushMask(this._mask, renderer);
    }

    this._renderCanvas(renderer);
    for (var i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].renderCanvas(renderer);
    }

    if (this._mask)
    {
        renderer.maskManager.popMask(renderer);
    }
};

/**
 * Destroys the container
 * @param [destroyChildren=false] {boolean} if set to true, all the children will have their destroy method called as well
 */
Container.prototype.destroy = function (destroyChildren)
{
    DisplayObject.prototype.destroy.call(this);

    if (destroyChildren)
    {
        for (var i = 0, j = this.children.length; i < j; ++i)
        {
            this.children[i].destroy(destroyChildren);
        }
    }

    this.removeChildren();

    this.children = null;
};

},{"../math":33,"../textures/RenderTexture":71,"../utils":77,"./DisplayObject":24}],24:[function(require,module,exports){
var math = require('../math'),
    RenderTexture = require('../textures/RenderTexture'),
    EventEmitter = require('eventemitter3'),
    CONST = require('../const'),
    _tempMatrix = new math.Matrix(),
    _tempDisplayObjectParent = {worldTransform:new math.Matrix(), worldAlpha:1, children:[]};


/**
 * The base class for all objects that are rendered on the screen.
 * This is an abstract class and should not be used on its own rather it should be extended.
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 */
function DisplayObject()
{
    EventEmitter.call(this);

    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @member {PIXI.Point}
     */
    this.position = new math.Point();

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.Point}
     */
    this.scale = new math.Point(1, 1);

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.Point}
     */
    this.pivot = new math.Point(0, 0);


    /**
     * The skew factor for the object in radians.
     *
     * @member {PIXI.Point}
     */
    this.skew = new math.Point(0, 0);

    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     */
    this.rotation = 0;

    /**
     * The opacity of the object.
     *
     * @member {number}
     */
    this.alpha = 1;

    /**
     * The visibility of the object. If false the object will not be drawn, and
     * the updateTransform function will not be called.
     *
     * @member {boolean}
     */
    this.visible = true;

    /**
     * Can this object be rendered, if false the object will not be drawn but the updateTransform
     * methods will still be called.
     *
     * @member {boolean}
     */
    this.renderable = true;

    /**
     * The display object container that contains this display object.
     *
     * @member {PIXI.Container}
     * @readOnly
     */
    this.parent = null;

    /**
     * The multiplied alpha of the displayObject
     *
     * @member {number}
     * @readOnly
     */
    this.worldAlpha = 1;

    /**
     * Current transform of the object based on world (parent) factors
     *
     * @member {PIXI.Matrix}
     * @readOnly
     */
    this.worldTransform = new math.Matrix();

    /**
     * The area the filter is applied to. This is used as more of an optimisation
     * rather than figuring out the dimensions of the displayObject each frame you can set this rectangle
     *
     * @member {PIXI.Rectangle}
     */
    this.filterArea = null;

    /**
     * cached sin rotation
     *
     * @member {number}
     * @private
     */
    this._sr = 0;

    /**
     * cached cos rotation
     *
     * @member {number}
     * @private
     */
    this._cr = 1;

    /**
     * The original, cached bounds of the object
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._bounds = new math.Rectangle(0, 0, 1, 1);

    /**
     * The most up-to-date bounds of the object
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._currentBounds = null;

    /**
     * The original, cached mask of the object
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._mask = null;
}

// constructor
DisplayObject.prototype = Object.create(EventEmitter.prototype);
DisplayObject.prototype.constructor = DisplayObject;
module.exports = DisplayObject;

Object.defineProperties(DisplayObject.prototype, {
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    x: {
        get: function ()
        {
            return this.position.x;
        },
        set: function (value)
        {
            this.position.x = value;
        }
    },

    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    y: {
        get: function ()
        {
            return this.position.y;
        },
        set: function (value)
        {
            this.position.y = value;
        }
    },

    /**
     * Indicates if the sprite is globally visible.
     *
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     * @readonly
     */
    worldVisible: {
        get: function ()
        {
            var item = this;

            do {
                if (!item.visible)
                {
                    return false;
                }

                item = item.parent;
            } while (item);

            return true;
        }
    },

    /**
     * Sets a mask for the displayObject. A mask is an object that limits the visibility of an object to the shape of the mask applied to it.
     * In PIXI a regular mask must be a PIXI.Graphics or a PIXI.Sprite object. This allows for much faster masking in canvas as it utilises shape clipping.
     * To remove a mask, set this property to null.
     *
     * @todo For the moment, PIXI.CanvasRenderer doesn't support PIXI.Sprite as mask.
     *
     * @member {PIXI.Graphics|PIXI.Sprite}
     * @memberof PIXI.DisplayObject#
     */
    mask: {
        get: function ()
        {
            return this._mask;
        },
        set: function (value)
        {
            if (this._mask)
            {
                this._mask.renderable = true;
            }

            this._mask = value;

            if (this._mask)
            {
                this._mask.renderable = false;
            }
        }
    },

    /**
     * Sets the filters for the displayObject.
     * * IMPORTANT: This is a webGL only feature and will be ignored by the canvas renderer.
     * To remove filters simply set this property to 'null'
     *
     * @member {PIXI.AbstractFilter[]}
     * @memberof PIXI.DisplayObject#
     */
    filters: {
        get: function ()
        {
            return this._filters && this._filters.slice();
        },
        set: function (value)
        {
            this._filters = value && value.slice();
        }
    }

});

/*
 * Updates the object transform for rendering
 *
 * TODO - Optimization pass!
 */
DisplayObject.prototype.updateTransform = function ()
{
    // create some matrix refs for easy access
    var pt = this.parent.worldTransform;
    var wt = this.worldTransform;

    // temporary matrix variables
    var a, b, c, d, tx, ty;

    // looks like we are skewing
    if(this.skew.x || this.skew.y)
    {
        // I'm assuming that skewing is not going to be very common
        // With that in mind, we can do a full setTransform using the temp matrix
        _tempMatrix.setTransform(
            this.position.x,
            this.position.y,
            this.pivot.x,
            this.pivot.y,
            this.scale.x,
            this.scale.y,
            this.rotation,
            this.skew.x,
            this.skew.y
        );

        // now concat the matrix (inlined so that we can avoid using copy)
        wt.a  = _tempMatrix.a  * pt.a + _tempMatrix.b  * pt.c;
        wt.b  = _tempMatrix.a  * pt.b + _tempMatrix.b  * pt.d;
        wt.c  = _tempMatrix.c  * pt.a + _tempMatrix.d  * pt.c;
        wt.d  = _tempMatrix.c  * pt.b + _tempMatrix.d  * pt.d;
        wt.tx = _tempMatrix.tx * pt.a + _tempMatrix.ty * pt.c + pt.tx;
        wt.ty = _tempMatrix.tx * pt.b + _tempMatrix.ty * pt.d + pt.ty;
    }
    else
    {
        // so if rotation is between 0 then we can simplify the multiplication process...
        if (this.rotation % CONST.PI_2)
        {
            // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
            if (this.rotation !== this.rotationCache)
            {
                this.rotationCache = this.rotation;
                this._sr = Math.sin(this.rotation);
                this._cr = Math.cos(this.rotation);
            }

            // get the matrix values of the displayobject based on its transform properties..
            a  =  this._cr * this.scale.x;
            b  =  this._sr * this.scale.x;
            c  = -this._sr * this.scale.y;
            d  =  this._cr * this.scale.y;
            tx =  this.position.x;
            ty =  this.position.y;

            // check for pivot.. not often used so geared towards that fact!
            if (this.pivot.x || this.pivot.y)
            {
                tx -= this.pivot.x * a + this.pivot.y * c;
                ty -= this.pivot.x * b + this.pivot.y * d;
            }

            // concat the parent matrix with the objects transform.
            wt.a  = a  * pt.a + b  * pt.c;
            wt.b  = a  * pt.b + b  * pt.d;
            wt.c  = c  * pt.a + d  * pt.c;
            wt.d  = c  * pt.b + d  * pt.d;
            wt.tx = tx * pt.a + ty * pt.c + pt.tx;
            wt.ty = tx * pt.b + ty * pt.d + pt.ty;
        }
        else
        {
            // lets do the fast version as we know there is no rotation..
            a  = this.scale.x;
            d  = this.scale.y;

            tx = this.position.x - this.pivot.x * a;
            ty = this.position.y - this.pivot.y * d;

            wt.a  = a  * pt.a;
            wt.b  = a  * pt.b;
            wt.c  = d  * pt.c;
            wt.d  = d  * pt.d;
            wt.tx = tx * pt.a + ty * pt.c + pt.tx;
            wt.ty = tx * pt.b + ty * pt.d + pt.ty;
        }
    }

    // multiply the alphas..
    this.worldAlpha = this.alpha * this.parent.worldAlpha;

    // reset the bounds each time this is called!
    this._currentBounds = null;
};

// performance increase to avoid using call.. (10x faster)
DisplayObject.prototype.displayObjectUpdateTransform = DisplayObject.prototype.updateTransform;

/**
 *
 *
 * Retrieves the bounds of the displayObject as a rectangle object
 *
 * @param matrix {PIXI.Matrix}
 * @return {PIXI.Rectangle} the rectangular bounding area
 */
DisplayObject.prototype.getBounds = function (matrix) // jshint unused:false
{
    return math.Rectangle.EMPTY;
};

/**
 * Retrieves the local bounds of the displayObject as a rectangle object
 *
 * @return {PIXI.Rectangle} the rectangular bounding area
 */
DisplayObject.prototype.getLocalBounds = function ()
{
    return this.getBounds(math.Matrix.IDENTITY);
};

/**
 * Calculates the global position of the display object
 *
 * @param position {PIXI.Point} The world origin to calculate from
 * @return {PIXI.Point} A point object representing the position of this object
 */
DisplayObject.prototype.toGlobal = function (position)
{
    // this parent check is for just in case the item is a root object.
    // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
    // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
    if(!this.parent)
    {
        this.parent = _tempDisplayObjectParent;
        this.displayObjectUpdateTransform();
        this.parent = null;
    }
    else
    {
        this.displayObjectUpdateTransform();
    }

    // don't need to update the lot
    return this.worldTransform.apply(position);
};

/**
 * Calculates the local position of the display object relative to another point
 *
 * @param position {PIXI.Point} The world origin to calculate from
 * @param [from] {PIXI.DisplayObject} The DisplayObject to calculate the global position from
 * @param [point] {PIXI.Point} A Point object in which to store the value, optional (otherwise will create a new Point)
 * @return {PIXI.Point} A point object representing the position of this object
 */
DisplayObject.prototype.toLocal = function (position, from, point)
{
    if (from)
    {
        position = from.toGlobal(position);
    }

    // this parent check is for just in case the item is a root object.
    // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
    // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
    if(!this.parent)
    {
        this.parent = _tempDisplayObjectParent;
        this.displayObjectUpdateTransform();
        this.parent = null;
    }
    else
    {
        this.displayObjectUpdateTransform();
    }

    // simply apply the matrix..
    return this.worldTransform.applyInverse(position, point);
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 * @private
 */
DisplayObject.prototype.renderWebGL = function (renderer) // jshint unused:false
{
    // OVERWRITE;
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} The renderer
 * @private
 */
DisplayObject.prototype.renderCanvas = function (renderer) // jshint unused:false
{
    // OVERWRITE;
};
/**
 * Useful function that returns a texture of the display object that can then be used to create sprites
 * This can be quite useful if your displayObject is static / complicated and needs to be reused multiple times.
 *
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} The renderer used to generate the texture.
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param resolution {number} The resolution of the texture being generated
 * @return {PIXI.Texture} a texture of the display object
 */
DisplayObject.prototype.generateTexture = function (renderer, scaleMode, resolution)
{
    var bounds = this.getLocalBounds();

    var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0, scaleMode, resolution);

    _tempMatrix.tx = -bounds.x;
    _tempMatrix.ty = -bounds.y;

    renderTexture.render(this, _tempMatrix);

    return renderTexture;
};

/**
 * Set the parent Container of this DisplayObject
 *
 * @param container {Container} The Container to add this DisplayObject to
 * @return {Container} The Container that this DisplayObject was added to
 */
DisplayObject.prototype.setParent = function (container)
{
    if (!container || !container.addChild)
    {
        throw new Error('setParent: Argument must be a Container');
    }

    container.addChild(this);
    return container;
};

/**
 * Convenience function to set the postion, scale, skew and pivot at once.
 *
 * @param [x=0] {number} The X position
 * @param [y=0] {number} The Y position
 * @param [scaleX=1] {number} The X scale value
 * @param [scaleY=1] {number} The Y scale value
 * @param [rotation=0] {number} The rotation
 * @param [skewX=0] {number} The X skew value
 * @param [skewY=0] {number} The Y skew value
 * @param [pivotX=0] {number} The X pivot value
 * @param [pivotY=0] {number} The Y pivot value
 * @return {PIXI.DisplayObject}
 */
DisplayObject.prototype.setTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY) //jshint ignore:line
{
    this.position.x = x || 0;
    this.position.y = y || 0;
    this.scale.x = !scaleX ? 1 : scaleX;
    this.scale.y = !scaleY ? 1 : scaleY;
    this.rotation = rotation || 0;
    this.skew.x = skewX || 0;
    this.skew.y = skewY || 0;
    this.pivot.x = pivotX || 0;
    this.pivot.y = pivotY || 0;
    return this;
};

/**
 * Base destroy method for generic display objects
 *
 */
DisplayObject.prototype.destroy = function ()
{

    this.position = null;
    this.scale = null;
    this.pivot = null;
    this.skew = null;

    this.parent = null;

    this._bounds = null;
    this._currentBounds = null;
    this._mask = null;

    this.worldTransform = null;
    this.filterArea = null;
};

},{"../const":22,"../math":33,"../textures/RenderTexture":71,"eventemitter3":10}],25:[function(require,module,exports){
var Container = require('../display/Container'),
    Texture = require('../textures/Texture'),
    CanvasBuffer = require('../renderers/canvas/utils/CanvasBuffer'),
    CanvasGraphics = require('../renderers/canvas/utils/CanvasGraphics'),
    GraphicsData = require('./GraphicsData'),
    math = require('../math'),
    CONST = require('../const'),
    tempPoint = new math.Point();

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
function Graphics()
{
    Container.call(this);

    /**
     * The alpha value used when filling the Graphics object.
     *
     * @member {number}
     * @default 1
     */
    this.fillAlpha = 1;

    /**
     * The width (thickness) of any lines drawn.
     *
     * @member {number}
     * @default 0
     */
    this.lineWidth = 0;

    /**
     * The color of any lines drawn.
     *
     * @member {string}
     * @default 0
     */
    this.lineColor = 0;

    /**
     * Graphics data
     *
     * @member {PIXI.GraphicsData[]}
     * @private
     */
    this.graphicsData = [];

    /**
     * The tint applied to the graphic shape. This is a hex value. Apply a value of 0xFFFFFF to reset the tint.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    this.tint = 0xFFFFFF;

    /**
     * The previous tint applied to the graphic shape. Used to compare to the current tint and check if theres change.
     *
     * @member {number}
     * @private
     * @default 0xFFFFFF
     */
    this._prevTint = 0xFFFFFF;

    /**
     * The blend mode to be applied to the graphic shape. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL;
     * @see PIXI.BLEND_MODES
     */
    this.blendMode = CONST.BLEND_MODES.NORMAL;

    /**
     * Current path
     *
     * @member {PIXI.GraphicsData}
     * @private
     */
    this.currentPath = null;

    /**
     * Array containing some WebGL-related properties used by the WebGL renderer.
     *
     * @member {object<number, object>}
     * @private
     */
    // TODO - _webgl should use a prototype object, not a random undocumented object...
    this._webGL = {};

    /**
     * Whether this shape is being used as a mask.
     *
     * @member {boolean}
     */
    this.isMask = false;

    /**
     * The bounds' padding used for bounds calculation.
     *
     * @member {number}
     */
    this.boundsPadding = 0;

    /**
     * A cache of the local bounds to prevent recalculation.
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._localBounds = new math.Rectangle(0,0,1,1);

    /**
     * Used to detect if the graphics object has changed. If this is set to true then the graphics
     * object will be recalculated.
     *
     * @member {boolean}
     * @private
     */
    this.dirty = true;

    /**
     * Used to detect if the WebGL graphics object has changed. If this is set to true then the
     * graphics object will be recalculated.
     *
     * @member {boolean}
     * @private
     */
    this.glDirty = false;

    this.boundsDirty = true;

    /**
     * Used to detect if the cached sprite object needs to be updated.
     *
     * @member {boolean}
     * @private
     */
    this.cachedSpriteDirty = false;

    /**
     * When cacheAsBitmap is set to true the graphics object will be rendered as if it was a sprite.
     * This is useful if your graphics element does not change often, as it will speed up the rendering
     * of the object in exchange for taking up texture memory. It is also useful if you need the graphics
     * object to be anti-aliased, because it will be rendered using canvas. This is not recommended if
     * you are constantly redrawing the graphics element.
     *
     * @name cacheAsBitmap
     * @member {boolean}
     * @memberof PIXI.Graphics#
     * @default false
     */
}

// constructor
Graphics.prototype = Object.create(Container.prototype);
Graphics.prototype.constructor = Graphics;
module.exports = Graphics;

/**
 * Creates a new Graphics object with the same values as this one.
 * Note that the only the properties of the object are cloned, not its transform (position,scale,etc)
 *
 * @return {PIXI.Graphics}
 */
Graphics.prototype.clone = function ()
{
    var clone = new Graphics();

    clone.renderable    = this.renderable;
    clone.fillAlpha     = this.fillAlpha;
    clone.lineWidth     = this.lineWidth;
    clone.lineColor     = this.lineColor;
    clone.tint          = this.tint;
    clone.blendMode     = this.blendMode;
    clone.isMask        = this.isMask;
    clone.boundsPadding = this.boundsPadding;
    clone.dirty         = true;
    clone.glDirty       = true;
    clone.cachedSpriteDirty = this.cachedSpriteDirty;

    // copy graphics data
    for (var i = 0; i < this.graphicsData.length; ++i)
    {
        clone.graphicsData.push(this.graphicsData[i].clone());
    }

    clone.currentPath = clone.graphicsData[clone.graphicsData.length - 1];

    clone.updateLocalBounds();

    return clone;
};

/**
 * Specifies the line style used for subsequent calls to Graphics methods such as the lineTo() method or the drawCircle() method.
 *
 * @param lineWidth {number} width of the line to draw, will update the objects stored style
 * @param color {number} color of the line to draw, will update the objects stored style
 * @param alpha {number} alpha of the line to draw, will update the objects stored style
 * @return {PIXI.Graphics}
 */
Graphics.prototype.lineStyle = function (lineWidth, color, alpha)
{
    this.lineWidth = lineWidth || 0;
    this.lineColor = color || 0;
    this.lineAlpha = (alpha === undefined) ? 1 : alpha;

    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length)
        {
            // halfway through a line? start a new one!
            var shape = new math.Polygon(this.currentPath.shape.points.slice(-2));
            shape.closed = false;
            this.drawShape(shape);
        }
        else
        {
            // otherwise its empty so lets just set the line properties
            this.currentPath.lineWidth = this.lineWidth;
            this.currentPath.lineColor = this.lineColor;
            this.currentPath.lineAlpha = this.lineAlpha;
        }
    }

    return this;
};

/**
 * Moves the current drawing position to x, y.
 *
 * @param x {number} the X coordinate to move to
 * @param y {number} the Y coordinate to move to
 * @return {PIXI.Graphics}
  */
Graphics.prototype.moveTo = function (x, y)
{
    var shape = new math.Polygon([x,y]);
    shape.closed = false;
    this.drawShape(shape);

    return this;
};

/**
 * Draws a line using the current line style from the current drawing position to (x, y);
 * The current drawing position is then set to (x, y).
 *
 * @param x {number} the X coordinate to draw to
 * @param y {number} the Y coordinate to draw to
 * @return {PIXI.Graphics}
 */
Graphics.prototype.lineTo = function (x, y)
{
    this.currentPath.shape.points.push(x, y);
    this.dirty = true;

    return this;
};

/**
 * Calculate the points for a quadratic bezier curve and then draws it.
 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
 *
 * @param cpX {number} Control point x
 * @param cpY {number} Control point y
 * @param toX {number} Destination point x
 * @param toY {number} Destination point y
 * @return {PIXI.Graphics}
 */
Graphics.prototype.quadraticCurveTo = function (cpX, cpY, toX, toY)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points = [0, 0];
        }
    }
    else
    {
        this.moveTo(0,0);
    }

    var xa,
        ya,
        n = 20,
        points = this.currentPath.shape.points;

    if (points.length === 0)
    {
        this.moveTo(0, 0);
    }

    var fromX = points[points.length-2];
    var fromY = points[points.length-1];

    var j = 0;
    for (var i = 1; i <= n; ++i)
    {
        j = i / n;

        xa = fromX + ( (cpX - fromX) * j );
        ya = fromY + ( (cpY - fromY) * j );

        points.push( xa + ( ((cpX + ( (toX - cpX) * j )) - xa) * j ),
                     ya + ( ((cpY + ( (toY - cpY) * j )) - ya) * j ) );
    }

    this.dirty = this.boundsDirty = true;

    return this;
};

/**
 * Calculate the points for a bezier curve and then draws it.
 *
 * @param cpX {number} Control point x
 * @param cpY {number} Control point y
 * @param cpX2 {number} Second Control point x
 * @param cpY2 {number} Second Control point y
 * @param toX {number} Destination point x
 * @param toY {number} Destination point y
 * @return {PIXI.Graphics}
 */
Graphics.prototype.bezierCurveTo = function (cpX, cpY, cpX2, cpY2, toX, toY)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points = [0, 0];
        }
    }
    else
    {
        this.moveTo(0,0);
    }

    var n = 20,
        dt,
        dt2,
        dt3,
        t2,
        t3,
        points = this.currentPath.shape.points;

    var fromX = points[points.length-2];
    var fromY = points[points.length-1];

    var j = 0;

    for (var i = 1; i <= n; ++i)
    {
        j = i / n;

        dt = (1 - j);
        dt2 = dt * dt;
        dt3 = dt2 * dt;

        t2 = j * j;
        t3 = t2 * j;

        points.push( dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX,
                     dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY);
    }

    this.dirty = this.boundsDirty = true;

    return this;
};

/**
 * The arcTo() method creates an arc/curve between two tangents on the canvas.
 *
 * "borrowed" from https://code.google.com/p/fxcanvas/ - thanks google!
 *
 * @param x1 {number} The x-coordinate of the beginning of the arc
 * @param y1 {number} The y-coordinate of the beginning of the arc
 * @param x2 {number} The x-coordinate of the end of the arc
 * @param y2 {number} The y-coordinate of the end of the arc
 * @param radius {number} The radius of the arc
 * @return {PIXI.Graphics}
 */
Graphics.prototype.arcTo = function (x1, y1, x2, y2, radius)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points.push(x1, y1);
        }
    }
    else
    {
        this.moveTo(x1, y1);
    }

    var points = this.currentPath.shape.points,
        fromX = points[points.length-2],
        fromY = points[points.length-1],
        a1 = fromY - y1,
        b1 = fromX - x1,
        a2 = y2   - y1,
        b2 = x2   - x1,
        mm = Math.abs(a1 * b2 - b1 * a2);

    if (mm < 1.0e-8 || radius === 0)
    {
        if (points[points.length-2] !== x1 || points[points.length-1] !== y1)
        {
            points.push(x1, y1);
        }
    }
    else
    {
        var dd = a1 * a1 + b1 * b1,
            cc = a2 * a2 + b2 * b2,
            tt = a1 * a2 + b1 * b2,
            k1 = radius * Math.sqrt(dd) / mm,
            k2 = radius * Math.sqrt(cc) / mm,
            j1 = k1 * tt / dd,
            j2 = k2 * tt / cc,
            cx = k1 * b2 + k2 * b1,
            cy = k1 * a2 + k2 * a1,
            px = b1 * (k2 + j1),
            py = a1 * (k2 + j1),
            qx = b2 * (k1 + j2),
            qy = a2 * (k1 + j2),
            startAngle = Math.atan2(py - cy, px - cx),
            endAngle   = Math.atan2(qy - cy, qx - cx);

        this.arc(cx + x1, cy + y1, radius, startAngle, endAngle, b1 * a2 > b2 * a1);
    }

    this.dirty = this.boundsDirty = true;

    return this;
};

/**
 * The arc method creates an arc/curve (used to create circles, or parts of circles).
 *
 * @param cx {number} The x-coordinate of the center of the circle
 * @param cy {number} The y-coordinate of the center of the circle
 * @param radius {number} The radius of the circle
 * @param startAngle {number} The starting angle, in radians (0 is at the 3 o'clock position of the arc's circle)
 * @param endAngle {number} The ending angle, in radians
 * @param anticlockwise {boolean} Optional. Specifies whether the drawing should be counterclockwise or clockwise. False is default, and indicates clockwise, while true indicates counter-clockwise.
 * @return {PIXI.Graphics}
 */
Graphics.prototype.arc = function(cx, cy, radius, startAngle, endAngle, anticlockwise)
{
    anticlockwise = anticlockwise || false;

    if (startAngle === endAngle)
    {
        return this;
    }

    if( !anticlockwise && endAngle <= startAngle )
    {
        endAngle += Math.PI * 2;
    }
    else if( anticlockwise && startAngle <= endAngle )
    {
        startAngle += Math.PI * 2;
    }

    var sweep = anticlockwise ? (startAngle - endAngle) * -1 : (endAngle - startAngle);
    var segs =  Math.ceil(Math.abs(sweep) / (Math.PI * 2)) * 40;

    if(sweep === 0)
    {
        return this;
    }

    var startX = cx + Math.cos(startAngle) * radius;
    var startY = cy + Math.sin(startAngle) * radius;

    if (this.currentPath)
    {
        this.currentPath.shape.points.push(startX, startY);
    }
    else
    {
        this.moveTo(startX, startY);
    }

    var points = this.currentPath.shape.points;

    var theta = sweep/(segs*2);
    var theta2 = theta*2;

    var cTheta = Math.cos(theta);
    var sTheta = Math.sin(theta);

    var segMinus = segs - 1;

    var remainder = ( segMinus % 1 ) / segMinus;

    for(var i=0; i<=segMinus; i++)
    {
        var real =  i + remainder * i;


        var angle = ((theta) + startAngle + (theta2 * real));

        var c = Math.cos(angle);
        var s = -Math.sin(angle);

        points.push(( (cTheta *  c) + (sTheta * s) ) * radius + cx,
                    ( (cTheta * -s) + (sTheta * c) ) * radius + cy);
    }

    this.dirty = this.boundsDirty = true;

    return this;
};

/**
 * Specifies a simple one-color fill that subsequent calls to other Graphics methods
 * (such as lineTo() or drawCircle()) use when drawing.
 *
 * @param color {number} the color of the fill
 * @param alpha {number} the alpha of the fill
 * @return {PIXI.Graphics}
 */
Graphics.prototype.beginFill = function (color, alpha)
{
    this.filling = true;
    this.fillColor = color || 0;
    this.fillAlpha = (alpha === undefined) ? 1 : alpha;

    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length <= 2)
        {
            this.currentPath.fill = this.filling;
            this.currentPath.fillColor = this.fillColor;
            this.currentPath.fillAlpha = this.fillAlpha;
        }
    }
    return this;
};

/**
 * Applies a fill to the lines and shapes that were added since the last call to the beginFill() method.
 *
 * @return {Graphics}
 */
Graphics.prototype.endFill = function ()
{
    this.filling = false;
    this.fillColor = null;
    this.fillAlpha = 1;

    return this;
};

/**
 *
 * @param x {number} The X coord of the top-left of the rectangle
 * @param y {number} The Y coord of the top-left of the rectangle
 * @param width {number} The width of the rectangle
 * @param height {number} The height of the rectangle
 * @return {PIXI.Graphics}
 */
Graphics.prototype.drawRect = function ( x, y, width, height )
{
    this.drawShape(new math.Rectangle(x,y, width, height));

    return this;
};

/**
 *
 * @param x {number} The X coord of the top-left of the rectangle
 * @param y {number} The Y coord of the top-left of the rectangle
 * @param width {number} The width of the rectangle
 * @param height {number} The height of the rectangle
 * @param radius {number} Radius of the rectangle corners
 * @return {PIXI.Graphics}
 */
Graphics.prototype.drawRoundedRect = function ( x, y, width, height, radius )
{
    this.drawShape(new math.RoundedRectangle(x, y, width, height, radius));

    return this;
};

/**
 * Draws a circle.
 *
 * @param x {number} The X coordinate of the center of the circle
 * @param y {number} The Y coordinate of the center of the circle
 * @param radius {number} The radius of the circle
 * @return {PIXI.Graphics}
 */
Graphics.prototype.drawCircle = function (x, y, radius)
{
    this.drawShape(new math.Circle(x,y, radius));

    return this;
};

/**
 * Draws an ellipse.
 *
 * @param x {number} The X coordinate of the center of the ellipse
 * @param y {number} The Y coordinate of the center of the ellipse
 * @param width {number} The half width of the ellipse
 * @param height {number} The half height of the ellipse
 * @return {PIXI.Graphics}
 */
Graphics.prototype.drawEllipse = function (x, y, width, height)
{
    this.drawShape(new math.Ellipse(x, y, width, height));

    return this;
};

/**
 * Draws a polygon using the given path.
 *
 * @param path {number[]|PIXI.Point[]} The path data used to construct the polygon.
 * @return {PIXI.Graphics}
 */
Graphics.prototype.drawPolygon = function (path)
{
    // prevents an argument assignment deopt
    // see section 3.1: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    var points = path;

    var closed = true;

    if (points instanceof math.Polygon)
    {
        closed = points.closed;
        points = points.points;
    }

    if (!Array.isArray(points))
    {
        // prevents an argument leak deopt
        // see section 3.2: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
        points = new Array(arguments.length);

        for (var i = 0; i < points.length; ++i)
        {
            points[i] = arguments[i];
        }
    }

    var shape = new math.Polygon(points);
    shape.closed = closed;

    this.drawShape(shape);

    return this;
};

/**
 * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
 *
 * @return {PIXI.Graphics}
 */
Graphics.prototype.clear = function ()
{
    this.lineWidth = 0;
    this.filling = false;

    this.dirty = true;
    this.clearDirty = true;
    this.graphicsData = [];

    return this;
};

/**
 * Useful function that returns a texture of the graphics object that can then be used to create sprites
 * This can be quite useful if your geometry is complicated and needs to be reused multiple times.
 *
 * @param resolution {number} The resolution of the texture being generated
 * @param scaleMode {number} Should be one of the scaleMode consts
 * @return {PIXI.Texture} a texture of the graphics object
 */
Graphics.prototype.generateTexture = function (renderer, resolution, scaleMode)
{

    resolution = resolution || 1;

    var bounds = this.getLocalBounds();

    var canvasBuffer = new CanvasBuffer(bounds.width * resolution, bounds.height * resolution);

    var texture = Texture.fromCanvas(canvasBuffer.canvas, scaleMode);
    texture.baseTexture.resolution = resolution;

    canvasBuffer.context.scale(resolution, resolution);

    canvasBuffer.context.translate(-bounds.x,-bounds.y);

    CanvasGraphics.renderGraphics(this, canvasBuffer.context);

    return texture;
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer}
 * @private
 */
Graphics.prototype._renderWebGL = function (renderer)
{
    // if the sprite is not visible or the alpha is 0 then no need to render this element

    // this code may still be needed so leaving for now..
    //
    /*
    if (this._cacheAsBitmap)
    {
        if (this.dirty || this.cachedSpriteDirty)
        {
            this._generateCachedSprite();

            // we will also need to update the texture on the gpu too!
            this.updateCachedSpriteTexture();

            this.cachedSpriteDirty = false;
            this.dirty = false;
        }

        this._cachedSprite.worldAlpha = this.worldAlpha;

        Sprite.prototype.renderWebGL.call(this._cachedSprite, renderer);

        return;
    }

    */

    if (this.glDirty)
    {
        this.dirty = true;
        this.glDirty = false;
    }

    renderer.setObjectRenderer(renderer.plugins.graphics);
    renderer.plugins.graphics.render(this);

};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer}
 * @private
 */
Graphics.prototype._renderCanvas = function (renderer)
{
    if (this.isMask === true)
    {
        return;
    }

    // if the tint has changed, set the graphics object to dirty.
    if (this._prevTint !== this.tint) {
        this.dirty = true;
    }

    // this code may still be needed so leaving for now..
    //
    /*
    if (this._cacheAsBitmap)
    {
        if (this.dirty || this.cachedSpriteDirty)
        {
            this._generateCachedSprite();

            // we will also need to update the texture
            this.updateCachedSpriteTexture();

            this.cachedSpriteDirty = false;
            this.dirty = false;
        }

        this._cachedSprite.alpha = this.alpha;

        Sprite.prototype._renderCanvas.call(this._cachedSprite, renderer);

        return;
    }
    */
    var context = renderer.context;
    var transform = this.worldTransform;

    var compositeOperation = renderer.blendModes[this.blendMode];
    if (compositeOperation !== context.globalCompositeOperation)
    {
        context.globalCompositeOperation = compositeOperation;
    }

    var resolution = renderer.resolution;
    context.setTransform(
        transform.a * resolution,
        transform.b * resolution,
        transform.c * resolution,
        transform.d * resolution,
        transform.tx * resolution,
        transform.ty * resolution
    );

    CanvasGraphics.renderGraphics(this, context);
};

/**
 * Retrieves the bounds of the graphic shape as a rectangle object
 *
 * @param [matrix] {PIXI.Matrix} The world transform matrix to use, defaults to this
 *  object's worldTransform.
 * @return {PIXI.Rectangle} the rectangular bounding area
 */
Graphics.prototype.getBounds = function (matrix)
{
    if(!this._currentBounds)
    {

        // return an empty object if the item is a mask!
        if (!this.renderable)
        {
            return math.Rectangle.EMPTY;
        }

        if (this.boundsDirty)
        {
            this.updateLocalBounds();

            this.glDirty = true;
            this.cachedSpriteDirty = true;
            this.boundsDirty = false;
        }

        var bounds = this._localBounds;

        var w0 = bounds.x;
        var w1 = bounds.width + bounds.x;

        var h0 = bounds.y;
        var h1 = bounds.height + bounds.y;

        var worldTransform = matrix || this.worldTransform;

        var a = worldTransform.a;
        var b = worldTransform.b;
        var c = worldTransform.c;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;

        var x1 = a * w1 + c * h1 + tx;
        var y1 = d * h1 + b * w1 + ty;

        var x2 = a * w0 + c * h1 + tx;
        var y2 = d * h1 + b * w0 + ty;

        var x3 = a * w0 + c * h0 + tx;
        var y3 = d * h0 + b * w0 + ty;

        var x4 =  a * w1 + c * h0 + tx;
        var y4 =  d * h0 + b * w1 + ty;

        var maxX = x1;
        var maxY = y1;

        var minX = x1;
        var minY = y1;

        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;

        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;

        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;

        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;

        this._bounds.x = minX;
        this._bounds.width = maxX - minX;

        this._bounds.y = minY;
        this._bounds.height = maxY - minY;

        this._currentBounds = this._bounds;
    }

    return this._currentBounds;
};

/**
* Tests if a point is inside this graphics object
*
* @param point {PIXI.Point} the point to test
* @return {boolean} the result of the test
*/
Graphics.prototype.containsPoint = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var graphicsData = this.graphicsData;

    for (var i = 0; i < graphicsData.length; i++)
    {
        var data = graphicsData[i];

        if (!data.fill)
        {
            continue;
        }

        // only deal with fills..
        if (data.shape)
        {
            if ( data.shape.contains( tempPoint.x, tempPoint.y ) )
            {
                return true;
            }
        }
    }

    return false;
};

/**
 * Update the bounds of the object
 *
 */
Graphics.prototype.updateLocalBounds = function ()
{
    var minX = Infinity;
    var maxX = -Infinity;

    var minY = Infinity;
    var maxY = -Infinity;

    if (this.graphicsData.length)
    {
        var shape, points, x, y, w, h;

        for (var i = 0; i < this.graphicsData.length; i++)
        {
            var data = this.graphicsData[i];
            var type = data.type;
            var lineWidth = data.lineWidth;
            shape = data.shape;

            if (type === CONST.SHAPES.RECT || type === CONST.SHAPES.RREC)
            {
                x = shape.x - lineWidth/2;
                y = shape.y - lineWidth/2;
                w = shape.width + lineWidth;
                h = shape.height + lineWidth;

                minX = x < minX ? x : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y < minY ? y : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else if (type === CONST.SHAPES.CIRC)
            {
                x = shape.x;
                y = shape.y;
                w = shape.radius + lineWidth/2;
                h = shape.radius + lineWidth/2;

                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else if (type === CONST.SHAPES.ELIP)
            {
                x = shape.x;
                y = shape.y;
                w = shape.width + lineWidth/2;
                h = shape.height + lineWidth/2;

                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else
            {
                // POLY
                points = shape.points;

                for (var j = 0; j < points.length; j += 2)
                {
                    x = points[j];
                    y = points[j+1];

                    minX = x-lineWidth < minX ? x-lineWidth : minX;
                    maxX = x+lineWidth > maxX ? x+lineWidth : maxX;

                    minY = y-lineWidth < minY ? y-lineWidth : minY;
                    maxY = y+lineWidth > maxY ? y+lineWidth : maxY;
                }
            }
        }
    }
    else
    {
        minX = 0;
        maxX = 0;
        minY = 0;
        maxY = 0;
    }

    var padding = this.boundsPadding;

    this._localBounds.x = minX - padding;
    this._localBounds.width = (maxX - minX) + padding * 2;

    this._localBounds.y = minY - padding;
    this._localBounds.height = (maxY - minY) + padding * 2;
};

/**
 * Generates the cached sprite when the sprite has cacheAsBitmap = true
 *
 * @private
 */
/*
Graphics.prototype._generateCachedSprite = function ()
{
    var bounds = this.getLocalBounds();

    if (!this._cachedSprite)
    {
        var canvasBuffer = new CanvasBuffer(bounds.width, bounds.height);
        var texture = Texture.fromCanvas(canvasBuffer.canvas);

        this._cachedSprite = new Sprite(texture);
        this._cachedSprite.buffer = canvasBuffer;

        this._cachedSprite.worldTransform = this.worldTransform;
    }
    else
    {
        this._cachedSprite.buffer.resize(bounds.width, bounds.height);
    }

    // leverage the anchor to account for the offset of the element
    this._cachedSprite.anchor.x = -( bounds.x / bounds.width );
    this._cachedSprite.anchor.y = -( bounds.y / bounds.height );

    // this._cachedSprite.buffer.context.save();
    this._cachedSprite.buffer.context.translate(-bounds.x,-bounds.y);

    // make sure we set the alpha of the graphics to 1 for the render..
    this.worldAlpha = 1;

    // now render the graphic..
    CanvasGraphics.renderGraphics(this, this._cachedSprite.buffer.context);

    this._cachedSprite.alpha = this.alpha;
};
*/
/**
 * Updates texture size based on canvas size
 *
 * @private
 */
/*
Graphics.prototype.updateCachedSpriteTexture = function ()
{
    var cachedSprite = this._cachedSprite;
    var texture = cachedSprite.texture;
    var canvas = cachedSprite.buffer.canvas;

    texture.baseTexture.width = canvas.width;
    texture.baseTexture.height = canvas.height;
    texture.crop.width = texture.frame.width = canvas.width;
    texture.crop.height = texture.frame.height = canvas.height;

    cachedSprite._width = canvas.width;
    cachedSprite._height = canvas.height;

    // update the dirty base textures
    texture.baseTexture.dirty();
};*/

/**
 * Destroys a previous cached sprite.
 *
 */
/*
Graphics.prototype.destroyCachedSprite = function ()
{
    this._cachedSprite.texture.destroy(true);

    // let the gc collect the unused sprite
    // TODO could be object pooled!
    this._cachedSprite = null;
};*/

/**
 * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
 *
 * @param shape {PIXI.Circle|PIXI.Rectangle|PIXI.Ellipse|PIXI.Line|PIXI.Polygon} The shape object to draw.
 * @return {PIXI.GraphicsData} The generated GraphicsData object.
 */
Graphics.prototype.drawShape = function (shape)
{
    if (this.currentPath)
    {
        // check current path!
        if (this.currentPath.shape.points.length <= 2)
        {
            this.graphicsData.pop();
        }
    }

    this.currentPath = null;

    var data = new GraphicsData(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.filling, shape);

    this.graphicsData.push(data);

    if (data.type === CONST.SHAPES.POLY)
    {
        data.shape.closed = data.shape.closed || this.filling;
        this.currentPath = data;
    }

    this.dirty = this.boundsDirty = true;

    return data;
};

/**
 * Destroys the Graphics object.
 */
Graphics.prototype.destroy = function () {
    Container.prototype.destroy.apply(this, arguments);

    // destroy each of the GraphicsData objects
    for (var i = 0; i < this.graphicsData.length; ++i) {
        this.graphicsData[i].destroy();
    }

    // for each webgl data entry, destroy the WebGLGraphicsData
    for (var id in this._webgl) {
        for (var j = 0; j < this._webgl[id].data.length; ++j) {
            this._webgl[id].data[j].destroy();
        }
    }

    this.graphicsData = null;

    this.currentPath = null;
    this._webgl = null;
    this._localBounds = null;
};

},{"../const":22,"../display/Container":23,"../math":33,"../renderers/canvas/utils/CanvasBuffer":45,"../renderers/canvas/utils/CanvasGraphics":46,"../textures/Texture":72,"./GraphicsData":26}],26:[function(require,module,exports){
/**
 * A GraphicsData object.
 *
 * @class
 * @memberof PIXI
 * @param lineWidth {number} the width of the line to draw
 * @param lineColor {number} the color of the line to draw
 * @param lineAlpha {number} the alpha of the line to draw
 * @param fillColor {number} the color of the fill
 * @param fillAlpha {number} the alpha of the fill
 * @param fill      {boolean} whether or not the shape is filled with a colour
 * @param shape     {Circle|Rectangle|Ellipse|Line|Polygon} The shape object to draw.
 */
function GraphicsData(lineWidth, lineColor, lineAlpha, fillColor, fillAlpha, fill, shape)
{
    /*
     * @member {number} the width of the line to draw
     */
    this.lineWidth = lineWidth;

    /*
     * @member {number} the color of the line to draw
     */
    this.lineColor = lineColor;
    /*
     * @member {number} the alpha of the line to draw
     */
    this.lineAlpha = lineAlpha;
    /*
     * @member {number} cached tint of the line to draw
     */
    this._lineTint = lineColor;

    /*
     * @member {number} the color of the fill
     */
    this.fillColor = fillColor;

    /*
     * @member {number} the alpha of the fill
     */
    this.fillAlpha = fillAlpha;

    /*
     * @member {number} cached tint of the fill
     */
    this._fillTint = fillColor;

    /*
     * @member {boolean} whether or not the shape is filled with a colour
     */
    this.fill = fill;

    /*
     * @member {PIXI.Circle|PIXI.Rectangle|PIXI.Ellipse|PIXI.Line|PIXI.Polygon} The shape object to draw.
     */
    this.shape = shape;

    /*
     * @member {number} The type of the shape, see the Const.Shapes file for all the existing types,
     */
    this.type = shape.type;
}

GraphicsData.prototype.constructor = GraphicsData;
module.exports = GraphicsData;

/**
 * Creates a new GraphicsData object with the same values as this one.
 *
 * @return {PIXI.GraphicsData}
 */
GraphicsData.prototype.clone = function ()
{
    return new GraphicsData(
        this.lineWidth,
        this.lineColor,
        this.lineAlpha,
        this.fillColor,
        this.fillAlpha,
        this.fill,
        this.shape
    );
};

/**
 * Destroys the Graphics data.
 */
GraphicsData.prototype.destroy = function () {
    this.shape = null;
};

},{}],27:[function(require,module,exports){
var utils = require('../../utils'),
    math = require('../../math'),
    CONST = require('../../const'),
    ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    WebGLGraphicsData = require('./WebGLGraphicsData'),
    earcut = require('earcut');

/**
 * Renders the graphics object.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this object renderer works for.
 */
function GraphicsRenderer(renderer)
{
    ObjectRenderer.call(this, renderer);

    this.graphicsDataPool = [];

    this.primitiveShader = null;
    this.complexPrimitiveShader = null;

    /**
     * This is the maximum number of points a poly can contain before it is rendered as a complex polygon (using the stencil buffer)
     * @type {Number}
     */
    this.maximumSimplePolySize = 200;
}

GraphicsRenderer.prototype = Object.create(ObjectRenderer.prototype);
GraphicsRenderer.prototype.constructor = GraphicsRenderer;
module.exports = GraphicsRenderer;

WebGLRenderer.registerPlugin('graphics', GraphicsRenderer);

/**
 * Called when there is a WebGL context change
 *
 * @private
 *
 */
GraphicsRenderer.prototype.onContextChange = function()
{

};

/**
 * Destroys this renderer.
 *
 */
GraphicsRenderer.prototype.destroy = function () {
    ObjectRenderer.prototype.destroy.call(this);

    for (var i = 0; i < this.graphicsDataPool.length; ++i) {
        this.graphicsDataPool[i].destroy();
    }

    this.graphicsDataPool = null;
};

/**
 * Renders a graphics object.
 *
 * @param graphics {PIXI.Graphics} The graphics object to render.
 */
GraphicsRenderer.prototype.render = function(graphics)
{
    var renderer = this.renderer;
    var gl = renderer.gl;

    var shader = renderer.shaderManager.plugins.primitiveShader,
        webGLData;

    if (graphics.dirty || !graphics._webGL[gl.id])
    {
        this.updateGraphics(graphics);
    }

    var webGL = graphics._webGL[gl.id];

    // This  could be speeded up for sure!

    renderer.blendModeManager.setBlendMode( graphics.blendMode );

//    var matrix =  graphics.worldTransform.clone();
//    var matrix =  renderer.currentRenderTarget.projectionMatrix.clone();
//    matrix.append(graphics.worldTransform);

    for (var i = 0, n = webGL.data.length; i < n; i++)
    {
        webGLData = webGL.data[i];

        if (webGL.data[i].mode === 1)
        {

            renderer.stencilManager.pushStencil(graphics, webGLData);

            gl.uniform1f(renderer.shaderManager.complexPrimitiveShader.uniforms.alpha._location, graphics.worldAlpha * webGLData.alpha);

            // render quad..
            gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, ( webGLData.indices.length - 4 ) * 2 );

            renderer.stencilManager.popStencil(graphics, webGLData);
        }
        else
        {

            shader = renderer.shaderManager.primitiveShader;

            renderer.shaderManager.setShader( shader );//activatePrimitiveShader();

            gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, graphics.worldTransform.toArray(true));

            gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, renderer.currentRenderTarget.projectionMatrix.toArray(true));

            gl.uniform3fv(shader.uniforms.tint._location, utils.hex2rgb(graphics.tint));

            gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);


            gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);

            gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
            gl.vertexAttribPointer(shader.attributes.aColor, 4, gl.FLOAT, false,4 * 6, 2 * 4);

            // set the index buffer!
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
            gl.drawElements(gl.TRIANGLE_STRIP,  webGLData.indices.length, gl.UNSIGNED_SHORT, 0 );
        }

        renderer.drawCount++;
    }
};

/**
 * Updates the graphics object
 *
 * @private
 * @param graphics {PIXI.Graphics} The graphics object to update
 */
GraphicsRenderer.prototype.updateGraphics = function(graphics)
{
    var gl = this.renderer.gl;

     // get the contexts graphics object
    var webGL = graphics._webGL[gl.id];

    // if the graphics object does not exist in the webGL context time to create it!
    if (!webGL)
    {
        webGL = graphics._webGL[gl.id] = {lastIndex:0, data:[], gl:gl};
    }

    // flag the graphics as not dirty as we are about to update it...
    graphics.dirty = false;

    var i;

    // if the user cleared the graphics object we will need to clear every object
    if (graphics.clearDirty)
    {
        graphics.clearDirty = false;

        // loop through and return all the webGLDatas to the object pool so than can be reused later on
        for (i = 0; i < webGL.data.length; i++)
        {
            var graphicsData = webGL.data[i];
            graphicsData.reset();
            this.graphicsDataPool.push( graphicsData );
        }

        // clear the array and reset the index..
        webGL.data = [];
        webGL.lastIndex = 0;
    }

    var webGLData;

    // loop through the graphics datas and construct each one..
    // if the object is a complex fill then the new stencil buffer technique will be used
    // other wise graphics objects will be pushed into a batch..
    for (i = webGL.lastIndex; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];

        if (data.type === CONST.SHAPES.POLY)
        {
            // need to add the points the the graphics object..
            data.points = data.shape.points.slice();
            if (data.shape.closed)
            {
                // close the poly if the value is true!
                if (data.points[0] !== data.points[data.points.length-2] || data.points[1] !== data.points[data.points.length-1])
                {
                    data.points.push(data.points[0], data.points[1]);
                }
            }

            // MAKE SURE WE HAVE THE CORRECT TYPE..
            if (data.fill)
            {
                if (data.points.length >= 6)
                {
                    if (data.points.length < this.maximumSimplePolySize * 2)
                    {
                        webGLData = this.switchMode(webGL, 0);

                        var canDrawUsingSimple = this.buildPoly(data, webGLData);

                        if (!canDrawUsingSimple)
                        {
                            webGLData = this.switchMode(webGL, 1);
                            this.buildComplexPoly(data, webGLData);
                        }

                    }
                    else
                    {
                        webGLData = this.switchMode(webGL, 1);
                        this.buildComplexPoly(data, webGLData);
                    }
                }
            }

            if (data.lineWidth > 0)
            {
                webGLData = this.switchMode(webGL, 0);
                this.buildLine(data, webGLData);
            }
        }
        else
        {
            webGLData = this.switchMode(webGL, 0);

            if (data.type === CONST.SHAPES.RECT)
            {
                this.buildRectangle(data, webGLData);
            }
            else if (data.type === CONST.SHAPES.CIRC || data.type === CONST.SHAPES.ELIP)
            {
                this.buildCircle(data, webGLData);
            }
            else if (data.type === CONST.SHAPES.RREC)
            {
                this.buildRoundedRectangle(data, webGLData);
            }
        }

        webGL.lastIndex++;
    }

    // upload all the dirty data...
    for (i = 0; i < webGL.data.length; i++)
    {
        webGLData = webGL.data[i];

        if (webGLData.dirty)
        {
            webGLData.upload();
        }
    }
};

/**
 *
 *
 * @private
 * @param webGL {WebGLRenderingContext} the current WebGL drawing context
 * @param type {number} TODO @Alvin
 */
GraphicsRenderer.prototype.switchMode = function (webGL, type)
{
    var webGLData;

    if (!webGL.data.length)
    {
        webGLData = this.graphicsDataPool.pop() || new WebGLGraphicsData(webGL.gl);
        webGLData.mode = type;
        webGL.data.push(webGLData);
    }
    else
    {
        webGLData = webGL.data[webGL.data.length-1];

        if ((webGLData.points.length > 320000) || webGLData.mode !== type || type === 1)
        {
            webGLData = this.graphicsDataPool.pop() || new WebGLGraphicsData(webGL.gl);
            webGLData.mode = type;
            webGL.data.push(webGLData);
        }
    }

    webGLData.dirty = true;

    return webGLData;
};

/**
 * Builds a rectangle to draw
 *
 * @private
 * @param graphicsData {PIXI.Graphics} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
GraphicsRenderer.prototype.buildRectangle = function (graphicsData, webGLData)
{
    // --- //
    // need to convert points to a nice regular data
    //
    var rectData = graphicsData.shape;
    var x = rectData.x;
    var y = rectData.y;
    var width = rectData.width;
    var height = rectData.height;

    if (graphicsData.fill)
    {
        var color = utils.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;

        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;

        var verts = webGLData.points;
        var indices = webGLData.indices;

        var vertPos = verts.length/6;

        // start
        verts.push(x, y);
        verts.push(r, g, b, alpha);

        verts.push(x + width, y);
        verts.push(r, g, b, alpha);

        verts.push(x , y + height);
        verts.push(r, g, b, alpha);

        verts.push(x + width, y + height);
        verts.push(r, g, b, alpha);

        // insert 2 dead triangles..
        indices.push(vertPos, vertPos, vertPos+1, vertPos+2, vertPos+3, vertPos+3);
    }

    if (graphicsData.lineWidth)
    {
        var tempPoints = graphicsData.points;

        graphicsData.points = [x, y,
                  x + width, y,
                  x + width, y + height,
                  x, y + height,
                  x, y];


        this.buildLine(graphicsData, webGLData);

        graphicsData.points = tempPoints;
    }
};

/**
 * Builds a rounded rectangle to draw
 *
 * @private
 * @param graphicsData {PIXI.Graphics} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
GraphicsRenderer.prototype.buildRoundedRectangle = function (graphicsData, webGLData)
{
    var rrectData = graphicsData.shape;
    var x = rrectData.x;
    var y = rrectData.y;
    var width = rrectData.width;
    var height = rrectData.height;

    var radius = rrectData.radius;

    var recPoints = [];
    recPoints.push(x, y + radius);
    this.quadraticBezierCurve(x, y + height - radius, x, y + height, x + radius, y + height, recPoints);
    this.quadraticBezierCurve(x + width - radius, y + height, x + width, y + height, x + width, y + height - radius, recPoints);
    this.quadraticBezierCurve(x + width, y + radius, x + width, y, x + width - radius, y, recPoints);
    this.quadraticBezierCurve(x + radius, y, x, y, x, y + radius + 0.0000000001, recPoints);

    // this tiny number deals with the issue that occurs when points overlap and earcut fails to triangulate the item.
    // TODO - fix this properly, this is not very elegant.. but it works for now.

    if (graphicsData.fill)
    {
        var color = utils.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;

        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;

        var verts = webGLData.points;
        var indices = webGLData.indices;

        var vecPos = verts.length/6;

        var triangles = earcut(recPoints, null, 2);

        var i = 0;
        for (i = 0; i < triangles.length; i+=3)
        {
            indices.push(triangles[i] + vecPos);
            indices.push(triangles[i] + vecPos);
            indices.push(triangles[i+1] + vecPos);
            indices.push(triangles[i+2] + vecPos);
            indices.push(triangles[i+2] + vecPos);
        }

        for (i = 0; i < recPoints.length; i++)
        {
            verts.push(recPoints[i], recPoints[++i], r, g, b, alpha);
        }
    }

    if (graphicsData.lineWidth)
    {
        var tempPoints = graphicsData.points;

        graphicsData.points = recPoints;

        this.buildLine(graphicsData, webGLData);

        graphicsData.points = tempPoints;
    }
};

/**
 * Calculate the points for a quadratic bezier curve. (helper function..)
 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
 *
 * @private
 * @param fromX {number} Origin point x
 * @param fromY {number} Origin point x
 * @param cpX {number} Control point x
 * @param cpY {number} Control point y
 * @param toX {number} Destination point x
 * @param toY {number} Destination point y
 * @param [out] {number[]} The output array to add points into. If not passed, a new array is created.
 * @return {number[]} an array of points
 */
GraphicsRenderer.prototype.quadraticBezierCurve = function (fromX, fromY, cpX, cpY, toX, toY, out)
{
    var xa,
        ya,
        xb,
        yb,
        x,
        y,
        n = 20,
        points = out || [];

    function getPt(n1 , n2, perc) {
        var diff = n2 - n1;

        return n1 + ( diff * perc );
    }

    var j = 0;
    for (var i = 0; i <= n; i++ ) {
        j = i / n;

        // The Green Line
        xa = getPt( fromX , cpX , j );
        ya = getPt( fromY , cpY , j );
        xb = getPt( cpX , toX , j );
        yb = getPt( cpY , toY , j );

        // The Black Dot
        x = getPt( xa , xb , j );
        y = getPt( ya , yb , j );

        points.push(x, y);
    }

    return points;
};

/**
 * Builds a circle to draw
 *
 * @private
 * @param graphicsData {PIXI.Graphics} The graphics object to draw
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
GraphicsRenderer.prototype.buildCircle = function (graphicsData, webGLData)
{
    // need to convert points to a nice regular data
    var circleData = graphicsData.shape;
    var x = circleData.x;
    var y = circleData.y;
    var width;
    var height;

    // TODO - bit hacky??
    if (graphicsData.type === CONST.SHAPES.CIRC)
    {
        width = circleData.radius;
        height = circleData.radius;
    }
    else
    {
        width = circleData.width;
        height = circleData.height;
    }

    var totalSegs = Math.floor(30 * Math.sqrt(circleData.radius)) || Math.floor(15 * Math.sqrt(circleData.width + circleData.height));
    var seg = (Math.PI * 2) / totalSegs ;

    var i = 0;

    if (graphicsData.fill)
    {
        var color = utils.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;

        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;

        var verts = webGLData.points;
        var indices = webGLData.indices;

        var vecPos = verts.length/6;

        indices.push(vecPos);

        for (i = 0; i < totalSegs + 1 ; i++)
        {
            verts.push(x,y, r, g, b, alpha);

            verts.push(x + Math.sin(seg * i) * width,
                       y + Math.cos(seg * i) * height,
                       r, g, b, alpha);

            indices.push(vecPos++, vecPos++);
        }

        indices.push(vecPos-1);
    }

    if (graphicsData.lineWidth)
    {
        var tempPoints = graphicsData.points;

        graphicsData.points = [];

        for (i = 0; i < totalSegs + 1; i++)
        {
            graphicsData.points.push(x + Math.sin(seg * i) * width,
                                     y + Math.cos(seg * i) * height);
        }

        this.buildLine(graphicsData, webGLData);

        graphicsData.points = tempPoints;
    }
};

/**
 * Builds a line to draw
 *
 * @private
 * @param graphicsData {PIXI.Graphics} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
GraphicsRenderer.prototype.buildLine = function (graphicsData, webGLData)
{
    // TODO OPTIMISE!
    var i = 0;
    var points = graphicsData.points;

    if (points.length === 0)
    {
        return;
    }
    // if the line width is an odd number add 0.5 to align to a whole pixel
    // commenting this out fixes #711 and #1620
    // if (graphicsData.lineWidth%2)
    // {
    //     for (i = 0; i < points.length; i++)
    //     {
    //         points[i] += 0.5;
    //     }
    // }

    // get first and last point.. figure out the middle!
    var firstPoint = new math.Point(points[0], points[1]);
    var lastPoint = new math.Point(points[points.length - 2], points[points.length - 1]);

    // if the first point is the last point - gonna have issues :)
    if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y)
    {
        // need to clone as we are going to slightly modify the shape..
        points = points.slice();

        points.pop();
        points.pop();

        lastPoint = new math.Point(points[points.length - 2], points[points.length - 1]);

        var midPointX = lastPoint.x + (firstPoint.x - lastPoint.x) *0.5;
        var midPointY = lastPoint.y + (firstPoint.y - lastPoint.y) *0.5;

        points.unshift(midPointX, midPointY);
        points.push(midPointX, midPointY);
    }

    var verts = webGLData.points;
    var indices = webGLData.indices;
    var length = points.length / 2;
    var indexCount = points.length;
    var indexStart = verts.length/6;

    // DRAW the Line
    var width = graphicsData.lineWidth / 2;

    // sort color
    var color = utils.hex2rgb(graphicsData.lineColor);
    var alpha = graphicsData.lineAlpha;
    var r = color[0] * alpha;
    var g = color[1] * alpha;
    var b = color[2] * alpha;

    var px, py, p1x, p1y, p2x, p2y, p3x, p3y;
    var perpx, perpy, perp2x, perp2y, perp3x, perp3y;
    var a1, b1, c1, a2, b2, c2;
    var denom, pdist, dist;

    p1x = points[0];
    p1y = points[1];

    p2x = points[2];
    p2y = points[3];

    perpx = -(p1y - p2y);
    perpy =  p1x - p2x;

    dist = Math.sqrt(perpx*perpx + perpy*perpy);

    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;

    // start
    verts.push(p1x - perpx , p1y - perpy,
                r, g, b, alpha);

    verts.push(p1x + perpx , p1y + perpy,
                r, g, b, alpha);

    for (i = 1; i < length-1; i++)
    {
        p1x = points[(i-1)*2];
        p1y = points[(i-1)*2 + 1];

        p2x = points[(i)*2];
        p2y = points[(i)*2 + 1];

        p3x = points[(i+1)*2];
        p3y = points[(i+1)*2 + 1];

        perpx = -(p1y - p2y);
        perpy = p1x - p2x;

        dist = Math.sqrt(perpx*perpx + perpy*perpy);
        perpx /= dist;
        perpy /= dist;
        perpx *= width;
        perpy *= width;

        perp2x = -(p2y - p3y);
        perp2y = p2x - p3x;

        dist = Math.sqrt(perp2x*perp2x + perp2y*perp2y);
        perp2x /= dist;
        perp2y /= dist;
        perp2x *= width;
        perp2y *= width;

        a1 = (-perpy + p1y) - (-perpy + p2y);
        b1 = (-perpx + p2x) - (-perpx + p1x);
        c1 = (-perpx + p1x) * (-perpy + p2y) - (-perpx + p2x) * (-perpy + p1y);
        a2 = (-perp2y + p3y) - (-perp2y + p2y);
        b2 = (-perp2x + p2x) - (-perp2x + p3x);
        c2 = (-perp2x + p3x) * (-perp2y + p2y) - (-perp2x + p2x) * (-perp2y + p3y);

        denom = a1*b2 - a2*b1;

        if (Math.abs(denom) < 0.1 )
        {

            denom+=10.1;
            verts.push(p2x - perpx , p2y - perpy,
                r, g, b, alpha);

            verts.push(p2x + perpx , p2y + perpy,
                r, g, b, alpha);

            continue;
        }

        px = (b1*c2 - b2*c1)/denom;
        py = (a2*c1 - a1*c2)/denom;


        pdist = (px -p2x) * (px -p2x) + (py -p2y) * (py -p2y);


        if (pdist > 140 * 140)
        {
            perp3x = perpx - perp2x;
            perp3y = perpy - perp2y;

            dist = Math.sqrt(perp3x*perp3x + perp3y*perp3y);
            perp3x /= dist;
            perp3y /= dist;
            perp3x *= width;
            perp3y *= width;

            verts.push(p2x - perp3x, p2y -perp3y);
            verts.push(r, g, b, alpha);

            verts.push(p2x + perp3x, p2y +perp3y);
            verts.push(r, g, b, alpha);

            verts.push(p2x - perp3x, p2y -perp3y);
            verts.push(r, g, b, alpha);

            indexCount++;
        }
        else
        {

            verts.push(px , py);
            verts.push(r, g, b, alpha);

            verts.push(p2x - (px-p2x), p2y - (py - p2y));
            verts.push(r, g, b, alpha);
        }
    }

    p1x = points[(length-2)*2];
    p1y = points[(length-2)*2 + 1];

    p2x = points[(length-1)*2];
    p2y = points[(length-1)*2 + 1];

    perpx = -(p1y - p2y);
    perpy = p1x - p2x;

    dist = Math.sqrt(perpx*perpx + perpy*perpy);
    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;

    verts.push(p2x - perpx , p2y - perpy);
    verts.push(r, g, b, alpha);

    verts.push(p2x + perpx , p2y + perpy);
    verts.push(r, g, b, alpha);

    indices.push(indexStart);

    for (i = 0; i < indexCount; i++)
    {
        indices.push(indexStart++);
    }

    indices.push(indexStart-1);
};

/**
 * Builds a complex polygon to draw
 *
 * @private
 * @param graphicsData {PIXI.Graphics} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
GraphicsRenderer.prototype.buildComplexPoly = function (graphicsData, webGLData)
{
    //TODO - no need to copy this as it gets turned into a FLoat32Array anyways..
    var points = graphicsData.points.slice();

    if (points.length < 6)
    {
        return;
    }

    // get first and last point.. figure out the middle!
    var indices = webGLData.indices;
    webGLData.points = points;
    webGLData.alpha = graphicsData.fillAlpha;
    webGLData.color = utils.hex2rgb(graphicsData.fillColor);

    // calclate the bounds..
    var minX = Infinity;
    var maxX = -Infinity;

    var minY = Infinity;
    var maxY = -Infinity;

    var x,y;

    // get size..
    for (var i = 0; i < points.length; i+=2)
    {
        x = points[i];
        y = points[i+1];

        minX = x < minX ? x : minX;
        maxX = x > maxX ? x : maxX;

        minY = y < minY ? y : minY;
        maxY = y > maxY ? y : maxY;
    }

    // add a quad to the end cos there is no point making another buffer!
    points.push(minX, minY,
                maxX, minY,
                maxX, maxY,
                minX, maxY);

    // push a quad onto the end..

    //TODO - this aint needed!
    var length = points.length / 2;
    for (i = 0; i < length; i++)
    {
        indices.push( i );
    }

};

/**
 * Builds a polygon to draw
 *
 * @private
 * @param graphicsData {PIXI.WebGLGraphicsData} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
GraphicsRenderer.prototype.buildPoly = function (graphicsData, webGLData)
{
    var points = graphicsData.points;

    if (points.length < 6)
    {
        return;
    }

    // get first and last point.. figure out the middle!
    var verts = webGLData.points;
    var indices = webGLData.indices;

    var length = points.length / 2;

    // sort color
    var color = utils.hex2rgb(graphicsData.fillColor);
    var alpha = graphicsData.fillAlpha;
    var r = color[0] * alpha;
    var g = color[1] * alpha;
    var b = color[2] * alpha;

    var triangles = earcut(points, null, 2);

    if (!triangles) {
        return false;
    }

    var vertPos = verts.length / 6;

    var i = 0;

    for (i = 0; i < triangles.length; i+=3)
    {
        indices.push(triangles[i] + vertPos);
        indices.push(triangles[i] + vertPos);
        indices.push(triangles[i+1] + vertPos);
        indices.push(triangles[i+2] +vertPos);
        indices.push(triangles[i+2] + vertPos);
    }

    for (i = 0; i < length; i++)
    {
        verts.push(points[i * 2], points[i * 2 + 1],
                   r, g, b, alpha);
    }

    return true;
};

},{"../../const":22,"../../math":33,"../../renderers/webgl/WebGLRenderer":49,"../../renderers/webgl/utils/ObjectRenderer":63,"../../utils":77,"./WebGLGraphicsData":28,"earcut":9}],28:[function(require,module,exports){
/**
 * An object containing WebGL specific properties to be used by the WebGL renderer
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 * @private
 */
function WebGLGraphicsData(gl) {

    /**
     * The current WebGL drawing context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    //TODO does this need to be split before uploding??
    /**
     * An array of color components (r,g,b)
     * @member {number[]}
     */
    this.color = [0,0,0]; // color split!

    /**
     * An array of points to draw
     * @member {PIXI.Point[]}
     */
    this.points = [];

    /**
     * The indices of the vertices
     * @member {number[]}
     */
    this.indices = [];
    /**
     * The main buffer
     * @member {WebGLBuffer}
     */
    this.buffer = gl.createBuffer();

    /**
     * The index buffer
     * @member {WebGLBuffer}
     */
    this.indexBuffer = gl.createBuffer();

    /**
     * todo @alvin
     * @member {number}
     */
    this.mode = 1;

    /**
     * The alpha of the graphics
     * @member {number}
     */
    this.alpha = 1;

    /**
     * Whether this graphics is dirty or not
     * @member {boolean}
     */
    this.dirty = true;

    this.glPoints = null;
    this.glIndices = null;
}

WebGLGraphicsData.prototype.constructor = WebGLGraphicsData;
module.exports = WebGLGraphicsData;

/**
 * Resets the vertices and the indices
 */
WebGLGraphicsData.prototype.reset = function () {
    this.points.length = 0;
    this.indices.length = 0;
};

/**
 * Binds the buffers and uploads the data
 */
WebGLGraphicsData.prototype.upload = function () {
    var gl = this.gl;

//    this.lastIndex = graphics.graphicsData.length;
    this.glPoints = new Float32Array(this.points);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.glPoints, gl.STATIC_DRAW);

    this.glIndices = new Uint16Array(this.indices);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.glIndices, gl.STATIC_DRAW);

    this.dirty = false;
};

WebGLGraphicsData.prototype.destroy = function () {
    this.color = null;
    this.points = null;
    this.indices = null;

    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteBuffer(this.indexBuffer);
    
    this.gl = null;

    this.buffer = null;
    this.indexBuffer = null;

    this.glPoints = null;
    this.glIndices = null;
};

},{}],29:[function(require,module,exports){
/**
 * @file        Main export of the PIXI core library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI
 */
// export core and const. We assign core to const so that the non-reference types in const remain in-tact
var core = module.exports = Object.assign(require('./const'), require('./math'), {
    // utils
    utils: require('./utils'),
    ticker: require('./ticker'),

    // display
    DisplayObject:          require('./display/DisplayObject'),
    Container:              require('./display/Container'),

    // sprites
    Sprite:                 require('./sprites/Sprite'),
    ParticleContainer:      require('./particles/ParticleContainer'),
    SpriteRenderer:         require('./sprites/webgl/SpriteRenderer'),
    ParticleRenderer:       require('./particles/webgl/ParticleRenderer'),

    // text
    Text:                   require('./text/Text'),

    // primitives
    Graphics:               require('./graphics/Graphics'),
    GraphicsData:           require('./graphics/GraphicsData'),
    GraphicsRenderer:       require('./graphics/webgl/GraphicsRenderer'),

    // textures
    Texture:                require('./textures/Texture'),
    BaseTexture:            require('./textures/BaseTexture'),
    RenderTexture:          require('./textures/RenderTexture'),
    VideoBaseTexture:       require('./textures/VideoBaseTexture'),
    TextureUvs:             require('./textures/TextureUvs'),

    // renderers - canvas
    CanvasRenderer:         require('./renderers/canvas/CanvasRenderer'),
    CanvasGraphics:         require('./renderers/canvas/utils/CanvasGraphics'),
    CanvasBuffer:           require('./renderers/canvas/utils/CanvasBuffer'),

    // renderers - webgl
    WebGLRenderer:          require('./renderers/webgl/WebGLRenderer'),
    WebGLManager:           require('./renderers/webgl/managers/WebGLManager'),
    ShaderManager:          require('./renderers/webgl/managers/ShaderManager'),
    Shader:                 require('./renderers/webgl/shaders/Shader'),
    TextureShader:          require('./renderers/webgl/shaders/TextureShader'),
    PrimitiveShader:        require('./renderers/webgl/shaders/PrimitiveShader'),
    ComplexPrimitiveShader: require('./renderers/webgl/shaders/ComplexPrimitiveShader'),
    ObjectRenderer:         require('./renderers/webgl/utils/ObjectRenderer'),
    RenderTarget:           require('./renderers/webgl/utils/RenderTarget'),

    // filters - webgl
    AbstractFilter:         require('./renderers/webgl/filters/AbstractFilter'),
    FXAAFilter:             require('./renderers/webgl/filters/FXAAFilter'),
    SpriteMaskFilter:       require('./renderers/webgl/filters/SpriteMaskFilter'),

    /**
     * This helper function will automatically detect which renderer you should be using.
     * WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by
     * the browser then this function will return a canvas renderer
     *
     * @memberof PIXI
     * @param width=800 {number} the width of the renderers view
     * @param height=600 {number} the height of the renderers view
     * @param [options] {object} The optional renderer parameters
     * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
     * @param [options.transparent=false] {boolean} If the render view is transparent, default false
     * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
     * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if you
     *      need to call toDataUrl on the webgl context
     * @param [options.resolution=1] {number} the resolution of the renderer, retina would be 2
     * @param [noWebGL=false] {boolean} prevents selection of WebGL renderer, even if such is present
     *
     * @return {WebGLRenderer|CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
     */
    autoDetectRenderer: function (width, height, options, noWebGL)
    {
        width = width || 800;
        height = height || 600;

        if (!noWebGL && core.utils.isWebGLSupported())
        {
            return new core.WebGLRenderer(width, height, options);
        }

        return new core.CanvasRenderer(width, height, options);
    }
});

},{"./const":22,"./display/Container":23,"./display/DisplayObject":24,"./graphics/Graphics":25,"./graphics/GraphicsData":26,"./graphics/webgl/GraphicsRenderer":27,"./math":33,"./particles/ParticleContainer":39,"./particles/webgl/ParticleRenderer":41,"./renderers/canvas/CanvasRenderer":44,"./renderers/canvas/utils/CanvasBuffer":45,"./renderers/canvas/utils/CanvasGraphics":46,"./renderers/webgl/WebGLRenderer":49,"./renderers/webgl/filters/AbstractFilter":50,"./renderers/webgl/filters/FXAAFilter":51,"./renderers/webgl/filters/SpriteMaskFilter":52,"./renderers/webgl/managers/ShaderManager":56,"./renderers/webgl/managers/WebGLManager":58,"./renderers/webgl/shaders/ComplexPrimitiveShader":59,"./renderers/webgl/shaders/PrimitiveShader":60,"./renderers/webgl/shaders/Shader":61,"./renderers/webgl/shaders/TextureShader":62,"./renderers/webgl/utils/ObjectRenderer":63,"./renderers/webgl/utils/RenderTarget":65,"./sprites/Sprite":67,"./sprites/webgl/SpriteRenderer":68,"./text/Text":69,"./textures/BaseTexture":70,"./textures/RenderTexture":71,"./textures/Texture":72,"./textures/TextureUvs":73,"./textures/VideoBaseTexture":74,"./ticker":76,"./utils":77}],30:[function(require,module,exports){
// Your friendly neighbour https://en.wikipedia.org/wiki/Dihedral_group of order 16

var ux = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1];
var uy = [0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1];
var vx = [0, -1, -1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 0, -1, -1, -1];
var vy = [1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, 1, 0, -1];
var tempMatrices = [];
var Matrix = require('./Matrix');

var mul = [];

function signum(x) {
    if (x < 0) {
        return -1;
    }
    if (x > 0) {
        return 1;
    }
    return 0;
}

function init() {
    for (var i = 0; i < 16; i++) {
        var row = [];
        mul.push(row);
        for (var j = 0; j < 16; j++) {
            var _ux = signum(ux[i] * ux[j] + vx[i] * uy[j]);
            var _uy = signum(uy[i] * ux[j] + vy[i] * uy[j]);
            var _vx = signum(ux[i] * vx[j] + vx[i] * vy[j]);
            var _vy = signum(uy[i] * vx[j] + vy[i] * vy[j]);
            for (var k = 0; k < 16; k++) {
                if (ux[k] === _ux && uy[k] === _uy && vx[k] === _vx && vy[k] === _vy) {
                    row.push(k);
                    break;
                }
            }
        }
    }

    for (i=0;i<16;i++) {
        var mat = new Matrix();
        mat.set(ux[i], uy[i], vx[i], vy[i], 0, 0);
        tempMatrices.push(mat);
    }
}

init();

/**
 * Implements Dihedral Group D_8, see [group D4]{@link http://mathworld.wolfram.com/DihedralGroupD4.html}, D8 is the same but with diagonals
 * Used for texture rotations
 * Vector xX(i), xY(i) is U-axis of sprite with rotation i
 * Vector yY(i), yY(i) is V-axis of sprite with rotation i
 * Rotations: 0 grad (0), 90 grad (2), 180 grad (4), 270 grad (6)
 * Mirrors: vertical (8), main diagonal (10), horizontal (12), reverse diagonal (14)
 * This is the small part of gameofbombs.com portal system. It works.
 * @author Ivan @ivanpopelyshev
 *
 * @namespace PIXI.GroupD8
 */
var GroupD8 = {
    E: 0,
    SE: 1,
    S: 2,
    SW: 3,
    W: 4,
    NW: 5,
    N: 6,
    NE: 7,
    MIRROR_VERTICAL: 8,
    MIRROR_HORIZONTAL: 12,
    uX: function (ind) {
        return ux[ind];
    },
    uY: function (ind) {
        return uy[ind];
    },
    vX: function (ind) {
        return vx[ind];
    },
    vY: function (ind) {
        return vy[ind];
    },
    inv: function (rotation) {
        if (rotation & 8) {
            return rotation & 15;
        }
        return (-rotation) & 7;
    },
    add: function (rotationSecond, rotationFirst) {
        return mul[rotationSecond][rotationFirst];
    },
    sub: function (rotationSecond, rotationFirst) {
        return mul[rotationSecond][GroupD8.inv(rotationFirst)];
    },
    /**
     * Adds 180 degrees to rotation. Commutative operation
     * @param rotation
     * @returns {number}
     */
    rotate180: function (rotation) {
        return rotation ^ 4;
    },
    /**
     * I dont know why sometimes width and heights needs to be swapped. We'll fix it later.
     * @param rotation
     * @returns {boolean}
     */
    isSwapWidthHeight: function(rotation) {
        return (rotation & 3) === 2;
    },
    byDirection: function (dx, dy) {
        if (Math.abs(dx) * 2 <= Math.abs(dy)) {
            if (dy >= 0) {
                return GroupD8.S;
            }
            else {
                return GroupD8.N;
            }
        } else if (Math.abs(dy) * 2 <= Math.abs(dx)) {
            if (dx > 0) {
                return GroupD8.E;
            }
            else {
                return GroupD8.W;
            }
        } else {
            if (dy > 0) {
                if (dx > 0) {
                    return GroupD8.SE;
                }
                else {
                    return GroupD8.SW;
                }
            }
            else if (dx > 0) {
                return GroupD8.NE;
            }
            else {
                return GroupD8.NW;
            }
        }
    },
    /**
     * Helps sprite to compensate texture packer rotation.
     * @param matrix {PIXI.Matrix} sprite world matrix
     * @param rotation {number}
     * @param tx {number|*} sprite anchoring
     * @param ty {number|*} sprite anchoring
     */
    matrixAppendRotationInv: function (matrix, rotation, tx, ty) {
        //Packer used "rotation", we use "inv(rotation)"
        var mat = tempMatrices[GroupD8.inv(rotation)];
        tx = tx || 0;
        ty = ty || 0;
        mat.tx = tx;
        mat.ty = ty;
        matrix.append(mat);
    }
};

module.exports = GroupD8;

},{"./Matrix":31}],31:[function(require,module,exports){
// @todo - ignore the too many parameters warning for now
// should either fix it or change the jshint config
// jshint -W072

var Point = require('./Point');

/**
 * The pixi Matrix class as an object, which makes it a lot faster,
 * here is a representation of it :
 * | a | b | tx|
 * | c | d | ty|
 * | 0 | 0 | 1 |
 *
 * @class
 * @memberof PIXI
 */
function Matrix()
{
    /**
     * @member {number}
     * @default 1
     */
    this.a = 1;

    /**
     * @member {number}
     * @default 0
     */
    this.b = 0;

    /**
     * @member {number}
     * @default 0
     */
    this.c = 0;

    /**
     * @member {number}
     * @default 1
     */
    this.d = 1;

    /**
     * @member {number}
     * @default 0
     */
    this.tx = 0;

    /**
     * @member {number}
     * @default 0
     */
    this.ty = 0;
}

Matrix.prototype.constructor = Matrix;
module.exports = Matrix;

/**
 * Creates a Matrix object based on the given array. The Element to Matrix mapping order is as follows:
 *
 * a = array[0]
 * b = array[1]
 * c = array[3]
 * d = array[4]
 * tx = array[2]
 * ty = array[5]
 *
 * @param array {number[]} The array that the matrix will be populated from.
 */
Matrix.prototype.fromArray = function (array)
{
    this.a = array[0];
    this.b = array[1];
    this.c = array[3];
    this.d = array[4];
    this.tx = array[2];
    this.ty = array[5];
};


/**
 * sets the matrix properties
 *
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {number} tx
 * @param {number} ty
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.set = function (a, b, c, d, tx, ty)
{
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;

    return this;
};


/**
 * Creates an array from the current Matrix object.
 *
 * @param transpose {boolean} Whether we need to transpose the matrix or not
 * @param [out] {Array} If provided the array will be assigned to out
 * @return {number[]} the newly created array which contains the matrix
 */
Matrix.prototype.toArray = function (transpose, out)
{
    if (!this.array)
    {
        this.array = new Float32Array(9);
    }

    var array = out || this.array;

    if (transpose)
    {
        array[0] = this.a;
        array[1] = this.b;
        array[2] = 0;
        array[3] = this.c;
        array[4] = this.d;
        array[5] = 0;
        array[6] = this.tx;
        array[7] = this.ty;
        array[8] = 1;
    }
    else
    {
        array[0] = this.a;
        array[1] = this.c;
        array[2] = this.tx;
        array[3] = this.b;
        array[4] = this.d;
        array[5] = this.ty;
        array[6] = 0;
        array[7] = 0;
        array[8] = 1;
    }

    return array;
};

/**
 * Get a new position with the current transformation applied.
 * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
 *
 * @param pos {PIXI.Point} The origin
 * @param [newPos] {PIXI.Point} The point that the new position is assigned to (allowed to be same as input)
 * @return {PIXI.Point} The new point, transformed through this matrix
 */
Matrix.prototype.apply = function (pos, newPos)
{
    newPos = newPos || new Point();

    var x = pos.x;
    var y = pos.y;

    newPos.x = this.a * x + this.c * y + this.tx;
    newPos.y = this.b * x + this.d * y + this.ty;

    return newPos;
};

/**
 * Get a new position with the inverse of the current transformation applied.
 * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
 *
 * @param pos {PIXI.Point} The origin
 * @param [newPos] {PIXI.Point} The point that the new position is assigned to (allowed to be same as input)
 * @return {PIXI.Point} The new point, inverse-transformed through this matrix
 */
Matrix.prototype.applyInverse = function (pos, newPos)
{
    newPos = newPos || new Point();

    var id = 1 / (this.a * this.d + this.c * -this.b);

    var x = pos.x;
    var y = pos.y;

    newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id;
    newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id;

    return newPos;
};

/**
 * Translates the matrix on the x and y.
 *
 * @param {number} x
 * @param {number} y
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.translate = function (x, y)
{
    this.tx += x;
    this.ty += y;

    return this;
};

/**
 * Applies a scale transformation to the matrix.
 *
 * @param {number} x The amount to scale horizontally
 * @param {number} y The amount to scale vertically
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.scale = function (x, y)
{
    this.a *= x;
    this.d *= y;
    this.c *= x;
    this.b *= y;
    this.tx *= x;
    this.ty *= y;

    return this;
};


/**
 * Applies a rotation transformation to the matrix.
 *
 * @param {number} angle - The angle in radians.
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.rotate = function (angle)
{
    var cos = Math.cos( angle );
    var sin = Math.sin( angle );

    var a1 = this.a;
    var c1 = this.c;
    var tx1 = this.tx;

    this.a = a1 * cos-this.b * sin;
    this.b = a1 * sin+this.b * cos;
    this.c = c1 * cos-this.d * sin;
    this.d = c1 * sin+this.d * cos;
    this.tx = tx1 * cos - this.ty * sin;
    this.ty = tx1 * sin + this.ty * cos;

    return this;
};

/**
 * Appends the given Matrix to this Matrix.
 *
 * @param {PIXI.Matrix} matrix
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.append = function (matrix)
{
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;

    this.a  = matrix.a * a1 + matrix.b * c1;
    this.b  = matrix.a * b1 + matrix.b * d1;
    this.c  = matrix.c * a1 + matrix.d * c1;
    this.d  = matrix.c * b1 + matrix.d * d1;

    this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
    this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;

    return this;
};

/**
 * Sets the matrix based on all the available properties
 *
 * @param {number} x
 * @param {number} y
 * @param {number} pivotX
 * @param {number} pivotY
 * @param {number} scaleX
 * @param {number} scaleY
 * @param {number} rotation
 * @param {number} skewX
 * @param {number} skewY
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.setTransform = function (x, y, pivotX, pivotY, scaleX, scaleY, rotation, skewX, skewY)
{
    var a, b, c, d, sr, cr, cy, sy, nsx, cx;

    sr  = Math.sin(rotation);
    cr  = Math.cos(rotation);
    cy  = Math.cos(skewY);
    sy  = Math.sin(skewY);
    nsx = -Math.sin(skewX);
    cx  =  Math.cos(skewX);

    a  =  cr * scaleX;
    b  =  sr * scaleX;
    c  = -sr * scaleY;
    d  =  cr * scaleY;

    this.a  = cy * a + sy * c;
    this.b  = cy * b + sy * d;
    this.c  = nsx * a + cx * c;
    this.d  = nsx * b + cx * d;

    this.tx = x + ( pivotX * a + pivotY * c );
    this.ty = y + ( pivotX * b + pivotY * d );

    return this;
};

/**
 * Prepends the given Matrix to this Matrix.
 *
 * @param {PIXI.Matrix} matrix
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.prepend = function(matrix)
{
    var tx1 = this.tx;

    if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1)
    {
        var a1 = this.a;
        var c1 = this.c;
        this.a  = a1*matrix.a+this.b*matrix.c;
        this.b  = a1*matrix.b+this.b*matrix.d;
        this.c  = c1*matrix.a+this.d*matrix.c;
        this.d  = c1*matrix.b+this.d*matrix.d;
    }

    this.tx = tx1*matrix.a+this.ty*matrix.c+matrix.tx;
    this.ty = tx1*matrix.b+this.ty*matrix.d+matrix.ty;

    return this;
};

/**
 * Inverts this matrix
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.invert = function()
{
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;
    var tx1 = this.tx;
    var n = a1*d1-b1*c1;

    this.a = d1/n;
    this.b = -b1/n;
    this.c = -c1/n;
    this.d = a1/n;
    this.tx = (c1*this.ty-d1*tx1)/n;
    this.ty = -(a1*this.ty-b1*tx1)/n;

    return this;
};


/**
 * Resets this Matix to an identity (default) matrix.
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.identity = function ()
{
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;

    return this;
};

/**
 * Creates a new Matrix object with the same values as this one.
 *
 * @return {PIXI.Matrix} A copy of this matrix. Good for chaining method calls.
 */
Matrix.prototype.clone = function ()
{
    var matrix = new Matrix();
    matrix.a = this.a;
    matrix.b = this.b;
    matrix.c = this.c;
    matrix.d = this.d;
    matrix.tx = this.tx;
    matrix.ty = this.ty;

    return matrix;
};

/**
 * Changes the values of the given matrix to be the same as the ones in this matrix
 *
 * @return {PIXI.Matrix} The matrix given in parameter with its values updated.
 */
Matrix.prototype.copy = function (matrix)
{
    matrix.a = this.a;
    matrix.b = this.b;
    matrix.c = this.c;
    matrix.d = this.d;
    matrix.tx = this.tx;
    matrix.ty = this.ty;

    return matrix;
};

/**
 * A default (identity) matrix
 *
 * @static
 * @const
 */
Matrix.IDENTITY = new Matrix();

/**
 * A temp matrix
 *
 * @static
 * @const
 */
Matrix.TEMP_MATRIX = new Matrix();

},{"./Point":32}],32:[function(require,module,exports){
/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 * @memberof PIXI
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
function Point(x, y)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;
}

Point.prototype.constructor = Point;
module.exports = Point;

/**
 * Creates a clone of this point
 *
 * @return {PIXI.Point} a copy of the point
 */
Point.prototype.clone = function ()
{
    return new Point(this.x, this.y);
};

/**
 * Copies x and y from the given point
 *
 * @param p {PIXI.Point}
 */
Point.prototype.copy = function (p) {
    this.set(p.x, p.y);
};

/**
 * Returns true if the given point is equal to this point
 *
 * @param p {PIXI.Point}
 * @returns {boolean}
 */
Point.prototype.equals = function (p) {
    return (p.x === this.x) && (p.y === this.y);
};

/**
 * Sets the point to a new x and y position.
 * If y is omitted, both x and y will be set to x.
 *
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
Point.prototype.set = function (x, y)
{
    this.x = x || 0;
    this.y = y || ( (y !== 0) ? this.x : 0 ) ;
};

},{}],33:[function(require,module,exports){
/**
 * Math classes and utilities mixed into PIXI namespace.
 *
 * @lends PIXI
 */
module.exports = {
    // These will be mixed to be made publicly available,
    // while this module is used internally in core
    // to avoid circular dependencies and cut down on
    // internal module requires.

    Point:      require('./Point'),
    Matrix:     require('./Matrix'),
    GroupD8:    require('./GroupD8'),

    Circle:     require('./shapes/Circle'),
    Ellipse:    require('./shapes/Ellipse'),
    Polygon:    require('./shapes/Polygon'),
    Rectangle:  require('./shapes/Rectangle'),
    RoundedRectangle: require('./shapes/RoundedRectangle')
};

},{"./GroupD8":30,"./Matrix":31,"./Point":32,"./shapes/Circle":34,"./shapes/Ellipse":35,"./shapes/Polygon":36,"./shapes/Rectangle":37,"./shapes/RoundedRectangle":38}],34:[function(require,module,exports){
var Rectangle = require('./Rectangle'),
    CONST = require('../../const');

/**
 * The Circle object can be used to specify a hit area for displayObjects
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the center of this circle
 * @param y {number} The Y coordinate of the center of this circle
 * @param radius {number} The radius of the circle
 */
function Circle(x, y, radius)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.radius = radius || 0;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     */
    this.type = CONST.SHAPES.CIRC;
}

Circle.prototype.constructor = Circle;
module.exports = Circle;

/**
 * Creates a clone of this Circle instance
 *
 * @return {PIXI.Circle} a copy of the Circle
 */
Circle.prototype.clone = function ()
{
    return new Circle(this.x, this.y, this.radius);
};

/**
 * Checks whether the x and y coordinates given are contained within this circle
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this Circle
 */
Circle.prototype.contains = function (x, y)
{
    if (this.radius <= 0)
    {
        return false;
    }

    var dx = (this.x - x),
        dy = (this.y - y),
        r2 = this.radius * this.radius;

    dx *= dx;
    dy *= dy;

    return (dx + dy <= r2);
};

/**
* Returns the framing rectangle of the circle as a Rectangle object
*
* @return {PIXI.Rectangle} the framing rectangle
*/
Circle.prototype.getBounds = function ()
{
    return new Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
};

},{"../../const":22,"./Rectangle":37}],35:[function(require,module,exports){
var Rectangle = require('./Rectangle'),
    CONST = require('../../const');

/**
 * The Ellipse object can be used to specify a hit area for displayObjects
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the center of the ellipse
 * @param y {number} The Y coordinate of the center of the ellipse
 * @param width {number} The half width of this ellipse
 * @param height {number} The half height of this ellipse
 */
function Ellipse(x, y, width, height)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.width = width || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.height = height || 0;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     */
    this.type = CONST.SHAPES.ELIP;
}

Ellipse.prototype.constructor = Ellipse;
module.exports = Ellipse;

/**
 * Creates a clone of this Ellipse instance
 *
 * @return {PIXI.Ellipse} a copy of the ellipse
 */
Ellipse.prototype.clone = function ()
{
    return new Ellipse(this.x, this.y, this.width, this.height);
};

/**
 * Checks whether the x and y coordinates given are contained within this ellipse
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coords are within this ellipse
 */
Ellipse.prototype.contains = function (x, y)
{
    if (this.width <= 0 || this.height <= 0)
    {
        return false;
    }

    //normalize the coords to an ellipse with center 0,0
    var normx = ((x - this.x) / this.width),
        normy = ((y - this.y) / this.height);

    normx *= normx;
    normy *= normy;

    return (normx + normy <= 1);
};

/**
 * Returns the framing rectangle of the ellipse as a Rectangle object
 *
 * @return {PIXI.Rectangle} the framing rectangle
 */
Ellipse.prototype.getBounds = function ()
{
    return new Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
};

},{"../../const":22,"./Rectangle":37}],36:[function(require,module,exports){
var Point = require('../Point'),
    CONST = require('../../const');

/**
 * @class
 * @memberof PIXI
 * @param points {PIXI.Point[]|number[]|...PIXI.Point|...number} This can be an array of Points that form the polygon,
 *      a flat array of numbers that will be interpreted as [x,y, x,y, ...], or the arguments passed can be
 *      all the points of the polygon e.g. `new PIXI.Polygon(new PIXI.Point(), new PIXI.Point(), ...)`, or the
 *      arguments passed can be flat x,y values e.g. `new Polygon(x,y, x,y, x,y, ...)` where `x` and `y` are
 *      Numbers.
 */
function Polygon(points_)
{
    // prevents an argument assignment deopt
    // see section 3.1: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    var points = points_;

    //if points isn't an array, use arguments as the array
    if (!Array.isArray(points))
    {
        // prevents an argument leak deopt
        // see section 3.2: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
        points = new Array(arguments.length);

        for (var a = 0; a < points.length; ++a) {
            points[a] = arguments[a];
        }
    }

    // if this is an array of points, convert it to a flat array of numbers
    if (points[0] instanceof Point)
    {
        var p = [];
        for (var i = 0, il = points.length; i < il; i++)
        {
            p.push(points[i].x, points[i].y);
        }

        points = p;
    }

    this.closed = true;

    /**
     * An array of the points of this polygon
     *
     * @member {number[]}
     */
    this.points = points;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     */
    this.type = CONST.SHAPES.POLY;
}

Polygon.prototype.constructor = Polygon;
module.exports = Polygon;

/**
 * Creates a clone of this polygon
 *
 * @return {PIXI.Polygon} a copy of the polygon
 */
Polygon.prototype.clone = function ()
{
    return new Polygon(this.points.slice());
};

/**
 * Checks whether the x and y coordinates passed to this function are contained within this polygon
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this polygon
 */
Polygon.prototype.contains = function (x, y)
{
    var inside = false;

    // use some raycasting to test hits
    // https://github.com/substack/point-in-polygon/blob/master/index.js
    var length = this.points.length / 2;

    for (var i = 0, j = length - 1; i < length; j = i++)
    {
        var xi = this.points[i * 2], yi = this.points[i * 2 + 1],
            xj = this.points[j * 2], yj = this.points[j * 2 + 1],
            intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect)
        {
            inside = !inside;
        }
    }

    return inside;
};

},{"../../const":22,"../Point":32}],37:[function(require,module,exports){
var CONST = require('../../const');

/**
 * the Rectangle object is an area defined by its position, as indicated by its top-left corner point (x, y) and by its width and its height.
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the upper-left corner of the rectangle
 * @param y {number} The Y coordinate of the upper-left corner of the rectangle
 * @param width {number} The overall width of this rectangle
 * @param height {number} The overall height of this rectangle
 */
function Rectangle(x, y, width, height)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.width = width || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.height = height || 0;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     */
    this.type = CONST.SHAPES.RECT;
}

Rectangle.prototype.constructor = Rectangle;
module.exports = Rectangle;

/**
 * A constant empty rectangle.
 *
 * @static
 * @constant
 */
Rectangle.EMPTY = new Rectangle(0, 0, 0, 0);


/**
 * Creates a clone of this Rectangle
 *
 * @return {PIXI.Rectangle} a copy of the rectangle
 */
Rectangle.prototype.clone = function ()
{
    return new Rectangle(this.x, this.y, this.width, this.height);
};

/**
 * Checks whether the x and y coordinates given are contained within this Rectangle
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this Rectangle
 */
Rectangle.prototype.contains = function (x, y)
{
    if (this.width <= 0 || this.height <= 0)
    {
        return false;
    }

    if (x >= this.x && x < this.x + this.width)
    {
        if (y >= this.y && y < this.y + this.height)
        {
            return true;
        }
    }

    return false;
};

},{"../../const":22}],38:[function(require,module,exports){
var CONST = require('../../const');

/**
 * The Rounded Rectangle object is an area that has nice rounded corners, as indicated by its top-left corner point (x, y) and by its width and its height and its radius.
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the upper-left corner of the rounded rectangle
 * @param y {number} The Y coordinate of the upper-left corner of the rounded rectangle
 * @param width {number} The overall width of this rounded rectangle
 * @param height {number} The overall height of this rounded rectangle
 * @param radius {number} Controls the radius of the rounded corners
 */
function RoundedRectangle(x, y, width, height, radius)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.width = width || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.height = height || 0;

    /**
     * @member {number}
     * @default 20
     */
    this.radius = radius || 20;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     */
    this.type = CONST.SHAPES.RREC;
}

RoundedRectangle.prototype.constructor = RoundedRectangle;
module.exports = RoundedRectangle;

/**
 * Creates a clone of this Rounded Rectangle
 *
 * @return {PIXI.RoundedRectangle} a copy of the rounded rectangle
 */
RoundedRectangle.prototype.clone = function ()
{
    return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
};

/**
 * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this Rounded Rectangle
 */
RoundedRectangle.prototype.contains = function (x, y)
{
    if (this.width <= 0 || this.height <= 0)
    {
        return false;
    }

    if (x >= this.x && x <= this.x + this.width)
    {
        if (y >= this.y && y <= this.y + this.height)
        {
            return true;
        }
    }

    return false;
};

},{"../../const":22}],39:[function(require,module,exports){
var Container = require('../display/Container'),
    CONST = require('../const');

/**
 * The ParticleContainer class is a really fast version of the Container built solely for speed,
 * so use when you need a lot of sprites or particles. The tradeoff of the ParticleContainer is that advanced
 * functionality will not work. ParticleContainer implements only the basic object transform (position, scale, rotation).
 * Any other functionality like tinting, masking, etc will not work on sprites in this batch.
 *
 * It's extremely easy to use :
 *
 * ```js
 * var container = new ParticleContainer();
 *
 * for (var i = 0; i < 100; ++i)
 * {
 *     var sprite = new PIXI.Sprite.fromImage("myImage.png");
 *     container.addChild(sprite);
 * }
 * ```
 *
 * And here you have a hundred sprites that will be renderer at the speed of light.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 * @param [maxSize=15000] {number} The maximum number of particles that can be renderer by the container.
 * @param [properties] {object} The properties of children that should be uploaded to the gpu and applied.
 * @param [properties.scale=false] {boolean} When true, scale be uploaded and applied.
 * @param [properties.position=true] {boolean} When true, position be uploaded and applied.
 * @param [properties.rotation=false] {boolean} When true, rotation be uploaded and applied.
 * @param [properties.uvs=false] {boolean} When true, uvs be uploaded and applied.
 * @param [properties.alpha=false] {boolean} When true, alpha be uploaded and applied.
 * @param [batchSize=15000] {number} Number of particles per batch.
 */
function ParticleContainer(maxSize, properties, batchSize)
{
    Container.call(this);

    batchSize = batchSize || 15000; //CONST.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop
    maxSize = maxSize || 15000;

    // Making sure the batch size is valid
    // 65535 is max vertex index in the index buffer (see ParticleRenderer)
    // so max number of particles is 65536 / 4 = 16384
    var maxBatchSize = 16384;
    if (batchSize > maxBatchSize) {
        batchSize = maxBatchSize;
    }

    if (batchSize > maxSize) {
        batchSize = maxSize;
    }

    /**
     * Set properties to be dynamic (true) / static (false)
     *
     * @member {boolean[]}
     * @private
     */
    this._properties = [false, true, false, false, false];

    /**
     * @member {number}
     * @private
     */
    this._maxSize = maxSize;

    /**
     * @member {number}
     * @private
     */
    this._batchSize = batchSize;

    /**
     * @member {WebGLBuffer}
     * @private
     */
    this._buffers = null;

    /**
     * @member {number}
     * @private
     */
    this._bufferToUpdate = 0;

    /**
     * @member {boolean}
     *
     */
    this.interactiveChildren = false;

    /**
     * The blend mode to be applied to the sprite. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    this.blendMode = CONST.BLEND_MODES.NORMAL;

    /**
     * Used for canvas renderering. If true then the elements will be positioned at the nearest pixel. This provides a nice speed boost.
     *
     * @member {boolean}
     * @default true;
     */
    this.roundPixels = true;

    this.setProperties(properties);
}

ParticleContainer.prototype = Object.create(Container.prototype);
ParticleContainer.prototype.constructor = ParticleContainer;
module.exports = ParticleContainer;

/**
 * Sets the private properties array to dynamic / static based on the passed properties object
 *
 * @param properties {object} The properties to be uploaded
 */
ParticleContainer.prototype.setProperties = function(properties)
{
    if ( properties ) {
        this._properties[0] = 'scale' in properties ? !!properties.scale : this._properties[0];
        this._properties[1] = 'position' in properties ? !!properties.position : this._properties[1];
        this._properties[2] = 'rotation' in properties ? !!properties.rotation : this._properties[2];
        this._properties[3] = 'uvs' in properties ? !!properties.uvs : this._properties[3];
        this._properties[4] = 'alpha' in properties ? !!properties.alpha : this._properties[4];
    }
};

/**
 * Updates the object transform for rendering
 *
 * @private
 */
ParticleContainer.prototype.updateTransform = function ()
{

    // TODO don't need to!
    this.displayObjectUpdateTransform();
    //  PIXI.Container.prototype.updateTransform.call( this );
};

/**
 * Renders the container using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The webgl renderer
 * @private
 */
ParticleContainer.prototype.renderWebGL = function (renderer)
{
    if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable)
    {
        return;
    }

    renderer.setObjectRenderer( renderer.plugins.particle );
    renderer.plugins.particle.render( this );
};

/**
 * Set the flag that static data should be updated to true
 *
 * @private
 */
ParticleContainer.prototype.onChildrenChange = function (smallestChildIndex)
{
    var bufferIndex = Math.floor(smallestChildIndex / this._batchSize);
    if (bufferIndex < this._bufferToUpdate) {
        this._bufferToUpdate = bufferIndex;
    }
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} The canvas renderer
 * @private
 */
ParticleContainer.prototype.renderCanvas = function (renderer)
{
    if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable)
    {
        return;
    }

    var context = renderer.context;
    var transform = this.worldTransform;
    var isRotated = true;

    var positionX = 0;
    var positionY = 0;

    var finalWidth = 0;
    var finalHeight = 0;

    var compositeOperation = renderer.blendModes[this.blendMode];
    if (compositeOperation !== context.globalCompositeOperation)
    {
        context.globalCompositeOperation = compositeOperation;
    }

    context.globalAlpha = this.worldAlpha;

    this.displayObjectUpdateTransform();

    for (var i = 0; i < this.children.length; ++i)
    {
        var child = this.children[i];

        if (!child.visible)
        {
            continue;
        }

        var frame = child.texture.frame;

        context.globalAlpha = this.worldAlpha * child.alpha;

        if (child.rotation % (Math.PI * 2) === 0)
        {
            // this is the fastest  way to optimise! - if rotation is 0 then we can avoid any kind of setTransform call
            if (isRotated)
            {
                context.setTransform(
                    transform.a,
                    transform.b,
                    transform.c,
                    transform.d,
                    transform.tx,
                    transform.ty
                );

                isRotated = false;
            }

            positionX = ((child.anchor.x) * (-frame.width * child.scale.x) + child.position.x  + 0.5);
            positionY = ((child.anchor.y) * (-frame.height * child.scale.y) + child.position.y  + 0.5);

            finalWidth = frame.width * child.scale.x;
            finalHeight = frame.height * child.scale.y;

        }
        else
        {
            if (!isRotated)
            {
                isRotated = true;
            }

            child.displayObjectUpdateTransform();

            var childTransform = child.worldTransform;

            if (renderer.roundPixels)
            {
                context.setTransform(
                    childTransform.a,
                    childTransform.b,
                    childTransform.c,
                    childTransform.d,
                    childTransform.tx | 0,
                    childTransform.ty | 0
                );
            }
            else
            {
                context.setTransform(
                    childTransform.a,
                    childTransform.b,
                    childTransform.c,
                    childTransform.d,
                    childTransform.tx,
                    childTransform.ty
                );
            }

            positionX = ((child.anchor.x) * (-frame.width) + 0.5);
            positionY = ((child.anchor.y) * (-frame.height) + 0.5);

            finalWidth = frame.width;
            finalHeight = frame.height;
        }

        context.drawImage(
            child.texture.baseTexture.source,
            frame.x,
            frame.y,
            frame.width,
            frame.height,
            positionX,
            positionY,
            finalWidth,
            finalHeight
        );
    }
};

/**
 * Destroys the container
 *
 * @param [destroyChildren=false] {boolean} if set to true, all the children will have their destroy method called as well
 */
ParticleContainer.prototype.destroy = function () {
    Container.prototype.destroy.apply(this, arguments);

    if (this._buffers) {
        for (var i = 0; i < this._buffers.length; ++i) {
            this._buffers[i].destroy();
        }
    }

    this._properties = null;
    this._buffers = null;
};

},{"../const":22,"../display/Container":23}],40:[function(require,module,exports){

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's ParticleBuffer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/ParticleBuffer.java
 */

/**
 * The particle buffer manages the static and dynamic buffers for a particle container.
 *
 * @class
 * @private
 * @memberof PIXI
 */
function ParticleBuffer(gl, properties, dynamicPropertyFlags, size)
{
    /**
     * The current WebGL drawing context.
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    /**
     * Size of a single vertex.
     *
     * @member {number}
     */
    this.vertSize = 2;

    /**
     * Size of a single vertex in bytes.
     *
     * @member {number}
     */
    this.vertByteSize = this.vertSize * 4;

    /**
     * The number of particles the buffer can hold
     *
     * @member {number}
     */
    this.size = size;

    /**
     * A list of the properties that are dynamic.
     *
     * @member {object[]}
     */
    this.dynamicProperties = [];

    /**
     * A list of the properties that are static.
     *
     * @member {object[]}
     */
    this.staticProperties = [];

    for (var i = 0; i < properties.length; i++)
    {
        var property = properties[i];

        if(dynamicPropertyFlags[i])
        {
            this.dynamicProperties.push(property);
        }
        else
        {
            this.staticProperties.push(property);
        }
    }

    this.staticStride = 0;
    this.staticBuffer = null;
    this.staticData = null;

    this.dynamicStride = 0;
    this.dynamicBuffer = null;
    this.dynamicData = null;

    this.initBuffers();

}

ParticleBuffer.prototype.constructor = ParticleBuffer;
module.exports = ParticleBuffer;

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 */
ParticleBuffer.prototype.initBuffers = function ()
{
    var gl = this.gl;
    var i;
    var property;

    var dynamicOffset = 0;
    this.dynamicStride = 0;

    for (i = 0; i < this.dynamicProperties.length; i++)
    {
        property = this.dynamicProperties[i];

        property.offset = dynamicOffset;
        dynamicOffset += property.size;
        this.dynamicStride += property.size;
    }

    this.dynamicData = new Float32Array( this.size * this.dynamicStride * 4);
    this.dynamicBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.dynamicData, gl.DYNAMIC_DRAW);


    // static //
    var staticOffset = 0;
    this.staticStride = 0;

    for (i = 0; i < this.staticProperties.length; i++)
    {
        property = this.staticProperties[i];

        property.offset = staticOffset;
        staticOffset += property.size;
        this.staticStride += property.size;
    }

    this.staticData = new Float32Array( this.size * this.staticStride * 4);
    this.staticBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.staticData, gl.DYNAMIC_DRAW);
};

/**
 * Uploads the dynamic properties.
 *
 */
ParticleBuffer.prototype.uploadDynamic = function(children, startIndex, amount)
{
    var gl = this.gl;

    for (var i = 0; i < this.dynamicProperties.length; i++)
    {
        var property = this.dynamicProperties[i];
        property.uploadFunction(children, startIndex, amount, this.dynamicData, this.dynamicStride, property.offset);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.dynamicData);
};

/**
 * Uploads the static properties.
 *
 */
ParticleBuffer.prototype.uploadStatic = function(children, startIndex, amount)
{
    var gl = this.gl;

    for (var i = 0; i < this.staticProperties.length; i++)
    {
        var property = this.staticProperties[i];
        property.uploadFunction(children, startIndex, amount, this.staticData, this.staticStride, property.offset);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.staticData);
};

/**
 * Binds the buffers to the GPU
 *
 */
ParticleBuffer.prototype.bind = function ()
{
    var gl = this.gl;
    var i, property;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);

    for (i = 0; i < this.dynamicProperties.length; i++)
    {
        property = this.dynamicProperties[i];
        gl.vertexAttribPointer(property.attribute, property.size, gl.FLOAT, false, this.dynamicStride * 4, property.offset * 4);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);

    for (i = 0; i < this.staticProperties.length; i++)
    {
        property = this.staticProperties[i];
        gl.vertexAttribPointer(property.attribute, property.size, gl.FLOAT, false, this.staticStride * 4, property.offset * 4);
    }
};

/**
 * Destroys the ParticleBuffer.
 *
 */
ParticleBuffer.prototype.destroy = function ()
{
    this.dynamicProperties = null;
    this.dynamicData = null;
    this.gl.deleteBuffer(this.dynamicBuffer);

    this.staticProperties = null;
    this.staticData = null;
    this.gl.deleteBuffer(this.staticBuffer);
};

},{}],41:[function(require,module,exports){
var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    ParticleShader = require('./ParticleShader'),
    ParticleBuffer = require('./ParticleBuffer'),
    math            = require('../../math');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's ParticleRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/ParticleRenderer.java
 */

/**
 *
 * @class
 * @private
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
 */
function ParticleRenderer(renderer)
{
    ObjectRenderer.call(this, renderer);

    // 65535 is max vertex index in the index buffer (see ParticleRenderer)
    // so max number of particles is 65536 / 4 = 16384
    // and max number of element in the index buffer is 16384 * 6 = 98304
    // Creating a full index buffer, overhead is 98304 * 2 = 196Ko
    var numIndices = 98304;

    /**
     * Holds the indices
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array(numIndices);

    for (var i=0, j=0; i < numIndices; i += 6, j += 4)
    {
        this.indices[i + 0] = j + 0;
        this.indices[i + 1] = j + 1;
        this.indices[i + 2] = j + 2;
        this.indices[i + 3] = j + 0;
        this.indices[i + 4] = j + 2;
        this.indices[i + 5] = j + 3;
    }

    /**
     * The default shader that is used if a sprite doesn't have a more specific one.
     *
     * @member {PIXI.Shader}
     */
    this.shader = null;

    this.indexBuffer = null;

    this.properties = null;

    this.tempMatrix = new math.Matrix();
}

ParticleRenderer.prototype = Object.create(ObjectRenderer.prototype);
ParticleRenderer.prototype.constructor = ParticleRenderer;
module.exports = ParticleRenderer;

WebGLRenderer.registerPlugin('particle', ParticleRenderer);

/**
 * When there is a WebGL context change
 *
 * @private
 */
ParticleRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;

    // setup default shader
    this.shader = new ParticleShader(this.renderer.shaderManager);

    this.indexBuffer = gl.createBuffer();

    // 65535 is max index, so 65535 / 6 = 10922.

    //upload the index data
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    this.properties = [
        // verticesData
        {
            attribute:this.shader.attributes.aVertexPosition,
            size:2,
            uploadFunction:this.uploadVertices,
            offset:0
        },
        // positionData
        {
            attribute:this.shader.attributes.aPositionCoord,
            size:2,
            uploadFunction:this.uploadPosition,
            offset:0
        },
        // rotationData
        {
            attribute:this.shader.attributes.aRotation,
            size:1,
            uploadFunction:this.uploadRotation,
            offset:0
        },
        // uvsData
        {
            attribute:this.shader.attributes.aTextureCoord,
            size:2,
            uploadFunction:this.uploadUvs,
            offset:0
        },
        // alphaData
        {
            attribute:this.shader.attributes.aColor,
            size:1,
            uploadFunction:this.uploadAlpha,
            offset:0
        }
    ];
};

/**
 * Starts a new particle batch.
 *
 */
ParticleRenderer.prototype.start = function ()
{
    var gl = this.renderer.gl;

    // bind the main texture
    gl.activeTexture(gl.TEXTURE0);

    // bind the buffers

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    var shader = this.shader;

    this.renderer.shaderManager.setShader(shader);
};


/**
 * Renders the particle container object.
 *
 * @param container {PIXI.ParticleContainer} The container to render using this ParticleRenderer
 */
ParticleRenderer.prototype.render = function (container)
{
    var children = container.children,
        totalChildren = children.length,
        maxSize = container._maxSize,
        batchSize = container._batchSize;

    if(totalChildren === 0)
    {
        return;
    }
    else if(totalChildren > maxSize)
    {
        totalChildren = maxSize;
    }

    if(!container._buffers)
    {
        container._buffers = this.generateBuffers( container );
    }

    // if the uvs have not updated then no point rendering just yet!
    this.renderer.blendModeManager.setBlendMode(container.blendMode);

    var gl = this.renderer.gl;

    var m =  container.worldTransform.copy( this.tempMatrix );
    m.prepend( this.renderer.currentRenderTarget.projectionMatrix );
    gl.uniformMatrix3fv(this.shader.uniforms.projectionMatrix._location, false, m.toArray(true));
    gl.uniform1f(this.shader.uniforms.uAlpha._location, container.worldAlpha);


    // make sure the texture is bound..
    var baseTexture = children[0]._texture.baseTexture;

    if (!baseTexture._glTextures[gl.id])
    {
        // if the texture has not updated then lets not upload any static properties
        if(!this.renderer.updateTexture(baseTexture))
        {
            return;
        }

        if(!container._properties[0] || !container._properties[3])
        {
            container._bufferToUpdate = 0;
        }
    }
    else
    {
        gl.bindTexture(gl.TEXTURE_2D, baseTexture._glTextures[gl.id]);
    }

    // now lets upload and render the buffers..
    for (var i = 0, j = 0; i < totalChildren; i += batchSize, j += 1)
    {
        var amount = ( totalChildren - i);
        if(amount > batchSize)
        {
            amount = batchSize;
        }

        var buffer = container._buffers[j];

        // we always upload the dynamic
        buffer.uploadDynamic(children, i, amount);

        // we only upload the static content when we have to!
        if(container._bufferToUpdate === j)
        {
            buffer.uploadStatic(children, i, amount);
            container._bufferToUpdate = j + 1;
        }

        // bind the buffer
        buffer.bind( this.shader );

         // now draw those suckas!
        gl.drawElements(gl.TRIANGLES, amount * 6, gl.UNSIGNED_SHORT, 0);
        this.renderer.drawCount++;
    }
};

/**
 * Creates one particle buffer for each child in the container we want to render and updates internal properties
 *
 * @param container {PIXI.ParticleContainer} The container to render using this ParticleRenderer
 */
ParticleRenderer.prototype.generateBuffers = function (container)
{
    var gl = this.renderer.gl,
        buffers = [],
        size = container._maxSize,
        batchSize = container._batchSize,
        dynamicPropertyFlags = container._properties,
        i;

    for (i = 0; i < size; i += batchSize)
    {
        buffers.push(new ParticleBuffer(gl, this.properties, dynamicPropertyFlags, batchSize));
    }

    return buffers;
};

/**
 * Uploads the verticies.
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their vertices uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadVertices = function (children, startIndex, amount, array, stride, offset)
{
    var sprite,
        texture,
        trim,
        sx,
        sy,
        w0, w1, h0, h1;

    for (var i = 0; i < amount; i++) {

        sprite = children[startIndex + i];
        texture = sprite._texture;
        sx = sprite.scale.x;
        sy = sprite.scale.y;

        if (texture.trim)
        {
            // if the sprite is trimmed then we need to add the extra space before transforming the sprite coords..
            trim = texture.trim;

            w1 = trim.x - sprite.anchor.x * trim.width;
            w0 = w1 + texture.crop.width;

            h1 = trim.y - sprite.anchor.y * trim.height;
            h0 = h1 + texture.crop.height;
        }
        else
        {
            w0 = (texture._frame.width ) * (1-sprite.anchor.x);
            w1 = (texture._frame.width ) * -sprite.anchor.x;

            h0 = texture._frame.height * (1-sprite.anchor.y);
            h1 = texture._frame.height * -sprite.anchor.y;
        }

        array[offset] = w1 * sx;
        array[offset + 1] = h1 * sy;

        array[offset + stride] = w0 * sx;
        array[offset + stride + 1] = h1 * sy;

        array[offset + stride * 2] = w0 * sx;
        array[offset + stride * 2 + 1] = h0 * sy;

        array[offset + stride * 3] = w1 * sx;
        array[offset + stride * 3 + 1] = h0 * sy;

        offset += stride * 4;
    }

};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their positions uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadPosition = function (children,startIndex, amount, array, stride, offset)
{
    for (var i = 0; i < amount; i++)
    {
        var spritePosition = children[startIndex + i].position;

        array[offset] = spritePosition.x;
        array[offset + 1] = spritePosition.y;

        array[offset + stride] = spritePosition.x;
        array[offset + stride + 1] = spritePosition.y;

        array[offset + stride * 2] = spritePosition.x;
        array[offset + stride * 2 + 1] = spritePosition.y;

        array[offset + stride * 3] = spritePosition.x;
        array[offset + stride * 3 + 1] = spritePosition.y;

        offset += stride * 4;
    }

};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their rotation uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadRotation = function (children,startIndex, amount, array, stride, offset)
{
    for (var i = 0; i < amount; i++)
    {
        var spriteRotation = children[startIndex + i].rotation;


        array[offset] = spriteRotation;
        array[offset + stride] = spriteRotation;
        array[offset + stride * 2] = spriteRotation;
        array[offset + stride * 3] = spriteRotation;

        offset += stride * 4;
    }
};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their Uvs uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadUvs = function (children,startIndex, amount, array, stride, offset)
{
    for (var i = 0; i < amount; i++)
    {
        var textureUvs = children[startIndex + i]._texture._uvs;

        if (textureUvs)
        {
            array[offset] = textureUvs.x0;
            array[offset + 1] = textureUvs.y0;

            array[offset + stride] = textureUvs.x1;
            array[offset + stride + 1] = textureUvs.y1;

            array[offset + stride * 2] = textureUvs.x2;
            array[offset + stride * 2 + 1] = textureUvs.y2;

            array[offset + stride * 3] = textureUvs.x3;
            array[offset + stride * 3 + 1] = textureUvs.y3;

            offset += stride * 4;
        }
        else
        {
            //TODO you know this can be easier!
            array[offset] = 0;
            array[offset + 1] = 0;

            array[offset + stride] = 0;
            array[offset + stride + 1] = 0;

            array[offset + stride * 2] = 0;
            array[offset + stride * 2 + 1] = 0;

            array[offset + stride * 3] = 0;
            array[offset + stride * 3 + 1] = 0;

            offset += stride * 4;
        }
    }
};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their alpha uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadAlpha = function (children,startIndex, amount, array, stride, offset)
{
     for (var i = 0; i < amount; i++)
     {
        var spriteAlpha = children[startIndex + i].alpha;

        array[offset] = spriteAlpha;
        array[offset + stride] = spriteAlpha;
        array[offset + stride * 2] = spriteAlpha;
        array[offset + stride * 3] = spriteAlpha;

        offset += stride * 4;
    }
};


/**
 * Destroys the ParticleRenderer.
 *
 */
ParticleRenderer.prototype.destroy = function ()
{
    if (this.renderer.gl) {
        this.renderer.gl.deleteBuffer(this.indexBuffer);
    }

    ObjectRenderer.prototype.destroy.apply(this, arguments);

    this.shader.destroy();

    this.indices = null;
    this.tempMatrix = null;
};

},{"../../math":33,"../../renderers/webgl/WebGLRenderer":49,"../../renderers/webgl/utils/ObjectRenderer":63,"./ParticleBuffer":40,"./ParticleShader":42}],42:[function(require,module,exports){
var TextureShader = require('../../renderers/webgl/shaders/TextureShader');

/**
 * @class
 * @extends PIXI.TextureShader
 * @memberof PIXI
 * @param shaderManager {ShaderManager} The webgl shader manager this shader works for.
 */
function ParticleShader(shaderManager)
{
    TextureShader.call(this,
        shaderManager,
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'attribute float aColor;',

            'attribute vec2 aPositionCoord;',
            'attribute vec2 aScale;',
            'attribute float aRotation;',

            'uniform mat3 projectionMatrix;',

            'varying vec2 vTextureCoord;',
            'varying float vColor;',

            'void main(void){',
            '   vec2 v = aVertexPosition;',

            '   v.x = (aVertexPosition.x) * cos(aRotation) - (aVertexPosition.y) * sin(aRotation);',
            '   v.y = (aVertexPosition.x) * sin(aRotation) + (aVertexPosition.y) * cos(aRotation);',
            '   v = v + aPositionCoord;',

            '   gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);',

            '   vTextureCoord = aTextureCoord;',
            '   vColor = aColor;',
            '}'
        ].join('\n'),
        // hello
         [
            'precision lowp float;',

            'varying vec2 vTextureCoord;',
            'varying float vColor;',

            'uniform sampler2D uSampler;',
            'uniform float uAlpha;',

            'void main(void){',
            '  vec4 color = texture2D(uSampler, vTextureCoord) * vColor * uAlpha;',
            '  if (color.a == 0.0) discard;',
            '  gl_FragColor = color;',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            uAlpha:  { type: '1f', value: 1 }
        },
        // custom attributes
        {
            aPositionCoord: 0,
           // aScale:         0,
            aRotation:      0
        }
    );

    // TEMP HACK

}

ParticleShader.prototype = Object.create(TextureShader.prototype);
ParticleShader.prototype.constructor = ParticleShader;

module.exports = ParticleShader;

},{"../../renderers/webgl/shaders/TextureShader":62}],43:[function(require,module,exports){
var utils = require('../utils'),
    math = require('../math'),
    CONST = require('../const'),
    EventEmitter = require('eventemitter3');

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas. This renderer should be used for browsers that do not support webGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @param system {string} The name of the system this renderer is for.
 * @param [width=800] {number} the width of the canvas view
 * @param [height=600] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass.
 * @param [options.backgroundColor=0x000000] {number} The background color of the rendered area (shown if not transparent).
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
 */
function SystemRenderer(system, width, height, options)
{
    EventEmitter.call(this);

    utils.sayHello(system);

    // prepare options
    if (options)
    {
        for (var i in CONST.DEFAULT_RENDER_OPTIONS)
        {
            if (typeof options[i] === 'undefined')
            {
                options[i] = CONST.DEFAULT_RENDER_OPTIONS[i];
            }
        }
    }
    else
    {
        options = CONST.DEFAULT_RENDER_OPTIONS;
    }

    /**
     * The type of the renderer.
     *
     * @member {number}
     * @default PIXI.RENDERER_TYPE.UNKNOWN
     * @see PIXI.RENDERER_TYPE
     */
    this.type = CONST.RENDERER_TYPE.UNKNOWN;

    /**
     * The width of the canvas view
     *
     * @member {number}
     * @default 800
     */
    this.width = width || 800;

    /**
     * The height of the canvas view
     *
     * @member {number}
     * @default 600
     */
    this.height = height || 600;

    /**
     * The canvas element that everything is drawn to
     *
     * @member {HTMLCanvasElement}
     */
    this.view = options.view || document.createElement('canvas');

    /**
     * The resolution of the renderer
     *
     * @member {number}
     * @default 1
     */
    this.resolution = options.resolution;

    /**
     * Whether the render view is transparent
     *
     * @member {boolean}
     */
    this.transparent = options.transparent;

    /**
     * Whether the render view should be resized automatically
     *
     * @member {boolean}
     */
    this.autoResize = options.autoResize || false;

    /**
     * Tracks the blend modes useful for this renderer.
     *
     * @member {object<string, mixed>}
     */
    this.blendModes = null;

    /**
     * The value of the preserveDrawingBuffer flag affects whether or not the contents of the stencil buffer is retained after rendering.
     *
     * @member {boolean}
     */
    this.preserveDrawingBuffer = options.preserveDrawingBuffer;

    /**
     * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
     * If the scene is NOT transparent Pixi will use a canvas sized fillRect operation every frame to set the canvas background color.
     * If the scene is transparent Pixi will use clearRect to clear the canvas every frame.
     * Disable this by setting this to false. For example if your game has a canvas filling background image you often don't need this set.
     *
     * @member {boolean}
     * @default
     */
    this.clearBeforeRender = options.clearBeforeRender;

    /**
     * If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
     * Handy for crisp pixel art and speed on legacy devices.
     *
     * @member {boolean}
     */
    this.roundPixels = options.roundPixels;

    /**
     * The background color as a number.
     *
     * @member {number}
     * @private
     */
    this._backgroundColor = 0x000000;

    /**
     * The background color as an [R, G, B] array.
     *
     * @member {number[]}
     * @private
     */
    this._backgroundColorRgb = [0, 0, 0];

    /**
     * The background color as a string.
     *
     * @member {string}
     * @private
     */
    this._backgroundColorString = '#000000';

    this.backgroundColor = options.backgroundColor || this._backgroundColor; // run bg color setter

    /**
     * This temporary display object used as the parent of the currently being rendered item
     *
     * @member {PIXI.DisplayObject}
     * @private
     */
    this._tempDisplayObjectParent = {worldTransform:new math.Matrix(), worldAlpha:1, children:[]};

    /**
     * The last root object that the renderer tried to render.
     *
     * @member {PIXI.DisplayObject}
     * @private
     */
    this._lastObjectRendered = this._tempDisplayObjectParent;
}

// constructor
SystemRenderer.prototype = Object.create(EventEmitter.prototype);
SystemRenderer.prototype.constructor = SystemRenderer;
module.exports = SystemRenderer;

Object.defineProperties(SystemRenderer.prototype, {
    /**
     * The background color to fill if not transparent
     *
     * @member {number}
     * @memberof PIXI.SystemRenderer#
     */
    backgroundColor:
    {
        get: function ()
        {
            return this._backgroundColor;
        },
        set: function (val)
        {
            this._backgroundColor = val;
            this._backgroundColorString = utils.hex2string(val);
            utils.hex2rgb(val, this._backgroundColorRgb);
        }
    }
});

/**
 * Resizes the canvas view to the specified width and height
 *
 * @param width {number} the new width of the canvas view
 * @param height {number} the new height of the canvas view
 */
SystemRenderer.prototype.resize = function (width, height) {
    this.width = width * this.resolution;
    this.height = height * this.resolution;

    this.view.width = this.width;
    this.view.height = this.height;

    if (this.autoResize)
    {
        this.view.style.width = this.width / this.resolution + 'px';
        this.view.style.height = this.height / this.resolution + 'px';
    }
};

/**
 * Removes everything from the renderer and optionally removes the Canvas DOM element.
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
SystemRenderer.prototype.destroy = function (removeView) {
    if (removeView && this.view.parentNode)
    {
        this.view.parentNode.removeChild(this.view);
    }

    this.type = CONST.RENDERER_TYPE.UNKNOWN;

    this.width = 0;
    this.height = 0;

    this.view = null;

    this.resolution = 0;

    this.transparent = false;

    this.autoResize = false;

    this.blendModes = null;

    this.preserveDrawingBuffer = false;
    this.clearBeforeRender = false;

    this.roundPixels = false;

    this._backgroundColor = 0;
    this._backgroundColorRgb = null;
    this._backgroundColorString = null;
};

},{"../const":22,"../math":33,"../utils":77,"eventemitter3":10}],44:[function(require,module,exports){
var SystemRenderer = require('../SystemRenderer'),
    CanvasMaskManager = require('./utils/CanvasMaskManager'),
    utils = require('../../utils'),
    math = require('../../math'),
    CONST = require('../../const');

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas. This renderer should be used for browsers that do not support webGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 * @param [width=800] {number} the width of the canvas view
 * @param [height=600] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass.
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
 */
function CanvasRenderer(width, height, options)
{
    options = options || {};

    SystemRenderer.call(this, 'Canvas', width, height, options);

    this.type = CONST.RENDERER_TYPE.CANVAS;

    /**
     * The canvas 2d context that everything is drawn with.
     *
     * @member {CanvasRenderingContext2D}
     */
    this.context = this.view.getContext('2d', { alpha: this.transparent });

    /**
     * Boolean flag controlling canvas refresh.
     *
     * @member {boolean}
     */
    this.refresh = true;

    /**
     * Instance of a CanvasMaskManager, handles masking when using the canvas renderer.
     *
     * @member {PIXI.CanvasMaskManager}
     */
    this.maskManager = new CanvasMaskManager();

    /**
     * The canvas property used to set the canvas smoothing property.
     *
     * @member {string}
     */
    this.smoothProperty = 'imageSmoothingEnabled';

    if (!this.context.imageSmoothingEnabled)
    {
        if (this.context.webkitImageSmoothingEnabled)
        {
            this.smoothProperty = 'webkitImageSmoothingEnabled';
        }
        else if (this.context.mozImageSmoothingEnabled)
        {
            this.smoothProperty = 'mozImageSmoothingEnabled';
        }
        else if (this.context.oImageSmoothingEnabled)
        {
            this.smoothProperty = 'oImageSmoothingEnabled';
        }
        else if (this.context.msImageSmoothingEnabled)
        {
            this.smoothProperty = 'msImageSmoothingEnabled';
        }
    }

    this.initPlugins();

    this._mapBlendModes();

    /**
     * This temporary display object used as the parent of the currently being rendered item
     *
     * @member {PIXI.DisplayObject}
     * @private
     */
    this._tempDisplayObjectParent = {
        worldTransform: new math.Matrix(),
        worldAlpha: 1
    };


    this.resize(width, height);
}

// constructor
CanvasRenderer.prototype = Object.create(SystemRenderer.prototype);
CanvasRenderer.prototype.constructor = CanvasRenderer;
module.exports = CanvasRenderer;
utils.pluginTarget.mixin(CanvasRenderer);

/**
 * Renders the object to this canvas view
 *
 * @param object {PIXI.DisplayObject} the object to be rendered
 */
CanvasRenderer.prototype.render = function (object)
{
    this.emit('prerender');

    var cacheParent = object.parent;

    this._lastObjectRendered = object;

    object.parent = this._tempDisplayObjectParent;

    // update the scene graph
    object.updateTransform();

    object.parent = cacheParent;

    this.context.setTransform(1, 0, 0, 1, 0, 0);

    this.context.globalAlpha = 1;

    this.context.globalCompositeOperation = this.blendModes[CONST.BLEND_MODES.NORMAL];

    if (navigator.isCocoonJS && this.view.screencanvas)
    {
        this.context.fillStyle = 'black';
        this.context.clear();
    }

    if (this.clearBeforeRender)
    {
        if (this.transparent)
        {
            this.context.clearRect(0, 0, this.width, this.height);
        }
        else
        {
            this.context.fillStyle = this._backgroundColorString;
            this.context.fillRect(0, 0, this.width , this.height);
        }
    }

    this.renderDisplayObject(object, this.context);

    this.emit('postrender');
};

/**
 * Removes everything from the renderer and optionally removes the Canvas DOM element.
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
CanvasRenderer.prototype.destroy = function (removeView)
{
    this.destroyPlugins();

    // call the base destroy
    SystemRenderer.prototype.destroy.call(this, removeView);

    this.context = null;

    this.refresh = true;

    this.maskManager.destroy();
    this.maskManager = null;

    this.smoothProperty = null;
};

/**
 * Renders a display object
 *
 * @param displayObject {PIXI.DisplayObject} The displayObject to render
 * @private
 */
CanvasRenderer.prototype.renderDisplayObject = function (displayObject, context)
{
    var tempContext = this.context;

    this.context = context;
    displayObject.renderCanvas(this);
    this.context = tempContext;
};

/**
 * @extends PIXI.SystemRenderer#resize
 *
 * @param {number} w
 * @param {number} h
 */
CanvasRenderer.prototype.resize = function (w, h)
{
    SystemRenderer.prototype.resize.call(this, w, h);

    //reset the scale mode.. oddly this seems to be reset when the canvas is resized.
    //surely a browser bug?? Let pixi fix that for you..
    if(this.smoothProperty)
    {
        this.context[this.smoothProperty] = (CONST.SCALE_MODES.DEFAULT === CONST.SCALE_MODES.LINEAR);
    }

};

/**
 * Maps Pixi blend modes to canvas blend modes.
 *
 * @private
 */
CanvasRenderer.prototype._mapBlendModes = function ()
{
    if (!this.blendModes)
    {
        this.blendModes = {};

        if (utils.canUseNewCanvasBlendModes())
        {
            this.blendModes[CONST.BLEND_MODES.NORMAL]        = 'source-over';
            this.blendModes[CONST.BLEND_MODES.ADD]           = 'lighter'; //IS THIS OK???
            this.blendModes[CONST.BLEND_MODES.MULTIPLY]      = 'multiply';
            this.blendModes[CONST.BLEND_MODES.SCREEN]        = 'screen';
            this.blendModes[CONST.BLEND_MODES.OVERLAY]       = 'overlay';
            this.blendModes[CONST.BLEND_MODES.DARKEN]        = 'darken';
            this.blendModes[CONST.BLEND_MODES.LIGHTEN]       = 'lighten';
            this.blendModes[CONST.BLEND_MODES.COLOR_DODGE]   = 'color-dodge';
            this.blendModes[CONST.BLEND_MODES.COLOR_BURN]    = 'color-burn';
            this.blendModes[CONST.BLEND_MODES.HARD_LIGHT]    = 'hard-light';
            this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT]    = 'soft-light';
            this.blendModes[CONST.BLEND_MODES.DIFFERENCE]    = 'difference';
            this.blendModes[CONST.BLEND_MODES.EXCLUSION]     = 'exclusion';
            this.blendModes[CONST.BLEND_MODES.HUE]           = 'hue';
            this.blendModes[CONST.BLEND_MODES.SATURATION]    = 'saturate';
            this.blendModes[CONST.BLEND_MODES.COLOR]         = 'color';
            this.blendModes[CONST.BLEND_MODES.LUMINOSITY]    = 'luminosity';
        }
        else
        {
            // this means that the browser does not support the cool new blend modes in canvas 'cough' ie 'cough'
            this.blendModes[CONST.BLEND_MODES.NORMAL]        = 'source-over';
            this.blendModes[CONST.BLEND_MODES.ADD]           = 'lighter'; //IS THIS OK???
            this.blendModes[CONST.BLEND_MODES.MULTIPLY]      = 'source-over';
            this.blendModes[CONST.BLEND_MODES.SCREEN]        = 'source-over';
            this.blendModes[CONST.BLEND_MODES.OVERLAY]       = 'source-over';
            this.blendModes[CONST.BLEND_MODES.DARKEN]        = 'source-over';
            this.blendModes[CONST.BLEND_MODES.LIGHTEN]       = 'source-over';
            this.blendModes[CONST.BLEND_MODES.COLOR_DODGE]   = 'source-over';
            this.blendModes[CONST.BLEND_MODES.COLOR_BURN]    = 'source-over';
            this.blendModes[CONST.BLEND_MODES.HARD_LIGHT]    = 'source-over';
            this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT]    = 'source-over';
            this.blendModes[CONST.BLEND_MODES.DIFFERENCE]    = 'source-over';
            this.blendModes[CONST.BLEND_MODES.EXCLUSION]     = 'source-over';
            this.blendModes[CONST.BLEND_MODES.HUE]           = 'source-over';
            this.blendModes[CONST.BLEND_MODES.SATURATION]    = 'source-over';
            this.blendModes[CONST.BLEND_MODES.COLOR]         = 'source-over';
            this.blendModes[CONST.BLEND_MODES.LUMINOSITY]    = 'source-over';
        }
    }
};

},{"../../const":22,"../../math":33,"../../utils":77,"../SystemRenderer":43,"./utils/CanvasMaskManager":47}],45:[function(require,module,exports){
/**
 * Creates a Canvas element of the given size.
 *
 * @class
 * @memberof PIXI
 * @param width {number} the width for the newly created canvas
 * @param height {number} the height for the newly created canvas
 */
function CanvasBuffer(width, height)
{
    /**
     * The Canvas object that belongs to this CanvasBuffer.
     *
     * @member {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas');

    /**
     * A CanvasRenderingContext2D object representing a two-dimensional rendering context.
     *
     * @member {CanvasRenderingContext2D}
     */
    this.context = this.canvas.getContext('2d');

    this.canvas.width = width;
    this.canvas.height = height;
}

CanvasBuffer.prototype.constructor = CanvasBuffer;
module.exports = CanvasBuffer;

Object.defineProperties(CanvasBuffer.prototype, {
    /**
     * The width of the canvas buffer in pixels.
     *
     * @member {number}
     * @memberof PIXI.CanvasBuffer#
     */
    width: {
        get: function ()
        {
            return this.canvas.width;
        },
        set: function (val)
        {
            this.canvas.width = val;
        }
    },
    /**
     * The height of the canvas buffer in pixels.
     *
     * @member {number}
     * @memberof PIXI.CanvasBuffer#
     */
    height: {
        get: function ()
        {
            return this.canvas.height;
        },
        set: function (val)
        {
            this.canvas.height = val;
        }
    }
});

/**
 * Clears the canvas that was created by the CanvasBuffer class.
 *
 * @private
 */
CanvasBuffer.prototype.clear = function ()
{
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
};

/**
 * Resizes the canvas to the specified width and height.
 *
 * @param width {number} the new width of the canvas
 * @param height {number} the new height of the canvas
 */
CanvasBuffer.prototype.resize = function (width, height)
{
    this.canvas.width = width;
    this.canvas.height = height;
};

/**
 * Destroys this canvas.
 *
 */
CanvasBuffer.prototype.destroy = function ()
{
    this.context = null;
    this.canvas = null;
};

},{}],46:[function(require,module,exports){
var CONST = require('../../../const');

/**
 * A set of functions used by the canvas renderer to draw the primitive graphics data.
 * @static
 * @class
 * @memberof PIXI
 */
var CanvasGraphics = {};
module.exports = CanvasGraphics;

/*
 * Renders a Graphics object to a canvas.
 *
 * @param graphics {PIXI.Graphics} the actual graphics object to render
 * @param context {CanvasRenderingContext2D} the 2d drawing method of the canvas
 */
CanvasGraphics.renderGraphics = function (graphics, context)
{
    var worldAlpha = graphics.worldAlpha;

    if (graphics.dirty)
    {
        this.updateGraphicsTint(graphics);
        graphics.dirty = false;
    }

    for (var i = 0; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];
        var shape = data.shape;

        var fillColor = data._fillTint;
        var lineColor = data._lineTint;

        context.lineWidth = data.lineWidth;

        if (data.type === CONST.SHAPES.POLY)
        {
            context.beginPath();

            var points = shape.points;

            context.moveTo(points[0], points[1]);

            for (var j=1; j < points.length/2; j++)
            {
                context.lineTo(points[j * 2], points[j * 2 + 1]);
            }

            if (shape.closed)
            {
                context.lineTo(points[0], points[1]);
            }

            // if the first and last point are the same close the path - much neater :)
            if (points[0] === points[points.length-2] && points[1] === points[points.length-1])
            {
                context.closePath();
            }

            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === CONST.SHAPES.RECT)
        {

            if (data.fillColor || data.fillColor === 0)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fillRect(shape.x, shape.y, shape.width, shape.height);

            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }
        }
        else if (data.type === CONST.SHAPES.CIRC)
        {
            // TODO - need to be Undefined!
            context.beginPath();
            context.arc(shape.x, shape.y, shape.radius,0,2*Math.PI);
            context.closePath();

            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === CONST.SHAPES.ELIP)
        {
            // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

            var w = shape.width * 2;
            var h = shape.height * 2;

            var x = shape.x - w/2;
            var y = shape.y - h/2;

            context.beginPath();

            var kappa = 0.5522848,
                ox = (w / 2) * kappa, // control point offset horizontal
                oy = (h / 2) * kappa, // control point offset vertical
                xe = x + w,           // x-end
                ye = y + h,           // y-end
                xm = x + w / 2,       // x-middle
                ym = y + h / 2;       // y-middle

            context.moveTo(x, ym);
            context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

            context.closePath();

            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === CONST.SHAPES.RREC)
        {
            var rx = shape.x;
            var ry = shape.y;
            var width = shape.width;
            var height = shape.height;
            var radius = shape.radius;

            var maxRadius = Math.min(width, height) / 2 | 0;
            radius = radius > maxRadius ? maxRadius : radius;

            context.beginPath();
            context.moveTo(rx, ry + radius);
            context.lineTo(rx, ry + height - radius);
            context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
            context.lineTo(rx + width - radius, ry + height);
            context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
            context.lineTo(rx + width, ry + radius);
            context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
            context.lineTo(rx + radius, ry);
            context.quadraticCurveTo(rx, ry, rx, ry + radius);
            context.closePath();

            if (data.fillColor || data.fillColor === 0)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();

            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
    }
};

/*
 * Renders a graphics mask
 *
 * @private
 * @param graphics {PIXI.Graphics} the graphics which will be used as a mask
 * @param context {CanvasRenderingContext2D} the context 2d method of the canvas
 */
CanvasGraphics.renderGraphicsMask = function (graphics, context)
{
    var len = graphics.graphicsData.length;

    if (len === 0)
    {
        return;
    }

    context.beginPath();

    for (var i = 0; i < len; i++)
    {
        var data = graphics.graphicsData[i];
        var shape = data.shape;

        if (data.type === CONST.SHAPES.POLY)
        {

            var points = shape.points;

            context.moveTo(points[0], points[1]);

            for (var j=1; j < points.length/2; j++)
            {
                context.lineTo(points[j * 2], points[j * 2 + 1]);
            }

            // if the first and last point are the same close the path - much neater :)
            if (points[0] === points[points.length-2] && points[1] === points[points.length-1])
            {
                context.closePath();
            }

        }
        else if (data.type === CONST.SHAPES.RECT)
        {
            context.rect(shape.x, shape.y, shape.width, shape.height);
            context.closePath();
        }
        else if (data.type === CONST.SHAPES.CIRC)
        {
            // TODO - need to be Undefined!
            context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
            context.closePath();
        }
        else if (data.type === CONST.SHAPES.ELIP)
        {

            // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

            var w = shape.width * 2;
            var h = shape.height * 2;

            var x = shape.x - w/2;
            var y = shape.y - h/2;

            var kappa = 0.5522848,
                ox = (w / 2) * kappa, // control point offset horizontal
                oy = (h / 2) * kappa, // control point offset vertical
                xe = x + w,           // x-end
                ye = y + h,           // y-end
                xm = x + w / 2,       // x-middle
                ym = y + h / 2;       // y-middle

            context.moveTo(x, ym);
            context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            context.closePath();
        }
        else if (data.type === CONST.SHAPES.RREC)
        {

            var rx = shape.x;
            var ry = shape.y;
            var width = shape.width;
            var height = shape.height;
            var radius = shape.radius;

            var maxRadius = Math.min(width, height) / 2 | 0;
            radius = radius > maxRadius ? maxRadius : radius;

            context.moveTo(rx, ry + radius);
            context.lineTo(rx, ry + height - radius);
            context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
            context.lineTo(rx + width - radius, ry + height);
            context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
            context.lineTo(rx + width, ry + radius);
            context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
            context.lineTo(rx + radius, ry);
            context.quadraticCurveTo(rx, ry, rx, ry + radius);
            context.closePath();
        }
    }
};

/*
 * Updates the tint of a graphics object
 *
 * @private
 * @param graphics {PIXI.Graphics} the graphics that will have its tint updated
 *
 */
CanvasGraphics.updateGraphicsTint = function (graphics)
{
    if (graphics.tint === 0xFFFFFF && graphics._prevTint === graphics.tint)
    {
        return;
    }
    graphics._prevTint = graphics.tint;

    var tintR = (graphics.tint >> 16 & 0xFF) / 255;
    var tintG = (graphics.tint >> 8 & 0xFF) / 255;
    var tintB = (graphics.tint & 0xFF)/ 255;

    for (var i = 0; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];

        var fillColor = data.fillColor | 0;
        var lineColor = data.lineColor | 0;

        /*
        var colorR = (fillColor >> 16 & 0xFF) / 255;
        var colorG = (fillColor >> 8 & 0xFF) / 255;
        var colorB = (fillColor & 0xFF) / 255;

        colorR *= tintR;
        colorG *= tintG;
        colorB *= tintB;

        fillColor = ((colorR*255 << 16) + (colorG*255 << 8) + colorB*255);

        colorR = (lineColor >> 16 & 0xFF) / 255;
        colorG = (lineColor >> 8 & 0xFF) / 255;
        colorB = (lineColor & 0xFF) / 255;

        colorR *= tintR;
        colorG *= tintG;
        colorB *= tintB;

        lineColor = ((colorR*255 << 16) + (colorG*255 << 8) + colorB*255);
        */

        // super inline cos im an optimization NAZI :)
        data._fillTint = (((fillColor >> 16 & 0xFF) / 255 * tintR*255 << 16) + ((fillColor >> 8 & 0xFF) / 255 * tintG*255 << 8) +  (fillColor & 0xFF) / 255 * tintB*255);
        data._lineTint = (((lineColor >> 16 & 0xFF) / 255 * tintR*255 << 16) + ((lineColor >> 8 & 0xFF) / 255 * tintG*255 << 8) +  (lineColor & 0xFF) / 255 * tintB*255);

    }
};


},{"../../../const":22}],47:[function(require,module,exports){
var CanvasGraphics = require('./CanvasGraphics');

/**
 * A set of functions used to handle masking.
 *
 * @class
 * @memberof PIXI
 */
function CanvasMaskManager()
{}

CanvasMaskManager.prototype.constructor = CanvasMaskManager;
module.exports = CanvasMaskManager;

/**
 * This method adds it to the current stack of masks.
 *
 * @param maskData {object} the maskData that will be pushed
 * @param renderer {PIXI.WebGLRenderer|PIXI.CanvasRenderer} The renderer context to use.
 */
CanvasMaskManager.prototype.pushMask = function (maskData, renderer)
{

    renderer.context.save();

    var cacheAlpha = maskData.alpha;
    var transform = maskData.worldTransform;
    var resolution = renderer.resolution;

    renderer.context.setTransform(
        transform.a * resolution,
        transform.b * resolution,
        transform.c * resolution,
        transform.d * resolution,
        transform.tx * resolution,
        transform.ty * resolution
    );

    //TODO suport sprite alpha masks??
    //lots of effort required. If demand is great enough..
    if(!maskData.texture)
    {
        CanvasGraphics.renderGraphicsMask(maskData, renderer.context);
        renderer.context.clip();
    }

    maskData.worldAlpha = cacheAlpha;
};

/**
 * Restores the current drawing context to the state it was before the mask was applied.
 *
 * @param renderer {PIXI.WebGLRenderer|PIXI.CanvasRenderer} The renderer context to use.
 */
CanvasMaskManager.prototype.popMask = function (renderer)
{
    renderer.context.restore();
};

CanvasMaskManager.prototype.destroy = function () {};

},{"./CanvasGraphics":46}],48:[function(require,module,exports){
var utils = require('../../../utils');

/**
 * Utility methods for Sprite/Texture tinting.
 * @static
 * @class
 * @memberof PIXI
 */
var CanvasTinter = {};
module.exports = CanvasTinter;

/**
 * Basically this method just needs a sprite and a color and tints the sprite with the given color.
 *
 * @param sprite {PIXI.Sprite} the sprite to tint
 * @param color {number} the color to use to tint the sprite with
 * @return {HTMLCanvasElement} The tinted canvas
 */
CanvasTinter.getTintedTexture = function (sprite, color)
{
    var texture = sprite.texture;

    color = CanvasTinter.roundColor(color);

    var stringColor = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);

    texture.tintCache = texture.tintCache || {};

    if (texture.tintCache[stringColor])
    {
        return texture.tintCache[stringColor];
    }

     // clone texture..
    var canvas = CanvasTinter.canvas || document.createElement('canvas');

    //CanvasTinter.tintWithPerPixel(texture, stringColor, canvas);
    CanvasTinter.tintMethod(texture, color, canvas);

    if (CanvasTinter.convertTintToImage)
    {
        // is this better?
        var tintImage = new Image();
        tintImage.src = canvas.toDataURL();

        texture.tintCache[stringColor] = tintImage;
    }
    else
    {
        texture.tintCache[stringColor] = canvas;
        // if we are not converting the texture to an image then we need to lose the reference to the canvas
        CanvasTinter.canvas = null;
    }

    return canvas;
};

/**
 * Tint a texture using the 'multiply' operation.
 *
 * @param texture {PIXI.Texture} the texture to tint
 * @param color {number} the color to use to tint the sprite with
 * @param canvas {HTMLCanvasElement} the current canvas
 */
CanvasTinter.tintWithMultiply = function (texture, color, canvas)
{
    var context = canvas.getContext( '2d' );

    var resolution = texture.baseTexture.resolution;

    var crop = texture.crop.clone();
    crop.x *= resolution;
    crop.y *= resolution;
    crop.width *= resolution;
    crop.height *= resolution;

    canvas.width = crop.width;
    canvas.height = crop.height;

    context.fillStyle = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);

    context.fillRect(0, 0, crop.width, crop.height);

    context.globalCompositeOperation = 'multiply';

    context.drawImage(
        texture.baseTexture.source,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
    );

    context.globalCompositeOperation = 'destination-atop';

    context.drawImage(
        texture.baseTexture.source,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
    );
};

/**
 * Tint a texture using the 'overlay' operation.
 *
 * @param texture {PIXI.Texture} the texture to tint
 * @param color {number} the color to use to tint the sprite with
 * @param canvas {HTMLCanvasElement} the current canvas
 */
CanvasTinter.tintWithOverlay = function (texture, color, canvas)
{
    var context = canvas.getContext( '2d' );

    var resolution = texture.baseTexture.resolution;

    var crop = texture.crop.clone();
    crop.x *= resolution;
    crop.y *= resolution;
    crop.width *= resolution;
    crop.height *= resolution;

    canvas.width = crop.width;
    canvas.height = crop.height;

    context.globalCompositeOperation = 'copy';
    context.fillStyle = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);
    context.fillRect(0, 0, crop.width, crop.height);

    context.globalCompositeOperation = 'destination-atop';
    context.drawImage(
        texture.baseTexture.source,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
    );

    // context.globalCompositeOperation = 'copy';
};

/**
 * Tint a texture pixel per pixel.
 *
 * @param texture {PIXI.Texture} the texture to tint
 * @param color {number} the color to use to tint the sprite with
 * @param canvas {HTMLCanvasElement} the current canvas
 */
CanvasTinter.tintWithPerPixel = function (texture, color, canvas)
{
    var context = canvas.getContext( '2d' );

    var resolution = texture.baseTexture.resolution;

    var crop = texture.crop.clone();
    crop.x *= resolution;
    crop.y *= resolution;
    crop.width *= resolution;
    crop.height *= resolution;

    canvas.width = crop.width;
    canvas.height = crop.height;

    context.globalCompositeOperation = 'copy';
    context.drawImage(
        texture.baseTexture.source,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
    );

    var rgbValues = utils.hex2rgb(color);
    var r = rgbValues[0], g = rgbValues[1], b = rgbValues[2];

    var pixelData = context.getImageData(0, 0, crop.width, crop.height);

    var pixels = pixelData.data;

    for (var i = 0; i < pixels.length; i += 4)
    {
        pixels[i+0] *= r;
        pixels[i+1] *= g;
        pixels[i+2] *= b;
    }

    context.putImageData(pixelData, 0, 0);
};

/**
 * Rounds the specified color according to the CanvasTinter.cacheStepsPerColorChannel.
 *
 * @param color {number} the color to round, should be a hex color
 */
CanvasTinter.roundColor = function (color)
{
    var step = CanvasTinter.cacheStepsPerColorChannel;

    var rgbValues = utils.hex2rgb(color);

    rgbValues[0] = Math.min(255, (rgbValues[0] / step) * step);
    rgbValues[1] = Math.min(255, (rgbValues[1] / step) * step);
    rgbValues[2] = Math.min(255, (rgbValues[2] / step) * step);

    return utils.rgb2hex(rgbValues);
};

/**
 * Number of steps which will be used as a cap when rounding colors.
 *
 * @member
 */
CanvasTinter.cacheStepsPerColorChannel = 8;

/**
 * Tint cache boolean flag.
 *
 * @member
 */
CanvasTinter.convertTintToImage = false;

/**
 * Whether or not the Canvas BlendModes are supported, consequently the ability to tint using the multiply method.
 *
 * @member
 */
CanvasTinter.canUseMultiply = utils.canUseNewCanvasBlendModes();

/**
 * The tinting method that will be used.
 *
 */
CanvasTinter.tintMethod = CanvasTinter.canUseMultiply ? CanvasTinter.tintWithMultiply :  CanvasTinter.tintWithPerPixel;

},{"../../../utils":77}],49:[function(require,module,exports){
var SystemRenderer = require('../SystemRenderer'),
    ShaderManager = require('./managers/ShaderManager'),
    MaskManager = require('./managers/MaskManager'),
    StencilManager = require('./managers/StencilManager'),
    FilterManager = require('./managers/FilterManager'),
    BlendModeManager = require('./managers/BlendModeManager'),
    RenderTarget = require('./utils/RenderTarget'),
    ObjectRenderer = require('./utils/ObjectRenderer'),
    FXAAFilter = require('./filters/FXAAFilter'),
    utils = require('../../utils'),
    CONST = require('../../const');

/**
 * The WebGLRenderer draws the scene and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 * @param [width=0] {number} the width of the canvas view
 * @param [height=0] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias. If not available natively then FXAA antialiasing is used
 * @param [options.forceFXAA=false] {boolean} forces FXAA antialiasing to be used over native. FXAA is faster, but may not always look as great
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass. If you wish to set this to false, you *must* set preserveDrawingBuffer to `true`.
 * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if
 *      you need to call toDataUrl on the webgl context.
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
 */
function WebGLRenderer(width, height, options)
{
    options = options || {};

    SystemRenderer.call(this, 'WebGL', width, height, options);

    /**
     * The type of this renderer as a standardised const
     *
     * @member {number}
     *
     */
    this.type = CONST.RENDERER_TYPE.WEBGL;

    this.handleContextLost = this.handleContextLost.bind(this);
    this.handleContextRestored = this.handleContextRestored.bind(this);

    this.view.addEventListener('webglcontextlost', this.handleContextLost, false);
    this.view.addEventListener('webglcontextrestored', this.handleContextRestored, false);

    //TODO possibility to force FXAA as it may offer better performance?
    /**
     * Does it use FXAA ?
     *
     * @member {boolean}
     * @private
     */
    this._useFXAA = !!options.forceFXAA && options.antialias;

    /**
     * The fxaa filter
     *
     * @member {PIXI.FXAAFilter}
     * @private
     */
    this._FXAAFilter = null;

    /**
     * The options passed in to create a new webgl context.
     *
     * @member {object}
     * @private
     */
    this._contextOptions = {
        alpha: this.transparent,
        antialias: options.antialias,
        premultipliedAlpha: this.transparent && this.transparent !== 'notMultiplied',
        stencil: true,
        preserveDrawingBuffer: options.preserveDrawingBuffer
    };

    /**
     * Counter for the number of draws made each frame
     *
     * @member {number}
     */
    this.drawCount = 0;

    /**
     * Deals with managing the shader programs and their attribs.
     *
     * @member {PIXI.ShaderManager}
     */
    this.shaderManager = new ShaderManager(this);

    /**
     * Manages the masks using the stencil buffer.
     *
     * @member {PIXI.MaskManager}
     */
    this.maskManager = new MaskManager(this);

    /**
     * Manages the stencil buffer.
     *
     * @member {PIXI.StencilManager}
     */
    this.stencilManager = new StencilManager(this);

    /**
     * Manages the filters.
     *
     * @member {PIXI.FilterManager}
     */
    this.filterManager = new FilterManager(this);


    /**
     * Manages the blendModes
     *
     * @member {PIXI.BlendModeManager}
     */
    this.blendModeManager = new BlendModeManager(this);

    /**
     * Holds the current render target
     *
     * @member {PIXI.RenderTarget}
     */
    this.currentRenderTarget = null;

    /**
     * The currently active ObjectRenderer.
     *
     * @member {PIXI.ObjectRenderer}
     */
    this.currentRenderer = new ObjectRenderer(this);

    this.initPlugins();

    // initialize the context so it is ready for the managers.
    this._createContext();
    this._initContext();

    // map some webGL blend modes..
    this._mapGlModes();

    // track textures in the renderer so we can no longer listen to them on destruction.
    this._managedTextures = [];

    /**
     * An array of render targets
     * @member {PIXI.RenderTarget[]}
     * @private
     */
    this._renderTargetStack = [];
}

// constructor
WebGLRenderer.prototype = Object.create(SystemRenderer.prototype);
WebGLRenderer.prototype.constructor = WebGLRenderer;
module.exports = WebGLRenderer;
utils.pluginTarget.mixin(WebGLRenderer);

WebGLRenderer.glContextId = 0;

/**
 * Creates the gl context.
 *
 * @private
 */
WebGLRenderer.prototype._createContext = function () {
    var gl = this.view.getContext('webgl', this._contextOptions) || this.view.getContext('experimental-webgl', this._contextOptions);
    this.gl = gl;

    if (!gl)
    {
        // fail, not able to get a context
        throw new Error('This browser does not support webGL. Try using the canvas renderer');
    }

    this.glContextId = WebGLRenderer.glContextId++;
    gl.id = this.glContextId;
    gl.renderer = this;
};

/**
 * Creates the WebGL context
 *
 * @private
 */
WebGLRenderer.prototype._initContext = function ()
{
    var gl = this.gl;

    // set up the default pixi settings..
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);

    this.renderTarget = new RenderTarget(gl, this.width, this.height, null, this.resolution, true);

    this.setRenderTarget(this.renderTarget);

    this.emit('context', gl);

    // setup the width/height properties and gl viewport
    this.resize(this.width, this.height);

    if(!this._useFXAA)
    {
        this._useFXAA = (this._contextOptions.antialias && ! gl.getContextAttributes().antialias);
    }


    if(this._useFXAA)
    {
        window.console.warn('FXAA antialiasing being used instead of native antialiasing');
        this._FXAAFilter = [new FXAAFilter()];
    }
};

/**
 * Renders the object to its webGL view
 *
 * @param object {PIXI.DisplayObject} the object to be rendered
 */
WebGLRenderer.prototype.render = function (object)
{

    this.emit('prerender');

    // no point rendering if our context has been blown up!
    if (this.gl.isContextLost())
    {
        return;
    }

    this.drawCount = 0;

    this._lastObjectRendered = object;

    if(this._useFXAA)
    {
        this._FXAAFilter[0].uniforms.resolution.value.x = this.width;
        this._FXAAFilter[0].uniforms.resolution.value.y = this.height;
        object.filterArea = this.renderTarget.size;
        object.filters = this._FXAAFilter;
    }

    var cacheParent = object.parent;
    object.parent = this._tempDisplayObjectParent;

    // update the scene graph
    object.updateTransform();

    object.parent = cacheParent;

    var gl = this.gl;

    // make sure we are bound to the main frame buffer
    this.setRenderTarget(this.renderTarget);

    if (this.clearBeforeRender)
    {
        if (this.transparent)
        {
            gl.clearColor(0, 0, 0, 0);
        }
        else
        {
            gl.clearColor(this._backgroundColorRgb[0], this._backgroundColorRgb[1], this._backgroundColorRgb[2], 1);
        }

        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    this.renderDisplayObject(object, this.renderTarget);//this.projection);

    this.emit('postrender');
};

/**
 * Renders a Display Object.
 *
 * @param displayObject {PIXI.DisplayObject} The DisplayObject to render
 * @param renderTarget {PIXI.RenderTarget} The render target to use to render this display object
 *
 */
WebGLRenderer.prototype.renderDisplayObject = function (displayObject, renderTarget, clear)//projection, buffer)
{
    // TODO is this needed...
    //this.blendModeManager.setBlendMode(CONST.BLEND_MODES.NORMAL);
    this.setRenderTarget(renderTarget);

    if(clear)
    {
        renderTarget.clear();
    }

    // start the filter manager
    this.filterManager.setFilterStack( renderTarget.filterStack );

    // render the scene!
    displayObject.renderWebGL(this);

    // finish the current renderer..
    this.currentRenderer.flush();
};

/**
 * Changes the current renderer to the one given in parameter
 *
 * @param objectRenderer {PIXI.ObjectRenderer} The object renderer to use.
 */
WebGLRenderer.prototype.setObjectRenderer = function (objectRenderer)
{
    if (this.currentRenderer === objectRenderer)
    {
        return;
    }

    this.currentRenderer.stop();
    this.currentRenderer = objectRenderer;
    this.currentRenderer.start();
};

/**
 * Changes the current render target to the one given in parameter
 *
 * @param renderTarget {PIXI.RenderTarget} the new render target
 */
WebGLRenderer.prototype.setRenderTarget = function (renderTarget)
{
    if( this.currentRenderTarget === renderTarget)
    {
        return;
    }
    // TODO - maybe down the line this should be a push pos thing? Leaving for now though.
    this.currentRenderTarget = renderTarget;
    this.currentRenderTarget.activate();
    this.stencilManager.setMaskStack( renderTarget.stencilMaskStack );
};


/**
 * Resizes the webGL view to the specified width and height.
 *
 * @param width {number} the new width of the webGL view
 * @param height {number} the new height of the webGL view
 */
WebGLRenderer.prototype.resize = function (width, height)
{
    SystemRenderer.prototype.resize.call(this, width, height);

    this.filterManager.resize(width, height);
    this.renderTarget.resize(width, height);

    if(this.currentRenderTarget === this.renderTarget)
    {
        this.renderTarget.activate();
        this.gl.viewport(0, 0, this.width, this.height);
    }
};

/**
 * Updates and/or Creates a WebGL texture for the renderer's context.
 *
 * @param texture {PIXI.BaseTexture|PIXI.Texture} the texture to update
 */
WebGLRenderer.prototype.updateTexture = function (texture)
{
    texture = texture.baseTexture || texture;

    if (!texture.hasLoaded)
    {
        return;
    }

    var gl = this.gl;

    if (!texture._glTextures[gl.id])
    {
        texture._glTextures[gl.id] = gl.createTexture();
        texture.on('update', this.updateTexture, this);
        texture.on('dispose', this.destroyTexture, this);
        this._managedTextures.push(texture);
    }


    gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);


    if (texture.mipmap && texture.isPowerOfTwo)
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    else
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
    }

    if (!texture.isPowerOfTwo)
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    else
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }

    return  texture._glTextures[gl.id];
};

/**
 * Deletes the texture from WebGL
 *
 * @param texture {PIXI.BaseTexture|PIXI.Texture} the texture to destroy
 */
WebGLRenderer.prototype.destroyTexture = function (texture, _skipRemove)
{
    texture = texture.baseTexture || texture;

    if (!texture.hasLoaded)
    {
        return;
    }

    if (texture._glTextures[this.gl.id])
    {
        this.gl.deleteTexture(texture._glTextures[this.gl.id]);
        delete texture._glTextures[this.gl.id];

        if (!_skipRemove)
        {
            var i = this._managedTextures.indexOf(texture);
            if (i !== -1) {
                utils.removeItems(this._managedTextures, i, 1);
            }
        }
    }
};

/**
 * Handles a lost webgl context
 *
 * @private
 */
WebGLRenderer.prototype.handleContextLost = function (event)
{
    event.preventDefault();
};

/**
 * Handles a restored webgl context
 *
 * @private
 */
WebGLRenderer.prototype.handleContextRestored = function ()
{
    this._initContext();

    // empty all the old gl textures as they are useless now
    for (var i = 0; i < this._managedTextures.length; ++i)
    {
        var texture = this._managedTextures[i];
        if (texture._glTextures[this.gl.id])
        {
            delete texture._glTextures[this.gl.id];
        }
    }
};

/**
 * Removes everything from the renderer (event listeners, spritebatch, etc...)
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
WebGLRenderer.prototype.destroy = function (removeView)
{
    this.destroyPlugins();

    // remove listeners
    this.view.removeEventListener('webglcontextlost', this.handleContextLost);
    this.view.removeEventListener('webglcontextrestored', this.handleContextRestored);

    // destroy managed textures
    for (var i = 0; i < this._managedTextures.length; ++i)
    {
        var texture = this._managedTextures[i];
        this.destroyTexture(texture, true);
        texture.off('update', this.updateTexture, this);
        texture.off('dispose', this.destroyTexture, this);
    }

    // call base destroy
    SystemRenderer.prototype.destroy.call(this, removeView);

    this.uid = 0;

    // destroy the managers
    this.shaderManager.destroy();
    this.maskManager.destroy();
    this.stencilManager.destroy();
    this.filterManager.destroy();
    this.blendModeManager.destroy();

    this.shaderManager = null;
    this.maskManager = null;
    this.filterManager = null;
    this.blendModeManager = null;
    this.currentRenderer = null;

    this.handleContextLost = null;
    this.handleContextRestored = null;

    this._contextOptions = null;

    this._managedTextures = null;

    this.drawCount = 0;

    this.gl.useProgram(null);

    this.gl = null;
};

/**
 * Maps Pixi blend modes to WebGL blend modes. It works only for pre-multiplied textures.
 *
 * @private
 */
WebGLRenderer.prototype._mapGlModes = function ()
{
    var gl = this.gl;

    if (!this.blendModes)
    {
        this.blendModes = {};

        this.blendModes[CONST.BLEND_MODES.NORMAL]        = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.ADD]           = [gl.ONE,       gl.DST_ALPHA];
        this.blendModes[CONST.BLEND_MODES.MULTIPLY]      = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.SCREEN]        = [gl.ONE,       gl.ONE_MINUS_SRC_COLOR];
        this.blendModes[CONST.BLEND_MODES.OVERLAY]       = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.DARKEN]        = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.LIGHTEN]       = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.COLOR_DODGE]   = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.COLOR_BURN]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.HARD_LIGHT]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.DIFFERENCE]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.EXCLUSION]     = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.HUE]           = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.SATURATION]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.COLOR]         = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.LUMINOSITY]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    }

    if (!this.drawModes)
    {
        this.drawModes = {};

        this.drawModes[CONST.DRAW_MODES.POINTS]         = gl.POINTS;
        this.drawModes[CONST.DRAW_MODES.LINES]          = gl.LINES;
        this.drawModes[CONST.DRAW_MODES.LINE_LOOP]      = gl.LINE_LOOP;
        this.drawModes[CONST.DRAW_MODES.LINE_STRIP]     = gl.LINE_STRIP;
        this.drawModes[CONST.DRAW_MODES.TRIANGLES]      = gl.TRIANGLES;
        this.drawModes[CONST.DRAW_MODES.TRIANGLE_STRIP] = gl.TRIANGLE_STRIP;
        this.drawModes[CONST.DRAW_MODES.TRIANGLE_FAN]   = gl.TRIANGLE_FAN;
    }
};

},{"../../const":22,"../../utils":77,"../SystemRenderer":43,"./filters/FXAAFilter":51,"./managers/BlendModeManager":53,"./managers/FilterManager":54,"./managers/MaskManager":55,"./managers/ShaderManager":56,"./managers/StencilManager":57,"./utils/ObjectRenderer":63,"./utils/RenderTarget":65}],50:[function(require,module,exports){
var DefaultShader = require('../shaders/TextureShader');

/**
 * This is the base class for creating a PIXI filter. Currently only WebGL supports filters.
 * If you want to make a custom filter this should be your base class.
 *
 * @class
 * @memberof PIXI
 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
 * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
 * @param uniforms {object} An object containing the uniforms for this filter.
 */
function AbstractFilter(vertexSrc, fragmentSrc, uniforms)
{

    /**
     * An array of shaders
     * @member {PIXI.Shader[]}
     * @private
     */
    this.shaders = [];

    /**
     * The extra padding that the filter might need
     * @member {number}
     */
    this.padding = 0;

    /**
     * The uniforms as an object
     * @member {object}
     */
    this.uniforms = uniforms || {};


    /**
     * The code of the vertex shader
     * @member {string[]}
     * @private
     */
    this.vertexSrc = vertexSrc || DefaultShader.defaultVertexSrc;

    /**
     * The code of the frament shader
     * @member {string[]}
     * @private
     */
    this.fragmentSrc = fragmentSrc || DefaultShader.defaultFragmentSrc;

    //TODO a reminder - would be cool to have lower res filters as this would give better performance.

    //typeof fragmentSrc === 'string' ? fragmentSrc.split('') : (fragmentSrc || []);

}

AbstractFilter.prototype.constructor = AbstractFilter;
module.exports = AbstractFilter;

/**
 * Grabs a shader from the current renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer to retrieve the shader from
 */
AbstractFilter.prototype.getShader = function (renderer)
{
    var gl = renderer.gl;

    var shader = this.shaders[gl.id];

    if (!shader)
    {
        shader = new DefaultShader(renderer.shaderManager,
            this.vertexSrc,
            this.fragmentSrc,
            this.uniforms,
            this.attributes
        );

        this.shaders[gl.id] = shader;
    }

    return shader;
};

/**
 * Applies the filter
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer to retrieve the filter from
 * @param input {PIXI.RenderTarget}
 * @param output {PIXI.RenderTarget}
 * @param clear {boolean} Whether or not we want to clear the outputTarget
 */
AbstractFilter.prototype.applyFilter = function (renderer, input, output, clear)
{
    var shader = this.getShader(renderer);

    renderer.filterManager.applyFilter(shader, input, output, clear);
};

/**
 * Syncs a uniform between the class object and the shaders.
 *
 */
AbstractFilter.prototype.syncUniform = function (uniform)
{
    for (var i = 0, j = this.shaders.length; i < j; ++i)
    {
        this.shaders[i].syncUniform(uniform);
    }
};

},{"../shaders/TextureShader":62}],51:[function(require,module,exports){
var AbstractFilter = require('./AbstractFilter');
// @see https://github.com/substack/brfs/issues/25


/**
 *
 * Basic FXAA implementation based on the code on geeks3d.com with the
 * modification that the texture2DLod stuff was removed since it's
 * unsupported by WebGL.
 *
 * --
 * From:
 * https://github.com/mitsuhiko/webgl-meincraft
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI
 *
 */
function FXAAFilter()
{
    AbstractFilter.call(this,
        // vertex shader
        "\nprecision mediump float;\n\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\nuniform vec2 resolution;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvarying vec2 vResolution;\n\n//texcoords computed in vertex step\n//to avoid dependent texture reads\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\n\nvoid texcoords(vec2 fragCoord, vec2 resolution,\n            out vec2 v_rgbNW, out vec2 v_rgbNE,\n            out vec2 v_rgbSW, out vec2 v_rgbSE,\n            out vec2 v_rgbM) {\n    vec2 inverseVP = 1.0 / resolution.xy;\n    v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;\n    v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;\n    v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;\n    v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;\n    v_rgbM = vec2(fragCoord * inverseVP);\n}\n\nvoid main(void){\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n   vResolution = resolution;\n\n   //compute the texture coords and send them to varyings\n   texcoords(aTextureCoord * resolution, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n}\n",
        // fragment shader
        "precision lowp float;\n\n\n/**\nBasic FXAA implementation based on the code on geeks3d.com with the\nmodification that the texture2DLod stuff was removed since it's\nunsupported by WebGL.\n\n--\n\nFrom:\nhttps://github.com/mitsuhiko/webgl-meincraft\n\nCopyright (c) 2011 by Armin Ronacher.\n\nSome rights reserved.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are\nmet:\n\n    * Redistributions of source code must retain the above copyright\n      notice, this list of conditions and the following disclaimer.\n\n    * Redistributions in binary form must reproduce the above\n      copyright notice, this list of conditions and the following\n      disclaimer in the documentation and/or other materials provided\n      with the distribution.\n\n    * The names of the contributors may not be used to endorse or\n      promote products derived from this software without specific\n      prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\nLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\nA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\nOWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\nSPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\nLIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\nDATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\nTHEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\nOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n\n#ifndef FXAA_REDUCE_MIN\n    #define FXAA_REDUCE_MIN   (1.0/ 128.0)\n#endif\n#ifndef FXAA_REDUCE_MUL\n    #define FXAA_REDUCE_MUL   (1.0 / 8.0)\n#endif\n#ifndef FXAA_SPAN_MAX\n    #define FXAA_SPAN_MAX     8.0\n#endif\n\n//optimized version for mobile, where dependent\n//texture reads can be a bottleneck\nvec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,\n            vec2 v_rgbNW, vec2 v_rgbNE,\n            vec2 v_rgbSW, vec2 v_rgbSE,\n            vec2 v_rgbM) {\n    vec4 color;\n    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);\n    vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;\n    vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;\n    vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;\n    vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;\n    vec4 texColor = texture2D(tex, v_rgbM);\n    vec3 rgbM  = texColor.xyz;\n    vec3 luma = vec3(0.299, 0.587, 0.114);\n    float lumaNW = dot(rgbNW, luma);\n    float lumaNE = dot(rgbNE, luma);\n    float lumaSW = dot(rgbSW, luma);\n    float lumaSE = dot(rgbSE, luma);\n    float lumaM  = dot(rgbM,  luma);\n    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\n    mediump vec2 dir;\n    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\n    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *\n                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n\n    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n              dir * rcpDirMin)) * inverseVP;\n\n    vec3 rgbA = 0.5 * (\n        texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +\n        texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);\n    vec3 rgbB = rgbA * 0.5 + 0.25 * (\n        texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +\n        texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);\n\n    float lumaB = dot(rgbB, luma);\n    if ((lumaB < lumaMin) || (lumaB > lumaMax))\n        color = vec4(rgbA, texColor.a);\n    else\n        color = vec4(rgbB, texColor.a);\n    return color;\n}\n\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vResolution;\n\n//texcoords computed in vertex step\n//to avoid dependent texture reads\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\nuniform sampler2D uSampler;\n\n\nvoid main(void){\n\n    gl_FragColor = fxaa(uSampler, vTextureCoord * vResolution, vResolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n\n}\n",
        // uniforms
        {
            resolution: { type: 'v2', value: { x: 1, y: 1 } }
        }
    );

}

FXAAFilter.prototype = Object.create(AbstractFilter.prototype);
FXAAFilter.prototype.constructor = FXAAFilter;
module.exports = FXAAFilter;

/**
 * Applies the filter
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer to retrieve the filter from
 * @param input {PIXI.RenderTarget}
 * @param output {PIXI.RenderTarget}
 */
FXAAFilter.prototype.applyFilter = function (renderer, input, output)
{
    var filterManager = renderer.filterManager;

    var shader = this.getShader( renderer );
     // draw the filter...
    filterManager.applyFilter(shader, input, output);
};

},{"./AbstractFilter":50}],52:[function(require,module,exports){
var AbstractFilter = require('./AbstractFilter'),
    math =  require('../../../math');

// @see https://github.com/substack/brfs/issues/25


/**
 * The SpriteMaskFilter class
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI
 * @param sprite {PIXI.Sprite} the target sprite
 */
function SpriteMaskFilter(sprite)
{
    var maskMatrix = new math.Matrix();

    AbstractFilter.call(this,
        "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n    vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n",
        "precision lowp float;\n\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\nuniform float alpha;\nuniform sampler2D mask;\n\nvoid main(void)\n{\n    // check clip! this will stop the mask bleeding out from the edges\n    vec2 text = abs( vMaskCoord - 0.5 );\n    text = step(0.5, text);\n    float clip = 1.0 - max(text.y, text.x);\n    vec4 original = texture2D(uSampler, vTextureCoord);\n    vec4 masky = texture2D(mask, vMaskCoord);\n    original *= (masky.r * masky.a * alpha * clip);\n    gl_FragColor = original;\n}\n",
        {
            mask:           { type: 'sampler2D', value: sprite._texture },
            alpha:          { type: 'f', value: 1},
            otherMatrix:    { type: 'mat3', value: maskMatrix.toArray(true) }
        }
    );

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;
}

SpriteMaskFilter.prototype = Object.create(AbstractFilter.prototype);
SpriteMaskFilter.prototype.constructor = SpriteMaskFilter;
module.exports = SpriteMaskFilter;

/**
 * Applies the filter
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer to retrieve the filter from
 * @param input {PIXI.RenderTarget}
 * @param output {PIXI.RenderTarget}
 */
SpriteMaskFilter.prototype.applyFilter = function (renderer, input, output)
{
    var filterManager = renderer.filterManager;

    this.uniforms.mask.value = this.maskSprite._texture;

    filterManager.calculateMappedMatrix(input.frame, this.maskSprite, this.maskMatrix);

    this.uniforms.otherMatrix.value = this.maskMatrix.toArray(true);
    this.uniforms.alpha.value = this.maskSprite.worldAlpha;

    var shader = this.getShader(renderer);
     // draw the filter...
    filterManager.applyFilter(shader, input, output);
};


Object.defineProperties(SpriteMaskFilter.prototype, {
    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.SpriteMaskFilter#
     */
    map: {
        get: function ()
        {
            return this.uniforms.mask.value;
        },
        set: function (value)
        {
            this.uniforms.mask.value = value;
        }
    },

    /**
     * The offset used to move the displacement map.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.SpriteMaskFilter#
     */
    offset: {
        get: function()
        {
            return this.uniforms.offset.value;
        },
        set: function(value)
        {
            this.uniforms.offset.value = value;
        }
    }
});

},{"../../../math":33,"./AbstractFilter":50}],53:[function(require,module,exports){
var WebGLManager = require('./WebGLManager');

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.WebGlManager
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function BlendModeManager(renderer)
{
    WebGLManager.call(this, renderer);

    /**
     * @member {number}
     */
    this.currentBlendMode = 99999;
}

BlendModeManager.prototype = Object.create(WebGLManager.prototype);
BlendModeManager.prototype.constructor = BlendModeManager;
module.exports = BlendModeManager;

/**
 * Sets-up the given blendMode from WebGL's point of view.
 *
 * @param blendMode {number} the blendMode, should be a Pixi const, such as `PIXI.BLEND_MODES.ADD`. See
 *  {@link PIXI.BLEND_MODES} for possible values.
 */
BlendModeManager.prototype.setBlendMode = function (blendMode)
{
    if (this.currentBlendMode === blendMode)
    {
        return false;
    }

    this.currentBlendMode = blendMode;

    var mode = this.renderer.blendModes[this.currentBlendMode];
    this.renderer.gl.blendFunc(mode[0], mode[1]);

    return true;
};

},{"./WebGLManager":58}],54:[function(require,module,exports){
var WebGLManager = require('./WebGLManager'),
    RenderTarget = require('../utils/RenderTarget'),
    CONST = require('../../../const'),
    Quad = require('../utils/Quad'),
    math =  require('../../../math');

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.WebGLManager
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function FilterManager(renderer)
{
    WebGLManager.call(this, renderer);

    /**
     * @member {object[]}
     */
    this.filterStack = [];

    this.filterStack.push({
        renderTarget:renderer.currentRenderTarget,
        filter:[],
        bounds:null
    });

    /**
     * @member {PIXI.RenderTarget[]}
     */
    this.texturePool = [];

    /**
     * The size of the texture
     *
     * @member {PIXI.Rectangle}
     */
    // listen for context and update necessary buffers
    //TODO make this dynamic!
    //TODO test this out by forces power of two?
    this.textureSize = new math.Rectangle(0, 0, renderer.width, renderer.height);

    /**
     * The current frame
     *
     * @member {PIXI.Rectangle}
     */
    this.currentFrame = null;
}

FilterManager.prototype = Object.create(WebGLManager.prototype);
FilterManager.prototype.constructor = FilterManager;
module.exports = FilterManager;


/**
 * Called when there is a WebGL context change.
 *
 */
FilterManager.prototype.onContextChange = function ()
{
    this.texturePool.length = 0;

    var gl = this.renderer.gl;
    this.quad = new Quad(gl);
};

/**
 * @param renderer {PIXI.WebGLRenderer}
 * @param buffer {ArrayBuffer}
 */
FilterManager.prototype.setFilterStack = function ( filterStack )
{
    this.filterStack = filterStack;
};

/**
 * Applies the filter and adds it to the current filter stack.
 *
 * @param target {PIXI.DisplayObject}
 * @param filters {PIXI.AbstractFiler[]} the filters that will be pushed to the current filter stack
 */
FilterManager.prototype.pushFilter = function (target, filters)
{
    // get the bounds of the object..
    // TODO replace clone with a copy to save object creation
    var bounds = target.filterArea ? target.filterArea.clone() : target.getBounds();

    //bounds = bounds.clone();

    // round off the rectangle to get a nice smoooooooth filter :)
    bounds.x = bounds.x | 0;
    bounds.y = bounds.y | 0;
    bounds.width = bounds.width | 0;
    bounds.height = bounds.height | 0;


    // padding!
    var padding = filters[0].padding | 0;
    bounds.x -= padding;
    bounds.y -= padding;
    bounds.width += padding * 2;
    bounds.height += padding * 2;


    if(this.renderer.currentRenderTarget.transform)
    {
        //TODO this will break if the renderTexture transform is anything other than a translation.
        //Will need to take the full matrix transform into acount..
        var transform = this.renderer.currentRenderTarget.transform;

        bounds.x += transform.tx;
        bounds.y += transform.ty;

        this.capFilterArea( bounds );

        bounds.x -= transform.tx;
        bounds.y -= transform.ty;
    }
    else
    {
         this.capFilterArea( bounds );
    }

    if(bounds.width > 0 && bounds.height > 0)
    {
        this.currentFrame = bounds;

        var texture = this.getRenderTarget();

        this.renderer.setRenderTarget(texture);

        // clear the texture..
        texture.clear();

        // TODO get rid of object creation!
        this.filterStack.push({
            renderTarget: texture,
            filter: filters
        });

    }
    else
    {
        // push somthing on to the stack that is empty
        this.filterStack.push({
            renderTarget: null,
            filter: filters
        });
    }
};


/**
 * Removes the last filter from the filter stack and returns it.
 *
 */
FilterManager.prototype.popFilter = function ()
{
    var filterData = this.filterStack.pop();
    var previousFilterData = this.filterStack[this.filterStack.length-1];

    var input = filterData.renderTarget;

    // if the renderTarget is null then we don't apply the filter as its offscreen
    if(!filterData.renderTarget)
    {
        return;
    }

    var output = previousFilterData.renderTarget;

    // use program
    var gl = this.renderer.gl;


    this.currentFrame = input.frame;

    this.quad.map(this.textureSize, input.frame);


    // TODO.. this probably only needs to be done once!
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quad.indexBuffer);

    var filters = filterData.filter;

    // assuming all filters follow the correct format??
    gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 2 * 4 * 4);
    gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aColor, 4, gl.FLOAT, false, 0, 4 * 4 * 4);

    // restore the normal blendmode!
    this.renderer.blendModeManager.setBlendMode(CONST.BLEND_MODES.NORMAL);

    if (filters.length === 1)
    {
        // TODO (cengler) - There has to be a better way then setting this each time?
        if (filters[0].uniforms.dimensions)
        {
            filters[0].uniforms.dimensions.value[0] = this.renderer.width;
            filters[0].uniforms.dimensions.value[1] = this.renderer.height;
            filters[0].uniforms.dimensions.value[2] = this.quad.vertices[0];
            filters[0].uniforms.dimensions.value[3] = this.quad.vertices[5];
        }

        filters[0].applyFilter( this.renderer, input, output );
        this.returnRenderTarget( input );

    }
    else
    {
        var flipTexture = input;
        var flopTexture = this.getRenderTarget(true);

        for (var i = 0; i < filters.length-1; i++)
        {
            var filter = filters[i];

            // TODO (cengler) - There has to be a better way then setting this each time?
            if (filter.uniforms.dimensions)
            {
                filter.uniforms.dimensions.value[0] = this.renderer.width;
                filter.uniforms.dimensions.value[1] = this.renderer.height;
                filter.uniforms.dimensions.value[2] = this.quad.vertices[0];
                filter.uniforms.dimensions.value[3] = this.quad.vertices[5];
            }

            filter.applyFilter( this.renderer, flipTexture, flopTexture );

            var temp = flipTexture;
            flipTexture = flopTexture;
            flopTexture = temp;
        }

        filters[filters.length-1].applyFilter( this.renderer, flipTexture, output );

        this.returnRenderTarget( flipTexture );
        this.returnRenderTarget( flopTexture );
    }

    return filterData.filter;
};

/**
 * Grabs an render target from the internal pool
 *
 * @param clear {boolean} Whether or not we need to clear the RenderTarget
 * @return {RenderTarget}
 */
FilterManager.prototype.getRenderTarget = function ( clear )
{
    var renderTarget = this.texturePool.pop() || new RenderTarget(this.renderer.gl, this.textureSize.width, this.textureSize.height, CONST.SCALE_MODES.LINEAR, this.renderer.resolution * CONST.FILTER_RESOLUTION);
    renderTarget.frame = this.currentFrame;

    if (clear)
    {
        renderTarget.clear(true);
    }

    return renderTarget;
};

/*
 * Returns a RenderTarget to the internal pool
 * @param renderTarget {RenderTarget} The RenderTarget we want to return to the pool
 */
FilterManager.prototype.returnRenderTarget = function (renderTarget)
{
    this.texturePool.push( renderTarget );
};

/*
 * Applies the filter
 * @param shader {Shader} The shader to upload
 * @param inputTarget {RenderTarget}
 * @param outputTarget {RenderTarget}
 * @param clear {boolean} Whether or not we want to clear the outputTarget
 */
FilterManager.prototype.applyFilter = function (shader, inputTarget, outputTarget, clear)
{
    var gl = this.renderer.gl;

    this.renderer.setRenderTarget(outputTarget);

    if (clear)
    {
        outputTarget.clear();
    }

    // set the shader
    this.renderer.shaderManager.setShader(shader);

    // TODO (cengler) - Can this be cached and not `toArray`ed each frame?
    shader.uniforms.projectionMatrix.value = this.renderer.currentRenderTarget.projectionMatrix.toArray(true);

    //TODO can this be optimised?
    shader.syncUniforms();
/*
    gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 2 * 4 * 4);
    gl.vertexAttribPointer(shader.attributes.aColor, 4, gl.FLOAT, false, 0, 4 * 4 * 4);
*/

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTarget.texture);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );
    this.renderer.drawCount++;
};

/*
 * Calculates the mapped matrix
 * @param filterArea {Rectangle} The filter area
 * @param sprite {Sprite} the target sprite
 * @param outputMatrix {Matrix} @alvin
 */
// TODO playing around here.. this is temporary - (will end up in the shader)
FilterManager.prototype.calculateMappedMatrix = function (filterArea, sprite, outputMatrix)
{
    var worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX),
    texture = sprite._texture.baseTexture;

    var mappedMatrix = outputMatrix.identity();

    // scale..
    var ratio = this.textureSize.height / this.textureSize.width;

    mappedMatrix.translate(filterArea.x / this.textureSize.width, filterArea.y / this.textureSize.height );

    mappedMatrix.scale(1 , ratio);

    var translateScaleX = (this.textureSize.width / texture.width);
    var translateScaleY = (this.textureSize.height / texture.height);

    worldTransform.tx /= texture.width * translateScaleX;
    worldTransform.ty /= texture.width * translateScaleX;

    worldTransform.invert();

    mappedMatrix.prepend(worldTransform);

    // apply inverse scale..
    mappedMatrix.scale(1 , 1/ratio);

    mappedMatrix.scale( translateScaleX , translateScaleY );

    mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

    return mappedMatrix;

    // Keeping the orginal as a reminder to me on how this works!
    //
    // var m = new math.Matrix();

    // // scale..
    // var ratio = this.textureSize.height / this.textureSize.width;

    // m.translate(filterArea.x / this.textureSize.width, filterArea.y / this.textureSize.height);


    // m.scale(1 , ratio);


    // var transform = wt.clone();

    // var translateScaleX = (this.textureSize.width / 620);
    // var translateScaleY = (this.textureSize.height / 380);

    // transform.tx /= 620 * translateScaleX;
    // transform.ty /= 620 * translateScaleX;

    // transform.invert();

    // transform.append(m);

    // // apply inverse scale..
    // transform.scale(1 , 1/ratio);

    // transform.scale( translateScaleX , translateScaleY );

    // return transform;
};

/*
 * Constrains the filter area to the texture size
 * @param filterArea {Rectangle} The filter area we want to cap
 */
FilterManager.prototype.capFilterArea = function (filterArea)
{
    if (filterArea.x < 0)
    {
        filterArea.width += filterArea.x;
        filterArea.x = 0;
    }

    if (filterArea.y < 0)
    {
        filterArea.height += filterArea.y;
        filterArea.y = 0;
    }

    if ( filterArea.x + filterArea.width > this.textureSize.width )
    {
        filterArea.width = this.textureSize.width - filterArea.x;
    }

    if ( filterArea.y + filterArea.height > this.textureSize.height )
    {
        filterArea.height = this.textureSize.height - filterArea.y;
    }
};

/*
 * Resizes all the render targets in the pool
 * @param width {number} the new width
 * @param height {number} the new height
 */
FilterManager.prototype.resize = function ( width, height )
{
    this.textureSize.width = width;
    this.textureSize.height = height;

    for (var i = 0; i < this.texturePool.length; i++)
    {
        this.texturePool[i].resize( width, height );
    }
};

/**
 * Destroys the filter and removes it from the filter stack.
 *
 */
FilterManager.prototype.destroy = function ()
{
    this.quad.destroy();
    
    WebGLManager.prototype.destroy.call(this);
    
    this.filterStack = null;
    this.offsetY = 0;

    // destroy textures
    for (var i = 0; i < this.texturePool.length; i++)
    {
        this.texturePool[i].destroy();
    }

    this.texturePool = null;
};

},{"../../../const":22,"../../../math":33,"../utils/Quad":64,"../utils/RenderTarget":65,"./WebGLManager":58}],55:[function(require,module,exports){
var WebGLManager = require('./WebGLManager'),
    AlphaMaskFilter = require('../filters/SpriteMaskFilter');

/**
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function MaskManager(renderer)
{
    WebGLManager.call(this, renderer);

    this.stencilStack = [];
    this.reverse = true;
    this.count = 0;

    this.alphaMaskPool = [];
}

MaskManager.prototype = Object.create(WebGLManager.prototype);
MaskManager.prototype.constructor = MaskManager;
module.exports = MaskManager;

/**
 * Applies the Mask and adds it to the current filter stack.
 *
 * @param graphics {PIXI.Graphics}
 * @param webGLData {any[]}
 */
MaskManager.prototype.pushMask = function (target, maskData)
{
    if (maskData.texture)
    {
        this.pushSpriteMask(target, maskData);
    }
    else
    {
        this.pushStencilMask(target, maskData);
    }

};

/**
 * Removes the last mask from the mask stack and doesn't return it.
 *
 * @param target {PIXI.RenderTarget}
 * @param maskData {any[]}
 */
MaskManager.prototype.popMask = function (target, maskData)
{
    if (maskData.texture)
    {
        this.popSpriteMask(target, maskData);
    }
    else
    {
        this.popStencilMask(target, maskData);
    }
};

/**
 * Applies the Mask and adds it to the current filter stack.
 *
 * @param target {PIXI.RenderTarget}
 * @param maskData {any[]}
 */
MaskManager.prototype.pushSpriteMask = function (target, maskData)
{
    var alphaMaskFilter = this.alphaMaskPool.pop();

    if (!alphaMaskFilter)
    {
        alphaMaskFilter = [new AlphaMaskFilter(maskData)];
    }

    alphaMaskFilter[0].maskSprite = maskData;
    this.renderer.filterManager.pushFilter(target, alphaMaskFilter);
};

/**
 * Removes the last filter from the filter stack and doesn't return it.
 *
 */
MaskManager.prototype.popSpriteMask = function ()
{
    var filters = this.renderer.filterManager.popFilter();

    this.alphaMaskPool.push(filters);
};


/**
 * Applies the Mask and adds it to the current filter stack.
 *
 * @param target {PIXI.RenderTarget}
 * @param maskData {any[]}
 */
MaskManager.prototype.pushStencilMask = function (target, maskData)
{
    this.renderer.stencilManager.pushMask(maskData);
};

/**
 * Removes the last filter from the filter stack and doesn't return it.
 *
 * @param target {PIXI.RenderTarget}
 * @param maskData {any[]}
 */
MaskManager.prototype.popStencilMask = function (target, maskData)
{
    this.renderer.stencilManager.popMask(maskData);
};


},{"../filters/SpriteMaskFilter":52,"./WebGLManager":58}],56:[function(require,module,exports){
var WebGLManager = require('./WebGLManager'),
    TextureShader = require('../shaders/TextureShader'),
    ComplexPrimitiveShader = require('../shaders/ComplexPrimitiveShader'),
    PrimitiveShader = require('../shaders/PrimitiveShader'),
    utils = require('../../../utils');

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.WebGLManager
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function ShaderManager(renderer)
{
    WebGLManager.call(this, renderer);

    /**
     * @member {number}
     */
    this.maxAttibs = 10;

    /**
     * @member {any[]}
     */
    this.attribState = [];

    /**
     * @member {any[]}
     */
    this.tempAttribState = [];

    for (var i = 0; i < this.maxAttibs; i++)
    {
        this.attribState[i] = false;
    }

    /**
     * @member {any[]}
     */
    this.stack = [];

    /**
     * @member {number}
     * @private
     */
    this._currentId = -1;

    /**
     * @member {PIXI.Shader}
     * @private
     */
    this.currentShader = null;

//    this.initPlugins();
}

ShaderManager.prototype = Object.create(WebGLManager.prototype);
ShaderManager.prototype.constructor = ShaderManager;
utils.pluginTarget.mixin(ShaderManager);

module.exports = ShaderManager;

/**
 * Called when there is a WebGL context change.
 *
 */
ShaderManager.prototype.onContextChange = function ()
{
    this.initPlugins();

    var gl = this.renderer.gl;

    // get the maximum number of attribute correctly as this tends to vary
    this.maxAttibs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

    this.attribState = [];

    for (var i = 0; i < this.maxAttibs; i++)
    {
        this.attribState[i] = false;
    }

    // TODO - Why are these not plugins? We can't decouple primitives unless they are....
    this.defaultShader = new TextureShader(this);
    this.primitiveShader = new PrimitiveShader(this);
    this.complexPrimitiveShader = new ComplexPrimitiveShader(this);
};

/**
 * Takes the attributes given in parameters and uploads them.
 *
 * @param attribs {any[]} attribs
 */
ShaderManager.prototype.setAttribs = function (attribs)
{
    // reset temp state
    var i;

    for (i = 0; i < this.tempAttribState.length; i++)
    {
        this.tempAttribState[i] = false;
    }

    // set the new attribs
    for (var a in attribs)
    {
        this.tempAttribState[attribs[a]] = true;
    }

    var gl = this.renderer.gl;

    for (i = 0; i < this.attribState.length; i++)
    {
        if (this.attribState[i] !== this.tempAttribState[i])
        {
            this.attribState[i] = this.tempAttribState[i];

            if (this.attribState[i])
            {
                gl.enableVertexAttribArray(i);
            }
            else
            {
                gl.disableVertexAttribArray(i);
            }
        }
    }
};

/**
 * Sets the current shader.
 *
 * @param shader {PIXI.Shader} the shader to upload
 */
ShaderManager.prototype.setShader = function (shader)
{
    if (this._currentId === shader.uid)
    {
        return false;
    }

    this._currentId = shader.uid;

    this.currentShader = shader;

    this.renderer.gl.useProgram(shader.program);
    this.setAttribs(shader.attributes);

    return true;
};

/**
 * Destroys this object.
 *
 */
ShaderManager.prototype.destroy = function ()
{
    this.primitiveShader.destroy();
    this.complexPrimitiveShader.destroy();
    WebGLManager.prototype.destroy.call(this);

    this.destroyPlugins();

    this.attribState = null;

    this.tempAttribState = null;
};

},{"../../../utils":77,"../shaders/ComplexPrimitiveShader":59,"../shaders/PrimitiveShader":60,"../shaders/TextureShader":62,"./WebGLManager":58}],57:[function(require,module,exports){
var WebGLManager = require('./WebGLManager'),
    utils = require('../../../utils');

/**
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function WebGLMaskManager(renderer)
{
    WebGLManager.call(this, renderer);
    this.stencilMaskStack = null;
}

WebGLMaskManager.prototype = Object.create(WebGLManager.prototype);
WebGLMaskManager.prototype.constructor = WebGLMaskManager;
module.exports = WebGLMaskManager;

/**
 * Changes the mask stack that is used by this manager.
 *
 * @param stencilMaskStack {PIXI.StencilMaskStack} The mask stack
 */
WebGLMaskManager.prototype.setMaskStack = function ( stencilMaskStack )
{
    this.stencilMaskStack = stencilMaskStack;

    var gl = this.renderer.gl;

    if (stencilMaskStack.stencilStack.length === 0)
    {
        gl.disable(gl.STENCIL_TEST);
    }
    else
    {
        gl.enable(gl.STENCIL_TEST);
    }
};

/**
 * Applies the Mask and adds it to the current filter stack. @alvin
 *
 * @param graphics {PIXI.Graphics}
 * @param webGLData {any[]}
 */
WebGLMaskManager.prototype.pushStencil = function (graphics, webGLData)
{
    this.renderer.currentRenderTarget.attachStencilBuffer();

    var gl = this.renderer.gl,
        sms = this.stencilMaskStack;

    this.bindGraphics(graphics, webGLData);

    if (sms.stencilStack.length === 0)
    {
        gl.enable(gl.STENCIL_TEST);
        gl.clear(gl.STENCIL_BUFFER_BIT);
        sms.reverse = true;
        sms.count = 0;
    }

    sms.stencilStack.push(webGLData);

    var level = sms.count;

    gl.colorMask(false, false, false, false);

    gl.stencilFunc(gl.ALWAYS,0,0xFF);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.INVERT);

    // draw the triangle strip!

    if (webGLData.mode === 1)
    {
        gl.drawElements(gl.TRIANGLE_FAN,  webGLData.indices.length - 4, gl.UNSIGNED_SHORT, 0 );

        if (sms.reverse)
        {
            gl.stencilFunc(gl.EQUAL, 0xFF - level, 0xFF);
            gl.stencilOp(gl.KEEP,gl.KEEP,gl.DECR);
        }
        else
        {
            gl.stencilFunc(gl.EQUAL,level, 0xFF);
            gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);
        }

        // draw a quad to increment..
        gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, ( webGLData.indices.length - 4 ) * 2 );

        if (sms.reverse)
        {
            gl.stencilFunc(gl.EQUAL,0xFF-(level+1), 0xFF);
        }
        else
        {
            gl.stencilFunc(gl.EQUAL,level+1, 0xFF);
        }

        sms.reverse = !sms.reverse;
    }
    else
    {
        if (!sms.reverse)
        {
            gl.stencilFunc(gl.EQUAL, 0xFF - level, 0xFF);
            gl.stencilOp(gl.KEEP,gl.KEEP,gl.DECR);
        }
        else
        {
            gl.stencilFunc(gl.EQUAL,level, 0xFF);
            gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);
        }

        gl.drawElements(gl.TRIANGLE_STRIP,  webGLData.indices.length, gl.UNSIGNED_SHORT, 0 );

        if (!sms.reverse)
        {
            gl.stencilFunc(gl.EQUAL,0xFF-(level+1), 0xFF);
        }
        else
        {
            gl.stencilFunc(gl.EQUAL,level+1, 0xFF);
        }
    }

    gl.colorMask(true, true, true, true);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);

    sms.count++;
};

/**
 * TODO this does not belong here!
 *
 * @param graphics {PIXI.Graphics}
 * @param webGLData {any[]}
 */
WebGLMaskManager.prototype.bindGraphics = function (graphics, webGLData)
{
    //if (this._currentGraphics === graphics)return;
    var gl = this.renderer.gl;

     // bind the graphics object..
    var shader;// = this.renderer.shaderManager.plugins.primitiveShader;

    if (webGLData.mode === 1)
    {
        shader = this.renderer.shaderManager.complexPrimitiveShader;

        this.renderer.shaderManager.setShader(shader);

        gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, graphics.worldTransform.toArray(true));

        gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, this.renderer.currentRenderTarget.projectionMatrix.toArray(true));

        gl.uniform3fv(shader.uniforms.tint._location, utils.hex2rgb(graphics.tint));

        gl.uniform3fv(shader.uniforms.color._location, webGLData.color);

        gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);

        gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);

        gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 2, 0);


        // now do the rest..
        // set the index buffer!
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
    }
    else
    {
        //this.renderer.shaderManager.activatePrimitiveShader();
        shader = this.renderer.shaderManager.primitiveShader;

        this.renderer.shaderManager.setShader(shader);

        gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, graphics.worldTransform.toArray(true));

        gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, this.renderer.currentRenderTarget.projectionMatrix.toArray(true));

        gl.uniform3fv(shader.uniforms.tint._location, utils.hex2rgb(graphics.tint));

        gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);

        gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);

        gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
        gl.vertexAttribPointer(shader.attributes.aColor, 4, gl.FLOAT, false,4 * 6, 2 * 4);

        // set the index buffer!
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
    }
};

/**
 * TODO @alvin
 * @param graphics {PIXI.Graphics}
 * @param webGLData {any[]}
 */
WebGLMaskManager.prototype.popStencil = function (graphics, webGLData)
{
    var gl = this.renderer.gl,
        sms = this.stencilMaskStack;

    sms.stencilStack.pop();

    sms.count--;

    if (sms.stencilStack.length === 0)
    {
        // the stack is empty!
        gl.disable(gl.STENCIL_TEST);

    }
    else
    {

        var level = sms.count;

        this.bindGraphics(graphics, webGLData);

        gl.colorMask(false, false, false, false);

        if (webGLData.mode === 1)
        {
            sms.reverse = !sms.reverse;

            if (sms.reverse)
            {
                gl.stencilFunc(gl.EQUAL, 0xFF - (level+1), 0xFF);
                gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);
            }
            else
            {
                gl.stencilFunc(gl.EQUAL,level+1, 0xFF);
                gl.stencilOp(gl.KEEP,gl.KEEP,gl.DECR);
            }

            // draw a quad to increment..
            gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, ( webGLData.indices.length - 4 ) * 2 );

            gl.stencilFunc(gl.ALWAYS,0,0xFF);
            gl.stencilOp(gl.KEEP,gl.KEEP,gl.INVERT);

            // draw the triangle strip!
            gl.drawElements(gl.TRIANGLE_FAN,  webGLData.indices.length - 4, gl.UNSIGNED_SHORT, 0 );

            this.renderer.drawCount += 2;

            if (!sms.reverse)
            {
                gl.stencilFunc(gl.EQUAL,0xFF-(level), 0xFF);
            }
            else
            {
                gl.stencilFunc(gl.EQUAL,level, 0xFF);
            }

        }
        else
        {
          //  console.log("<<>>")
            if (!sms.reverse)
            {
                gl.stencilFunc(gl.EQUAL, 0xFF - (level+1), 0xFF);
                gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);
            }
            else
            {
                gl.stencilFunc(gl.EQUAL,level+1, 0xFF);
                gl.stencilOp(gl.KEEP,gl.KEEP,gl.DECR);
            }

            gl.drawElements(gl.TRIANGLE_STRIP,  webGLData.indices.length, gl.UNSIGNED_SHORT, 0 );

            this.renderer.drawCount++;

            if (!sms.reverse)
            {
                gl.stencilFunc(gl.EQUAL,0xFF-(level), 0xFF);
            }
            else
            {
                gl.stencilFunc(gl.EQUAL,level, 0xFF);
            }
        }

        gl.colorMask(true, true, true, true);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);


    }
};

/**
 * Destroys the mask stack.
 *
 */
WebGLMaskManager.prototype.destroy = function ()
{
    WebGLManager.prototype.destroy.call(this);

    this.stencilMaskStack.stencilStack = null;
};

/**
 * Applies the Mask and adds it to the current filter stack.
 *
 * @param maskData {any[]} The mask data structure to use
 */
WebGLMaskManager.prototype.pushMask = function (maskData)
{


    this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

    if (maskData.dirty)
    {
        this.renderer.plugins.graphics.updateGraphics(maskData, this.renderer.gl);
    }

    if (!maskData._webGL[this.renderer.gl.id].data.length)
    {
        return;
    }

    this.pushStencil(maskData, maskData._webGL[this.renderer.gl.id].data[0]);
};

/**
 * Removes the last filter from the filter stack and doesn't return it.
 *
 * @param maskData {any[]}
 */
WebGLMaskManager.prototype.popMask = function (maskData)
{
    this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

    this.popStencil(maskData, maskData._webGL[this.renderer.gl.id].data[0]);
};


},{"../../../utils":77,"./WebGLManager":58}],58:[function(require,module,exports){
/**
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function WebGLManager(renderer)
{
    /**
     * The renderer this manager works for.
     *
     * @member {PIXI.WebGLRenderer}
     */
    this.renderer = renderer;

    this.renderer.on('context', this.onContextChange, this);
}

WebGLManager.prototype.constructor = WebGLManager;
module.exports = WebGLManager;

/**
 * Generic method called when there is a WebGL context change.
 *
 */
WebGLManager.prototype.onContextChange = function ()
{
	// do some codes init!
};

/**
 * Generic destroy methods to be overridden by the subclass
 *
 */
WebGLManager.prototype.destroy = function ()
{
    this.renderer.off('context', this.onContextChange, this);

    this.renderer = null;
};

},{}],59:[function(require,module,exports){
var Shader = require('./Shader');

/**
 * This shader is used to draw complex primitive shapes for {@link PIXI.Graphics}.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 * @param shaderManager {PIXI.ShaderManager} The webgl shader manager this shader works for.
 */
function ComplexPrimitiveShader(shaderManager)
{
    Shader.call(this,
        shaderManager,
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',

            'uniform mat3 translationMatrix;',
            'uniform mat3 projectionMatrix;',

            'uniform vec3 tint;',
            'uniform float alpha;',
            'uniform vec3 color;',

            'varying vec4 vColor;',

            'void main(void){',
            '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '   vColor = vec4(color * alpha * tint, alpha);',//" * vec4(tint * alpha, alpha);',
            '}'
        ].join('\n'),
        // fragment shader
        [
            'precision mediump float;',

            'varying vec4 vColor;',

            'void main(void){',
            '   gl_FragColor = vColor;',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            tint:   { type: '3f', value: [0, 0, 0] },
            alpha:  { type: '1f', value: 0 },
            color:  { type: '3f', value: [0,0,0] },
            translationMatrix: { type: 'mat3', value: new Float32Array(9) },
            projectionMatrix: { type: 'mat3', value: new Float32Array(9) }
        },
        // attributes
        {
            aVertexPosition:0
        }
    );
}

ComplexPrimitiveShader.prototype = Object.create(Shader.prototype);
ComplexPrimitiveShader.prototype.constructor = ComplexPrimitiveShader;
module.exports = ComplexPrimitiveShader;

},{"./Shader":61}],60:[function(require,module,exports){
var Shader = require('./Shader');

/**
 * This shader is used to draw simple primitive shapes for {@link PIXI.Graphics}.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 * @param shaderManager {ShaderManager} The webgl shader manager this shader works for.
 */
function PrimitiveShader(shaderManager)
{
    Shader.call(this,
        shaderManager,
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec4 aColor;',

            'uniform mat3 translationMatrix;',
            'uniform mat3 projectionMatrix;',

            'uniform float alpha;',
            'uniform float flipY;',
            'uniform vec3 tint;',

            'varying vec4 vColor;',

            'void main(void){',
            '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '   vColor = aColor * vec4(tint * alpha, alpha);',
            '}'
        ].join('\n'),
        // fragment shader
        [
            'precision mediump float;',

            'varying vec4 vColor;',

            'void main(void){',
            '   gl_FragColor = vColor;',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            tint:   { type: '3f', value: [0, 0, 0] },
            alpha:  { type: '1f', value: 0 },
            translationMatrix: { type: 'mat3', value: new Float32Array(9) },
            projectionMatrix: { type: 'mat3', value: new Float32Array(9) }
        },
        // custom attributes
        {
            aVertexPosition:0,
            aColor:0
        }
    );
}

PrimitiveShader.prototype = Object.create(Shader.prototype);
PrimitiveShader.prototype.constructor = PrimitiveShader;
module.exports = PrimitiveShader;

},{"./Shader":61}],61:[function(require,module,exports){
/*global console */
var utils = require('../../../utils');

/**
 * Base shader class for PIXI managed shaders.
 *
 * @class
 * @memberof PIXI
 * @param shaderManager {PIXI.ShaderManager} The webgl shader manager this shader works for.
 * @param [vertexSrc] {string} The source of the vertex shader.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 * @param [uniforms] {object} Uniforms for this shader.
 * @param [attributes] {object} Attributes for this shader.
 */
function Shader(shaderManager, vertexSrc, fragmentSrc, uniforms, attributes)
{
    if (!vertexSrc || !fragmentSrc)
    {
         throw new Error('Pixi.js Error. Shader requires vertexSrc and fragmentSrc');
    }

    /**
     * A unique id
     * @member {number}
     * @readonly
     */
    this.uid = utils.uid();

    /**
     * The current WebGL drawing context
     * @member {WebGLRenderingContext}
     * @readonly
     */
    this.gl = shaderManager.renderer.gl;

    //TODO maybe we should pass renderer rather than shader manger?? food for thought..
    this.shaderManager = shaderManager;

    /**
     * The WebGL program.
     *
     * @member {WebGLProgram}
     * @readonly
     */
    this.program = null;

    /**
     * The uniforms as an object
     * @member {object}
     * @private
     */
    this.uniforms = uniforms || {};

    /**
     * The attributes as an object
     * @member {object}
     * @private
     */
    this.attributes = attributes || {};

    /**
     * Internal texture counter
     * @member {number}
     * @private
     */
    this.textureCount = 1;

    /**
     * The vertex shader as an array of strings
     *
     * @member {string}
     */
    this.vertexSrc = vertexSrc;

    /**
     * The fragment shader as an array of strings
     *
     * @member {string}
     */
    this.fragmentSrc = fragmentSrc;

    this.init();
}

Shader.prototype.constructor = Shader;
module.exports = Shader;

/**
 * Creates the shader and uses it
 *
 */
Shader.prototype.init = function ()
{
    this.compile();

    this.gl.useProgram(this.program);

    this.cacheUniformLocations(Object.keys(this.uniforms));
    this.cacheAttributeLocations(Object.keys(this.attributes));
};

/**
 * Caches the locations of the uniform for reuse.
 *
 * @param keys {string} the uniforms to cache
 */
Shader.prototype.cacheUniformLocations = function (keys)
{
    for (var i = 0; i < keys.length; ++i)
    {
        this.uniforms[keys[i]]._location = this.gl.getUniformLocation(this.program, keys[i]);
    }
};

/**
 * Caches the locations of the attribute for reuse.
 *
 * @param keys {string} the attributes to cache
 */
Shader.prototype.cacheAttributeLocations = function (keys)
{
    for (var i = 0; i < keys.length; ++i)
    {
        this.attributes[keys[i]] = this.gl.getAttribLocation(this.program, keys[i]);
    }

    // TODO: Check if this is needed anymore...

    // Begin worst hack eva //

    // WHY??? ONLY on my chrome pixel the line above returns -1 when using filters?
    // maybe its something to do with the current state of the gl context.
    // I'm convinced this is a bug in the chrome browser as there is NO reason why this should be returning -1 especially as it only manifests on my chrome pixel
    // If theres any webGL people that know why could happen please help :)
    // if (this.attributes.aColor === -1){
    //     this.attributes.aColor = 2;
    // }

    // End worst hack eva //
};

/**
 * Attaches the shaders and creates the program.
 *
 * @return {WebGLProgram}
 */
Shader.prototype.compile = function ()
{
    var gl = this.gl;

    var glVertShader = this._glCompile(gl.VERTEX_SHADER, this.vertexSrc);
    var glFragShader = this._glCompile(gl.FRAGMENT_SHADER, this.fragmentSrc);

    var program = gl.createProgram();

    gl.attachShader(program, glVertShader);
    gl.attachShader(program, glFragShader);
    gl.linkProgram(program);

    // if linking fails, then log and cleanup
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error('Pixi.js Error: Could not initialize shader.');
        console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(program, gl.VALIDATE_STATUS));
        console.error('gl.getError()', gl.getError());

        // if there is a program info log, log it
        if (gl.getProgramInfoLog(program) !== '')
        {
            console.warn('Pixi.js Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(program));
        }

        gl.deleteProgram(program);
        program = null;
    }

    // clean up some shaders
    gl.deleteShader(glVertShader);
    gl.deleteShader(glFragShader);

    return (this.program = program);
};

/*
Shader.prototype.buildSync = function ()
{
   // var str = ""

   // str =  "Shader.prototype.syncUniforms = function()";
   // str += "{\n";

    for (var key in this.uniforms)
    {
        var uniform = this.uniforms[key];

        Object.defineProperty(this, key, {

            get: function ()
            {
                return uniform.value
            },
            set: function (value)
            {
                this.setUniform(uniform, value);
            }
        });

        console.log( makePropSetter( key, " bloop", uniform.type )  )
  //      Object.def
        //    location = uniform._location,
          //  value = uniform.value,
            //i, il;

    //    str += "gl.uniform1i(this.uniforms."+ key +"._location, this.uniforms." + key + ".value );\n"

    }

}*/

/**
* Adds a new uniform
*
* @param uniform {object} the new uniform to attach
*/
Shader.prototype.syncUniform = function (uniform)
{
    var location = uniform._location,
        value = uniform.value,
        gl = this.gl,
        i, il;

    switch (uniform.type)
    {
        case 'b':
        case 'bool':
        case 'boolean':
            gl.uniform1i(location, value ? 1 : 0);
            break;

        // single int value
        case 'i':
        case '1i':
            gl.uniform1i(location, value);
            break;

        // single float value
        case 'f':
        case '1f':
            gl.uniform1f(location, value);
            break;

        // Float32Array(2) or JS Arrray
        case '2f':
            gl.uniform2f(location, value[0], value[1]);
            break;

        // Float32Array(3) or JS Arrray
        case '3f':
            gl.uniform3f(location, value[0], value[1], value[2]);
            break;

        // Float32Array(4) or JS Arrray
        case '4f':
            gl.uniform4f(location, value[0], value[1], value[2], value[3]);
            break;

        // a 2D Point object
        case 'v2':
            gl.uniform2f(location, value.x, value.y);
            break;

        // a 3D Point object
        case 'v3':
            gl.uniform3f(location, value.x, value.y, value.z);
            break;

        // a 4D Point object
        case 'v4':
            gl.uniform4f(location, value.x, value.y, value.z, value.w);
            break;

        // Int32Array or JS Array
        case '1iv':
            gl.uniform1iv(location, value);
            break;

        // Int32Array or JS Array
        case '2iv':
            gl.uniform2iv(location, value);
            break;

        // Int32Array or JS Array
        case '3iv':
            gl.uniform3iv(location, value);
            break;

        // Int32Array or JS Array
        case '4iv':
            gl.uniform4iv(location, value);
            break;

        // Float32Array or JS Array
        case '1fv':
            gl.uniform1fv(location, value);
            break;

        // Float32Array or JS Array
        case '2fv':
            gl.uniform2fv(location, value);
            break;

        // Float32Array or JS Array
        case '3fv':
            gl.uniform3fv(location, value);
            break;

        // Float32Array or JS Array
        case '4fv':
            gl.uniform4fv(location, value);
            break;

        // Float32Array or JS Array
        case 'm2':
        case 'mat2':
        case 'Matrix2fv':
            gl.uniformMatrix2fv(location, uniform.transpose, value);
            break;

        // Float32Array or JS Array
        case 'm3':
        case 'mat3':
        case 'Matrix3fv':

            gl.uniformMatrix3fv(location, uniform.transpose, value);
            break;

        // Float32Array or JS Array
        case 'm4':
        case 'mat4':
        case 'Matrix4fv':
            gl.uniformMatrix4fv(location, uniform.transpose, value);
            break;

        // a Color Value
        case 'c':
            if (typeof value === 'number')
            {
                value = utils.hex2rgb(value);
            }

            gl.uniform3f(location, value[0], value[1], value[2]);
            break;

        // flat array of integers (JS or typed array)
        case 'iv1':
            gl.uniform1iv(location, value);
            break;

        // flat array of integers with 3 x N size (JS or typed array)
        case 'iv':
            gl.uniform3iv(location, value);
            break;

        // flat array of floats (JS or typed array)
        case 'fv1':
            gl.uniform1fv(location, value);
            break;

        // flat array of floats with 3 x N size (JS or typed array)
        case 'fv':
            gl.uniform3fv(location, value);
            break;

        // array of 2D Point objects
        case 'v2v':
            if (!uniform._array)
            {
                uniform._array = new Float32Array(2 * value.length);
            }

            for (i = 0, il = value.length; i < il; ++i)
            {
                uniform._array[i * 2]       = value[i].x;
                uniform._array[i * 2 + 1]   = value[i].y;
            }

            gl.uniform2fv(location, uniform._array);
            break;

        // array of 3D Point objects
        case 'v3v':
            if (!uniform._array)
            {
                uniform._array = new Float32Array(3 * value.length);
            }

            for (i = 0, il = value.length; i < il; ++i)
            {
                uniform._array[i * 3]       = value[i].x;
                uniform._array[i * 3 + 1]   = value[i].y;
                uniform._array[i * 3 + 2]   = value[i].z;

            }

            gl.uniform3fv(location, uniform._array);
            break;

        // array of 4D Point objects
        case 'v4v':
            if (!uniform._array)
            {
                uniform._array = new Float32Array(4 * value.length);
            }

            for (i = 0, il = value.length; i < il; ++i)
            {
                uniform._array[i * 4]       = value[i].x;
                uniform._array[i * 4 + 1]   = value[i].y;
                uniform._array[i * 4 + 2]   = value[i].z;
                uniform._array[i * 4 + 3]   = value[i].w;

            }

            gl.uniform4fv(location, uniform._array);
            break;

        // PIXI.Texture
        case 't':
        case 'sampler2D':

            if (!uniform.value || !uniform.value.baseTexture.hasLoaded)
            {
                break;
            }

            // activate this texture
            gl.activeTexture(gl['TEXTURE' + this.textureCount]);

            var texture = uniform.value.baseTexture._glTextures[gl.id];

            if (!texture)
            {
                this.initSampler2D(uniform);

                // set the textur to the newly created one..
                texture = uniform.value.baseTexture._glTextures[gl.id];
            }

            // bind the texture
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // set uniform to texture index
            gl.uniform1i(uniform._location, this.textureCount);

            // increment next texture id
            this.textureCount++;

            break;

        default:
            console.warn('Pixi.js Shader Warning: Unknown uniform type: ' + uniform.type);
    }
};

/**
 * Updates the shader uniform values.
 *
 */
Shader.prototype.syncUniforms = function ()
{
    this.textureCount = 1;

    for (var key in this.uniforms)
    {
        this.syncUniform(this.uniforms[key]);
    }
};


/**
 * Initialises a Sampler2D uniform (which may only be available later on after initUniforms once the texture has loaded)
 *
 */
Shader.prototype.initSampler2D = function (uniform)
{
    var gl = this.gl;

    var texture = uniform.value.baseTexture;

    if(!texture.hasLoaded)
    {
        return;
    }



    if (uniform.textureData)
    {

        //TODO move this...
        var data = uniform.textureData;

        texture._glTextures[gl.id] = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
        // GLTexture = mag linear, min linear_mipmap_linear, wrap repeat + gl.generateMipmap(gl.TEXTURE_2D);
        // GLTextureLinear = mag/min linear, wrap clamp
        // GLTextureNearestRepeat = mag/min NEAREST, wrap repeat
        // GLTextureNearest = mag/min nearest, wrap clamp
        // AudioTexture = whatever + luminance + width 512, height 2, border 0
        // KeyTexture = whatever + luminance + width 256, height 2, border 0

        //  magFilter can be: gl.LINEAR, gl.LINEAR_MIPMAP_LINEAR or gl.NEAREST
        //  wrapS/T can be: gl.CLAMP_TO_EDGE or gl.REPEAT

        gl.texImage2D(gl.TEXTURE_2D, 0, data.luminance ? gl.LUMINANCE : gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, data.magFilter ? data.magFilter : gl.LINEAR );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, data.wrapS ? data.wrapS : gl.CLAMP_TO_EDGE );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, data.wrapS ? data.wrapS : gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, data.wrapT ? data.wrapT : gl.CLAMP_TO_EDGE);
    }
    else
    {
        this.shaderManager.renderer.updateTexture(texture);
    }
};

/**
 * Destroys the shader.
 *
 */
Shader.prototype.destroy = function ()
{
    this.gl.deleteProgram(this.program);

    this.gl = null;
    this.uniforms = null;
    this.attributes = null;

    this.vertexSrc = null;
    this.fragmentSrc = null;
};

Shader.prototype._glCompile = function (type, src)
{
    var shader = this.gl.createShader(type);

    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
    {
        console.log(this.gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

},{"../../../utils":77}],62:[function(require,module,exports){
var Shader = require('./Shader');

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 * @param shaderManager {PIXI.ShaderManager} The webgl shader manager this shader works for.
 * @param [vertexSrc] {string} The source of the vertex shader.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 * @param [customUniforms] {object} Custom uniforms to use to augment the built-in ones.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 */
function TextureShader(shaderManager, vertexSrc, fragmentSrc, customUniforms, customAttributes)
{
    var uniforms = {

        uSampler:           { type: 'sampler2D', value: 0 },
        projectionMatrix:   { type: 'mat3', value: new Float32Array([1, 0, 0,
                                                                     0, 1, 0,
                                                                     0, 0, 1]) }
    };

    if (customUniforms)
    {
        for (var u in customUniforms)
        {
            uniforms[u] = customUniforms[u];
        }
    }


    var attributes = {
        aVertexPosition:    0,
        aTextureCoord:      0,
        aColor:             0
    };

    if (customAttributes)
    {
        for (var a in customAttributes)
        {
            attributes[a] = customAttributes[a];
        }
    }

    /**
     * The vertex shader.
     *
     * @member {string}
     */
    vertexSrc = vertexSrc || TextureShader.defaultVertexSrc;

    /**
     * The fragment shader.
     *
     * @member {string}
     */
    fragmentSrc = fragmentSrc || TextureShader.defaultFragmentSrc;

    Shader.call(this, shaderManager, vertexSrc, fragmentSrc, uniforms, attributes);
}

// constructor
TextureShader.prototype = Object.create(Shader.prototype);
TextureShader.prototype.constructor = TextureShader;
module.exports = TextureShader;

/**
 * The default vertex shader source
 *
 * @static
 * @constant
 */
TextureShader.defaultVertexSrc = [
    'precision lowp float;',
    'attribute vec2 aVertexPosition;',
    'attribute vec2 aTextureCoord;',
    'attribute vec4 aColor;',

    'uniform mat3 projectionMatrix;',

    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',

    'void main(void){',
    '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
    '   vTextureCoord = aTextureCoord;',
    '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
    '}'
].join('\n');

/**
 * The default fragment shader source
 *
 * @static
 * @constant
 */
TextureShader.defaultFragmentSrc = [
    'precision lowp float;',

    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',

    'uniform sampler2D uSampler;',

    'void main(void){',
    '   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;',
    '}'
].join('\n');

},{"./Shader":61}],63:[function(require,module,exports){
var WebGLManager = require('../managers/WebGLManager');

/**
 * Base for a common object renderer that can be used as a system renderer plugin.
 *
 * @class
 * @extends PIXI.WebGLManager
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this object renderer works for.
 */
function ObjectRenderer(renderer)
{
    WebGLManager.call(this, renderer);
}


ObjectRenderer.prototype = Object.create(WebGLManager.prototype);
ObjectRenderer.prototype.constructor = ObjectRenderer;
module.exports = ObjectRenderer;

/**
 * Starts the renderer and sets the shader
 *
 */
ObjectRenderer.prototype.start = function ()
{
    // set the shader..
};

/**
 * Stops the renderer
 *
 */
ObjectRenderer.prototype.stop = function ()
{
    this.flush();
};

/**
 * flushes
 *
 */
ObjectRenderer.prototype.flush = function ()
{
    // flush!
};

/**
 * Renders an object
 *
 * @param object {PIXI.DisplayObject} The object to render.
 */
ObjectRenderer.prototype.render = function (object) // jshint unused:false
{
    // render the object
};

},{"../managers/WebGLManager":58}],64:[function(require,module,exports){
/**
 * Helper class to create a quad
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} The gl context for this quad to use.
 */
function Quad(gl)
{
    /*
     * the current WebGL drawing context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

//    this.textures = new TextureUvs();

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    this.vertices = new Float32Array([
        0,0,
        200,0,
        200,200,
        0,200
    ]);

    /**
     * The Uvs of the quad
     *
     * @member {Float32Array}
     */
    this.uvs = new Float32Array([
        0,0,
        1,0,
        1,1,
        0,1
    ]);

//    var white = (0xFFFFFF >> 16) + (0xFFFFFF & 0xff00) + ((0xFFFFFF & 0xff) << 16) + (1 * 255 << 24);
    //TODO convert this to a 32 unsigned int array
    /**
     * The color components of the triangles
     *
     * @member {Float32Array}
     */
    this.colors = new Float32Array([
        1,1,1,1,
        1,1,1,1,
        1,1,1,1,
        1,1,1,1
    ]);

    /*
     * @member {Uint16Array} An array containing the indices of the vertices
     */
    this.indices = new Uint16Array([
        0, 1, 2, 0, 3, 2
    ]);

    /*
     * @member {WebGLBuffer} The vertex buffer
     */
    this.vertexBuffer = gl.createBuffer();

    /*
     * @member {WebGLBuffer} The index buffer
     */
    this.indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, (8 + 8 + 16) * 4, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    this.upload();
}

Quad.prototype.constructor = Quad;

/**
 * Maps two Rectangle to the quad
 * @param rect {PIXI.Rectangle} the first rectangle
 * @param rect2 {PIXI.Rectangle} the second rectangle
 */
Quad.prototype.map = function(rect, rect2)
{
    var x = 0; //rect2.x / rect.width;
    var y = 0; //rect2.y / rect.height;

    this.uvs[0] = x;
    this.uvs[1] = y;

    this.uvs[2] = x + rect2.width / rect.width;
    this.uvs[3] = y;

    this.uvs[4] = x + rect2.width / rect.width;
    this.uvs[5] = y + rect2.height / rect.height;

    this.uvs[6] = x;
    this.uvs[7] = y + rect2.height / rect.height;

    /// -----
    x = rect2.x;
    y = rect2.y;

    this.vertices[0] = x;
    this.vertices[1] = y;

    this.vertices[2] = x + rect2.width;
    this.vertices[3] = y;

    this.vertices[4] = x + rect2.width;
    this.vertices[5] = y + rect2.height;

    this.vertices[6] = x;
    this.vertices[7] = y + rect2.height;

    this.upload();
};

/**
 * Binds the buffer and uploads the data
 */
Quad.prototype.upload = function()
{
    var gl = this.gl;

    // TODO could probably be pushed into one upload!
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);

    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * 4, this.uvs);

    gl.bufferSubData(gl.ARRAY_BUFFER, (8 + 8) * 4, this.colors);
};

Quad.prototype.destroy = function()
{
    var gl = this.gl;
    
     gl.deleteBuffer(this.vertexBuffer);
     gl.deleteBuffer(this.indexBuffer);
};

module.exports = Quad;



},{}],65:[function(require,module,exports){
var math = require('../../../math'),
    utils = require('../../../utils'),
    CONST = require('../../../const'),
    //StencilManager = require('../managers/StencilManager'),
    StencilMaskStack = require('./StencilMaskStack');

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 * @param width {number} the horizontal range of the filter
 * @param height {number} the vertical range of the filter
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param resolution {number} the current resolution
 * @param root {boolean} Whether this object is the root element or not
 */
var RenderTarget = function(gl, width, height, scaleMode, resolution, root)
{
    //TODO Resolution could go here ( eg low res blurs )

    /**
     * The current WebGL drawing context.
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    // next time to create a frame buffer and texture

    /**
     * A frame buffer
     *
     * @member {WebGLFrameBuffer}
     */
    this.frameBuffer = null;

    /**
     * The texture
     *
     * @member {PIXI.Texture}
     */
    this.texture = null;

    /**
     * The size of the object as a rectangle
     *
     * @member {PIXI.Rectangle}
     */
    this.size = new math.Rectangle(0, 0, 1, 1);

    /**
     * The current resolution
     *
     * @member {number}
     */
    this.resolution = resolution || CONST.RESOLUTION;

    /**
     * The projection matrix
     *
     * @member {PIXI.Matrix}
     */
    this.projectionMatrix = new math.Matrix();

    /**
     * The object's transform
     *
     * @member {PIXI.Matrix}
     */
    this.transform = null;

    /**
     * The frame.
     *
     * @member {PIXI.Rectangle}
     */
    this.frame = null;

    /**
     * The stencil buffer stores masking data for the render target
     *
     * @member {WebGLRenderBuffer}
     */
    this.stencilBuffer = null;

    /**
     * The data structure for the stencil masks
     *
     * @member {PIXI.StencilMaskStack}
     */
    this.stencilMaskStack = new StencilMaskStack();

    /**
     * Stores filter data for the render target
     *
     * @member {object[]}
     */
    this.filterStack = [
        {
            renderTarget:this,
            filter:[],
            bounds:this.size
        }
    ];


    /**
     * The scale mode.
     *
     * @member {number}
     * @default PIXI.SCALE_MODES.DEFAULT
     * @see PIXI.SCALE_MODES
     */
    this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;

    /**
     * Whether this object is the root element or not
     *
     * @member {boolean}
     */
    this.root = root;

    if (!this.root)
    {
       // this.flipY = true;
        this.frameBuffer = gl.createFramebuffer();

        /*
            A frame buffer needs a target to render to..
            create a texture and bind it attach it to the framebuffer..
         */

        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D,  this.texture);

        // set the scale properties of the texture..
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, scaleMode === CONST.SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);

        // check to see if the texture is a power of two!
        var isPowerOfTwo = utils.isPowerOfTwo(width, height);

        //TODO for 99% of use cases if a texture is power of two we should tile the texture...
         if (!isPowerOfTwo)
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        else
        {

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer );
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    }

    this.resize(width, height);
};

RenderTarget.prototype.constructor = RenderTarget;
module.exports = RenderTarget;

/**
 * Clears the filter texture.
 *
 * @param [bind=false] {boolean} Should we bind our framebuffer before clearing?
 */
RenderTarget.prototype.clear = function(bind)
{
    var gl = this.gl;
    if(bind)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    }

    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};

/**
 * Binds the stencil buffer.
 *
 */
RenderTarget.prototype.attachStencilBuffer = function()
{

    if (this.stencilBuffer)
    {
        return;
    }

    /**
     * The stencil buffer is used for masking in pixi
     * lets create one and then add attach it to the framebuffer..
     */
    if (!this.root)
    {
        var gl = this.gl;

        this.stencilBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencilBuffer);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.stencilBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL,  this.size.width * this.resolution  , this.size.height * this.resolution );
    }
};

/**
 * Binds the buffers and initialises the viewport.
 *
 */
RenderTarget.prototype.activate = function()
{
    //TOOD refactor usage of frame..
    var gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

    var projectionFrame = this.frame || this.size;

    // TODO add a dirty flag to this of a setter for the frame?
    this.calculateProjection( projectionFrame );

    if(this.transform)
    {
        this.projectionMatrix.append(this.transform);
    }

    gl.viewport(0,0, projectionFrame.width * this.resolution, projectionFrame.height * this.resolution);
};

/**
 * Updates the projection matrix based on a projection frame (which is a rectangle)
 *
 */
RenderTarget.prototype.calculateProjection = function (projectionFrame)
{
    var pm = this.projectionMatrix;

    pm.identity();

    if (!this.root)
    {
        pm.a = 1 / projectionFrame.width*2;
        pm.d = 1 / projectionFrame.height*2;

        pm.tx = -1 - projectionFrame.x * pm.a;
        pm.ty = -1 - projectionFrame.y * pm.d;
    }
    else
    {
        pm.a = 1 / projectionFrame.width*2;
        pm.d = -1 / projectionFrame.height*2;

        pm.tx = -1 - projectionFrame.x * pm.a;
        pm.ty = 1 - projectionFrame.y * pm.d;
    }
};


/**
 * Resizes the texture to the specified width and height
 *
 * @param width {Number} the new width of the texture
 * @param height {Number} the new height of the texture
 */
RenderTarget.prototype.resize = function (width, height)
{
    width = width | 0;
    height = height | 0;

    if (this.size.width === width && this.size.height === height) {
        return;
    }

    this.size.width = width;
    this.size.height = height;

    if (!this.root)
    {
        var gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D,  this.texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  width * this.resolution, height * this.resolution , 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        if (this.stencilBuffer )
        {
            // update the stencil buffer width and height
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencilBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL,  width * this.resolution, height * this.resolution );
        }
    }

    var projectionFrame = this.frame || this.size;

    this.calculateProjection( projectionFrame );
};

/**
 * Destroys the render target.
 *
 */
RenderTarget.prototype.destroy = function ()
{
    var gl = this.gl;
    gl.deleteRenderbuffer( this.stencilBuffer );
    gl.deleteFramebuffer( this.frameBuffer );
    gl.deleteTexture( this.texture );

    this.frameBuffer = null;
    this.texture = null;
};

},{"../../../const":22,"../../../math":33,"../../../utils":77,"./StencilMaskStack":66}],66:[function(require,module,exports){
/**
 * Generic Mask Stack data structure
 * @class
 * @memberof PIXI
 */
function StencilMaskStack()
{
	/**
     * The actual stack
     *
     * @member {any[]}
     */
    this.stencilStack = [];

    /**
     * TODO @alvin
     *
     * @member {boolean}
     */
    this.reverse = true;

    /**
     * Internal count
     *
     * @member {number}
     */
    this.count = 0;
}

StencilMaskStack.prototype.constructor = StencilMaskStack;
module.exports = StencilMaskStack;

},{}],67:[function(require,module,exports){
var math = require('../math'),
    Texture = require('../textures/Texture'),
    Container = require('../display/Container'),
    CanvasTinter = require('../renderers/canvas/utils/CanvasTinter'),
    utils = require('../utils'),
    CONST = require('../const'),
    tempPoint = new math.Point(),
    GroupD8 = math.GroupD8,
    canvasRenderWorldTransform = new math.Matrix();

/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
 *
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * var sprite = new PIXI.Sprite.fromImage('assets/image.png');
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 * @param texture {PIXI.Texture} The texture for this sprite
 */
function Sprite(texture)
{
    Container.call(this);

    /**
     * The anchor sets the origin point of the texture.
     * The default is 0,0 this means the texture's origin is the top left
     * Setting the anchor to 0.5,0.5 means the texture's origin is centered
     * Setting the anchor to 1,1 would mean the texture's origin point will be the bottom right corner
     *
     * @member {PIXI.Point}
     */
    this.anchor = new math.Point();

    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     * @private
     */
    this._texture = null;

    /**
     * The width of the sprite (this is initially set by the texture)
     *
     * @member {number}
     * @private
     */
    this._width = 0;

    /**
     * The height of the sprite (this is initially set by the texture)
     *
     * @member {number}
     * @private
     */
    this._height = 0;

    /**
     * The tint applied to the sprite. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    this.tint = 0xFFFFFF;

    /**
     * The blend mode to be applied to the sprite. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    this.blendMode = CONST.BLEND_MODES.NORMAL;

    /**
     * The shader that will be used to render the sprite. Set to null to remove a current shader.
     *
     * @member {PIXI.AbstractFilter|PIXI.Shader}
     */
    this.shader = null;

    /**
     * An internal cached value of the tint.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    this.cachedTint = 0xFFFFFF;

    // call texture setter
    this.texture = texture || Texture.EMPTY;
}

// constructor
Sprite.prototype = Object.create(Container.prototype);
Sprite.prototype.constructor = Sprite;
module.exports = Sprite;

Object.defineProperties(Sprite.prototype, {
    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Sprite#
     */
    width: {
        get: function ()
        {
            return Math.abs(this.scale.x) * this.texture._frame.width;
        },
        set: function (value)
        {
            var sign = utils.sign(this.scale.x) || 1;
            this.scale.x = sign * value / this.texture._frame.width;
            this._width = value;
        }
    },

    /**
     * The height of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Sprite#
     */
    height: {
        get: function ()
        {
            return  Math.abs(this.scale.y) * this.texture._frame.height;
        },
        set: function (value)
        {
            var sign = utils.sign(this.scale.y) || 1;
            this.scale.y = sign * value / this.texture._frame.height;
            this._height = value;
        }
    },

    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.Sprite#
     */
    texture: {
        get: function ()
        {
            return  this._texture;
        },
        set: function (value)
        {
            if (this._texture === value)
            {
                return;
            }

            this._texture = value;
            this.cachedTint = 0xFFFFFF;

            if (value)
            {
                // wait for the texture to load
                if (value.baseTexture.hasLoaded)
                {
                    this._onTextureUpdate();
                }
                else
                {
                    value.once('update', this._onTextureUpdate, this);
                }
            }
        }
    }
});

/**
 * When the texture is updated, this event will fire to update the scale and frame
 *
 * @private
 */
Sprite.prototype._onTextureUpdate = function ()
{
    // so if _width is 0 then width was not set..
    if (this._width)
    {
        this.scale.x = utils.sign(this.scale.x) * this._width / this.texture.frame.width;
    }

    if (this._height)
    {
        this.scale.y = utils.sign(this.scale.y) * this._height / this.texture.frame.height;
    }
};

/**
*
* Renders the object using the WebGL renderer
*
* @param renderer {PIXI.WebGLRenderer}
* @private
*/
Sprite.prototype._renderWebGL = function (renderer)
{
    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render(this);
};

/**
 * Returns the bounds of the Sprite as a rectangle. The bounds calculation takes the worldTransform into account.
 *
 * @param matrix {PIXI.Matrix} the transformation matrix of the sprite
 * @return {PIXI.Rectangle} the framing rectangle
 */
Sprite.prototype.getBounds = function (matrix)
{
    if(!this._currentBounds)
    {

        var width = this._texture._frame.width;
        var height = this._texture._frame.height;

        var w0 = width * (1-this.anchor.x);
        var w1 = width * -this.anchor.x;

        var h0 = height * (1-this.anchor.y);
        var h1 = height * -this.anchor.y;

        var worldTransform = matrix || this.worldTransform ;

        var a = worldTransform.a;
        var b = worldTransform.b;
        var c = worldTransform.c;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;

        var minX,
            maxX,
            minY,
            maxY;

        //TODO - I am SURE this can be optimised, but the below is not accurate enough..
        /*
        if (b === 0 && c === 0)
        {
            // scale may be negative!
            if (a < 0)
            {
                a *= -1;
            }

            if (d < 0)
            {
                d *= -1;
            }

            // this means there is no rotation going on right? RIGHT?
            // if thats the case then we can avoid checking the bound values! yay
            minX = a * w1 + tx;
            maxX = a * w0 + tx;
            minY = d * h1 + ty;
            maxY = d * h0 + ty;
        }
        else
        {
        */

        var x1 = a * w1 + c * h1 + tx;
        var y1 = d * h1 + b * w1 + ty;

        var x2 = a * w0 + c * h1 + tx;
        var y2 = d * h1 + b * w0 + ty;

        var x3 = a * w0 + c * h0 + tx;
        var y3 = d * h0 + b * w0 + ty;

        var x4 =  a * w1 + c * h0 + tx;
        var y4 =  d * h0 + b * w1 + ty;

        minX = x1;
        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;

        minY = y1;
        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;

        maxX = x1;
        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;

        maxY = y1;
        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;

        //}

        // check for children
        if(this.children.length)
        {
            var childBounds = this.containerGetBounds();

            w0 = childBounds.x;
            w1 = childBounds.x + childBounds.width;
            h0 = childBounds.y;
            h1 = childBounds.y + childBounds.height;

            minX = (minX < w0) ? minX : w0;
            minY = (minY < h0) ? minY : h0;

            maxX = (maxX > w1) ? maxX : w1;
            maxY = (maxY > h1) ? maxY : h1;
        }

        var bounds = this._bounds;

        bounds.x = minX;
        bounds.width = maxX - minX;

        bounds.y = minY;
        bounds.height = maxY - minY;

        // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
        this._currentBounds = bounds;
    }

    return this._currentBounds;
};

/**
 * Gets the local bounds of the sprite object.
 *
 */
Sprite.prototype.getLocalBounds = function ()
{
    this._bounds.x = -this._texture._frame.width * this.anchor.x;
    this._bounds.y = -this._texture._frame.height * this.anchor.y;
    this._bounds.width = this._texture._frame.width;
    this._bounds.height = this._texture._frame.height;
    return this._bounds;
};

/**
* Tests if a point is inside this sprite
*
* @param point {PIXI.Point} the point to test
* @return {boolean} the result of the test
*/
Sprite.prototype.containsPoint = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var width = this._texture._frame.width;
    var height = this._texture._frame.height;
    var x1 = -width * this.anchor.x;
    var y1;

    if ( tempPoint.x > x1 && tempPoint.x < x1 + width )
    {
        y1 = -height * this.anchor.y;

        if ( tempPoint.y > y1 && tempPoint.y < y1 + height )
        {
            return true;
        }
    }

    return false;
};

/**
* Renders the object using the Canvas renderer
*
* @param renderer {PIXI.CanvasRenderer} The renderer
* @private
*/
Sprite.prototype._renderCanvas = function (renderer)
{
    if (this.texture.crop.width <= 0 || this.texture.crop.height <= 0)
    {
        return;
    }

    var compositeOperation = renderer.blendModes[this.blendMode];
    if (compositeOperation !== renderer.context.globalCompositeOperation)
    {
        renderer.context.globalCompositeOperation = compositeOperation;
    }

    //  Ignore null sources
    if (this.texture.valid)
    {
        var texture = this._texture,
            wt = this.worldTransform,
            dx,
            dy,
            width = texture.crop.width,
            height = texture.crop.height;

        renderer.context.globalAlpha = this.worldAlpha;

        // If smoothingEnabled is supported and we need to change the smoothing property for this texture
        var smoothingEnabled = texture.baseTexture.scaleMode === CONST.SCALE_MODES.LINEAR;
        if (renderer.smoothProperty && renderer.context[renderer.smoothProperty] !== smoothingEnabled)
        {
            renderer.context[renderer.smoothProperty] = smoothingEnabled;
        }

        //inline GroupD8.isSwapWidthHeight
        if ((texture.rotate & 3) === 2) {
            width = texture.crop.height;
            height = texture.crop.width;
        }
        if (texture.trim) {
            dx = texture.crop.width/2 + texture.trim.x - this.anchor.x * texture.trim.width;
            dy = texture.crop.height/2 + texture.trim.y - this.anchor.y * texture.trim.height;
        } else {
            dx = (0.5 - this.anchor.x) * texture._frame.width;
            dy = (0.5 - this.anchor.y) * texture._frame.height;
        }
        if(texture.rotate) {
            wt.copy(canvasRenderWorldTransform);
            wt = canvasRenderWorldTransform;
            GroupD8.matrixAppendRotationInv(wt, texture.rotate, dx, dy);
            // the anchor has already been applied above, so lets set it to zero
            dx = 0;
            dy = 0;
        }
        dx -= width/2;
        dy -= height/2;
        // Allow for pixel rounding
        if (renderer.roundPixels)
        {
            renderer.context.setTransform(
                wt.a,
                wt.b,
                wt.c,
                wt.d,
                (wt.tx * renderer.resolution) | 0,
                (wt.ty * renderer.resolution) | 0
            );

            dx = dx | 0;
            dy = dy | 0;
        }
        else
        {

            renderer.context.setTransform(
                wt.a,
                wt.b,
                wt.c,
                wt.d,
                wt.tx * renderer.resolution,
                wt.ty * renderer.resolution
            );


        }

        var resolution = texture.baseTexture.resolution;

        if (this.tint !== 0xFFFFFF)
        {
            if (this.cachedTint !== this.tint)
            {
                this.cachedTint = this.tint;

                // TODO clean up caching - how to clean up the caches?
                this.tintedTexture = CanvasTinter.getTintedTexture(this, this.tint);
            }

            renderer.context.drawImage(
                this.tintedTexture,
                0,
                0,
                width * resolution,
                height * resolution,
                dx * renderer.resolution,
                dy * renderer.resolution,
                width * renderer.resolution,
                height * renderer.resolution
            );
        }
        else
        {
            renderer.context.drawImage(
                texture.baseTexture.source,
                texture.crop.x * resolution,
                texture.crop.y * resolution,
                width * resolution,
                height * resolution,
                dx  * renderer.resolution,
                dy  * renderer.resolution,
                width * renderer.resolution,
                height * renderer.resolution
            );
        }
    }
};

/**
 * Destroys this sprite and optionally its texture
 *
 * @param [destroyTexture=false] {boolean} Should it destroy the current texture of the sprite as well
 * @param [destroyBaseTexture=false] {boolean} Should it destroy the base texture of the sprite as well
 */
Sprite.prototype.destroy = function (destroyTexture, destroyBaseTexture)
{
    Container.prototype.destroy.call(this);

    this.anchor = null;

    if (destroyTexture)
    {
        this._texture.destroy(destroyBaseTexture);
    }

    this._texture = null;
    this.shader = null;
};

// some helper functions..

/**
 * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {string} The frame Id of the texture in the cache
 * @param [crossorigin=(auto)] {boolean} if you want to specify the cross-origin parameter
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} if you want to specify the scale mode, see {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the frameId
 */
Sprite.fromFrame = function (frameId)
{
    var texture = utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
    }

    return new Sprite(texture);
};

/**
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @static
 * @param imageId {string} The image url of the texture
 * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the image id
 */
Sprite.fromImage = function (imageId, crossorigin, scaleMode)
{
    return new Sprite(Texture.fromImage(imageId, crossorigin, scaleMode));
};

},{"../const":22,"../display/Container":23,"../math":33,"../renderers/canvas/utils/CanvasTinter":48,"../textures/Texture":72,"../utils":77}],68:[function(require,module,exports){
var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    CONST = require('../../const');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's SpriteRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/SpriteRenderer.java
 */

/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
 */
function SpriteRenderer(renderer)
{
    ObjectRenderer.call(this, renderer);

    /**
     * Number of values sent in the vertex buffer.
     * positionX, positionY, colorR, colorG, colorB = 5
     *
     * @member {number}
     */
    this.vertSize = 5;

    /**
     * The size of the vertex information in bytes.
     *
     * @member {number}
     */
    this.vertByteSize = this.vertSize * 4;

    /**
     * The number of images in the SpriteBatch before it flushes.
     *
     * @member {number}
     */
    this.size = CONST.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop

    // the total number of bytes in our batch
    var numVerts = (this.size * 4) * this.vertByteSize;

    // the total number of indices in our batch, there are 6 points per quad.
    var numIndices = this.size * 6;

    /**
     * Holds the vertex data that will be sent to the vertex shader.
     *
     * @member {ArrayBuffer}
     */
    this.vertices = new ArrayBuffer(numVerts);

    /**
     * View on the vertices as a Float32Array for positions
     *
     * @member {Float32Array}
     */
    this.positions = new Float32Array(this.vertices);

    /**
     * View on the vertices as a Uint32Array for colors
     *
     * @member {Uint32Array}
     */
    this.colors = new Uint32Array(this.vertices);

    /**
     * Holds the indices of the geometry (quads) to draw
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array(numIndices);

    // fill the indices with the quads to draw
    for (var i=0, j=0; i < numIndices; i += 6, j += 4)
    {
        this.indices[i + 0] = j + 0;
        this.indices[i + 1] = j + 1;
        this.indices[i + 2] = j + 2;
        this.indices[i + 3] = j + 0;
        this.indices[i + 4] = j + 2;
        this.indices[i + 5] = j + 3;
    }

    /**
     * The current size of the batch, each render() call adds to this number.
     *
     * @member {number}
     */
    this.currentBatchSize = 0;

    /**
     * The current sprites in the batch.
     *
     * @member {PIXI.Sprite[]}
     */
    this.sprites = [];

    /**
     * The default shader that is used if a sprite doesn't have a more specific one.
     *
     * @member {PIXI.Shader}
     */
    this.shader = null;
}

SpriteRenderer.prototype = Object.create(ObjectRenderer.prototype);
SpriteRenderer.prototype.constructor = SpriteRenderer;
module.exports = SpriteRenderer;

WebGLRenderer.registerPlugin('sprite', SpriteRenderer);

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 */
SpriteRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;

    // setup default shader
    this.shader = this.renderer.shaderManager.defaultShader;

    // create a couple of buffers
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    //upload the index data
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

    this.currentBlendMode = 99999;
};

/**
 * Renders the sprite object.
 *
 * @param sprite {PIXI.Sprite} the sprite to render when using this spritebatch
 */
SpriteRenderer.prototype.render = function (sprite)
{
    var texture = sprite._texture;

    //TODO set blend modes..
    // check texture..
    if (this.currentBatchSize >= this.size)
    {
        this.flush();
    }

    // get the uvs for the texture
    var uvs = texture._uvs;

    // if the uvs have not updated then no point rendering just yet!
    if (!uvs)
    {
        return;
    }

    // TODO trim??
    var aX = sprite.anchor.x;
    var aY = sprite.anchor.y;

    var w0, w1, h0, h1;

    if (texture.trim && sprite.tileScale === undefined)
    {
        // if the sprite is trimmed and is not a tilingsprite then we need to add the extra space before transforming the sprite coords..
        var trim = texture.trim;

        w1 = trim.x - aX * trim.width;
        w0 = w1 + texture.crop.width;

        h1 = trim.y - aY * trim.height;
        h0 = h1 + texture.crop.height;

    }
    else
    {
        w0 = (texture._frame.width ) * (1-aX);
        w1 = (texture._frame.width ) * -aX;

        h0 = texture._frame.height * (1-aY);
        h1 = texture._frame.height * -aY;
    }

    var index = this.currentBatchSize * this.vertByteSize;

    var worldTransform = sprite.worldTransform;

    var a = worldTransform.a;
    var b = worldTransform.b;
    var c = worldTransform.c;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;

    var colors = this.colors;
    var positions = this.positions;

    if (this.renderer.roundPixels)
    {
        var resolution = this.renderer.resolution;

        // xy
        positions[index] = (((a * w1 + c * h1 + tx) * resolution) | 0) / resolution;
        positions[index+1] = (((d * h1 + b * w1 + ty) * resolution) | 0) / resolution;

        // xy
        positions[index+5] = (((a * w0 + c * h1 + tx) * resolution) | 0) / resolution;
        positions[index+6] = (((d * h1 + b * w0 + ty) * resolution) | 0) / resolution;

         // xy
        positions[index+10] = (((a * w0 + c * h0 + tx) * resolution) | 0) / resolution;
        positions[index+11] = (((d * h0 + b * w0 + ty) * resolution) | 0) / resolution;

        // xy
        positions[index+15] = (((a * w1 + c * h0 + tx) * resolution) | 0) / resolution;
        positions[index+16] = (((d * h0 + b * w1 + ty) * resolution) | 0) / resolution;
    }
    else
    {

        // xy
        positions[index] = a * w1 + c * h1 + tx;
        positions[index+1] = d * h1 + b * w1 + ty;

        // xy
        positions[index+5] = a * w0 + c * h1 + tx;
        positions[index+6] = d * h1 + b * w0 + ty;

         // xy
        positions[index+10] = a * w0 + c * h0 + tx;
        positions[index+11] = d * h0 + b * w0 + ty;

        // xy
        positions[index+15] = a * w1 + c * h0 + tx;
        positions[index+16] = d * h0 + b * w1 + ty;
    }

    // uv
    positions[index+2] = uvs.x0;
    positions[index+3] = uvs.y0;

    // uv
    positions[index+7] = uvs.x1;
    positions[index+8] = uvs.y1;

     // uv
    positions[index+12] = uvs.x2;
    positions[index+13] = uvs.y2;

    // uv
    positions[index+17] = uvs.x3;
    positions[index+18] = uvs.y3;

    // color and alpha
    var tint = sprite.tint;
    colors[index+4] = colors[index+9] = colors[index+14] = colors[index+19] = (tint >> 16) + (tint & 0xff00) + ((tint & 0xff) << 16) + (sprite.worldAlpha * 255 << 24);

    // increment the batchsize
    this.sprites[this.currentBatchSize++] = sprite;
};

/**
 * Renders the content and empties the current batch.
 *
 */
SpriteRenderer.prototype.flush = function ()
{
    // If the batch is length 0 then return as there is nothing to draw
    if (this.currentBatchSize === 0)
    {
        return;
    }

    var gl = this.renderer.gl;
    var shader;

    // upload the verts to the buffer
    if (this.currentBatchSize > ( this.size * 0.5 ) )
    {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
    }
    else
    {
        var view = this.positions.subarray(0, this.currentBatchSize * this.vertByteSize);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
    }

    var nextTexture, nextBlendMode, nextShader;
    var batchSize = 0;
    var start = 0;

    var currentBaseTexture = null;
    var currentBlendMode = this.renderer.blendModeManager.currentBlendMode;
    var currentShader = null;

    var blendSwap = false;
    var shaderSwap = false;
    var sprite;

    for (var i = 0, j = this.currentBatchSize; i < j; i++)
    {

        sprite = this.sprites[i];

        nextTexture = sprite._texture.baseTexture;
        nextBlendMode = sprite.blendMode;
        nextShader = sprite.shader || this.shader;

        blendSwap = currentBlendMode !== nextBlendMode;
        shaderSwap = currentShader !== nextShader; // should I use uidS???

        if (currentBaseTexture !== nextTexture || blendSwap || shaderSwap)
        {
            this.renderBatch(currentBaseTexture, batchSize, start);

            start = i;
            batchSize = 0;
            currentBaseTexture = nextTexture;

            if (blendSwap)
            {
                currentBlendMode = nextBlendMode;
                this.renderer.blendModeManager.setBlendMode( currentBlendMode );
            }

            if (shaderSwap)
            {
                currentShader = nextShader;



                shader = currentShader.shaders ? currentShader.shaders[gl.id] : currentShader;

                if (!shader)
                {
                    shader = currentShader.getShader(this.renderer);

                }

                // set shader function???
                this.renderer.shaderManager.setShader(shader);

                //TODO - i KNOW this can be optimised! Once v3 is stable il look at this next...
                shader.uniforms.projectionMatrix.value = this.renderer.currentRenderTarget.projectionMatrix.toArray(true);
                //Make this a little more dynamic / intelligent!
                shader.syncUniforms();

                //TODO investigate some kind of texture state managment??
                // need to make sure this texture is the active one for all the batch swaps..
                gl.activeTexture(gl.TEXTURE0);

                // both thease only need to be set if they are changing..
                // set the projection
                //gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, this.renderer.currentRenderTarget.projectionMatrix.toArray(true));


            }
        }

        batchSize++;
    }

    this.renderBatch(currentBaseTexture, batchSize, start);

    // then reset the batch!
    this.currentBatchSize = 0;
};

/**
 * Draws the currently batches sprites.
 *
 * @private
 * @param texture {PIXI.Texture}
 * @param size {number}
 * @param startIndex {number}
 */
SpriteRenderer.prototype.renderBatch = function (texture, size, startIndex)
{
    if (size === 0)
    {
        return;
    }

    var gl = this.renderer.gl;

    if (!texture._glTextures[gl.id])
    {
        this.renderer.updateTexture(texture);
    }
    else
    {
        // bind the current texture
        gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
    }

    // now draw those suckas!
    gl.drawElements(gl.TRIANGLES, size * 6, gl.UNSIGNED_SHORT, startIndex * 6 * 2);

    // increment the draw count
    this.renderer.drawCount++;
};

/**
 * Starts a new sprite batch.
 *
 */
SpriteRenderer.prototype.start = function ()
{
    var gl = this.renderer.gl;

    // bind the main texture


    // bind the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // this is the same for each shader?
    var stride =  this.vertByteSize;
    gl.vertexAttribPointer(this.shader.attributes.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(this.shader.attributes.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * 4);

    // color attributes will be interpreted as unsigned bytes and normalized
    gl.vertexAttribPointer(this.shader.attributes.aColor, 4, gl.UNSIGNED_BYTE, true, stride, 4 * 4);
};

/**
 * Destroys the SpriteBatch.
 *
 */
SpriteRenderer.prototype.destroy = function ()
{
    this.renderer.gl.deleteBuffer(this.vertexBuffer);
    this.renderer.gl.deleteBuffer(this.indexBuffer);

    ObjectRenderer.prototype.destroy.call(this);

    this.shader.destroy();

    this.renderer = null;

    this.vertices = null;
    this.positions = null;
    this.colors = null;
    this.indices = null;

    this.vertexBuffer = null;
    this.indexBuffer = null;

    this.sprites = null;
    this.shader = null;
};

},{"../../const":22,"../../renderers/webgl/WebGLRenderer":49,"../../renderers/webgl/utils/ObjectRenderer":63}],69:[function(require,module,exports){
var Sprite = require('../sprites/Sprite'),
    Texture = require('../textures/Texture'),
    math = require('../math'),
    utils = require('../utils'),
    CONST = require('../const');

/**
 * A Text Object will create a line or multiple lines of text. To split a line you can use '\n' in your text string,
 * or add a wordWrap property set to true and and wordWrapWidth property with a value in the style object.
 *
 * A Text can be created directly from a string and a style object
 *
 * ```js
 * var text = new PIXI.Text('This is a pixi text',{font : '24px Arial', fill : 0xff1010, align : 'center'});
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 * @param text {string} The copy that you would like the text to display
 * @param [style] {object} The style parameters
 * @param [style.font] {string} default 'bold 20px Arial' The style and size of the font
 * @param [style.fill='black'] {String|Number} A canvas fillstyle that will be used on the text e.g 'red', '#00FF00'
 * @param [style.align='left'] {string} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
 * @param [style.stroke] {String|Number} A canvas fillstyle that will be used on the text stroke e.g 'blue', '#FCFF00'
 * @param [style.strokeThickness=0] {number} A number that represents the thickness of the stroke. Default is 0 (no stroke)
 * @param [style.wordWrap=false] {boolean} Indicates if word wrap should be used
 * @param [style.wordWrapWidth=100] {number} The width at which text will wrap, it needs wordWrap to be set to true
 * @param [style.lineHeight] {number} The line height, a number that represents the vertical space that a letter uses
 * @param [style.dropShadow=false] {boolean} Set a drop shadow for the text
 * @param [style.dropShadowColor='#000000'] {string} A fill style to be used on the dropshadow e.g 'red', '#00FF00'
 * @param [style.dropShadowAngle=Math.PI/4] {number} Set a angle of the drop shadow
 * @param [style.dropShadowDistance=5] {number} Set a distance of the drop shadow
 * @param [style.dropShadowBlur=0] {number} Set a shadow blur radius
 * @param [style.padding=0] {number} Occasionally some fonts are cropped on top or bottom. Adding some padding will
 *      prevent this from happening by adding padding to the top and bottom of text height.
 * @param [style.textBaseline='alphabetic'] {string} The baseline of the text that is rendered.
 * @param [style.lineJoin='miter'] {string} The lineJoin property sets the type of corner created, it can resolve
 *      spiked text issues. Default is 'miter' (creates a sharp corner).
 * @param [style.miterLimit=10] {number} The miter limit to use when using the 'miter' lineJoin mode. This can reduce
 *      or increase the spikiness of rendered text.
 */
function Text(text, style, resolution)
{
    /**
     * The canvas element that everything is drawn to
     *
     * @member {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas');

    /**
     * The canvas 2d context that everything is drawn with
     * @member {HTMLCanvasElement}
     */
    this.context = this.canvas.getContext('2d');

    /**
     * The resolution of the canvas.
     * @member {number}
     */
    this.resolution = resolution || CONST.RESOLUTION;

    /**
     * Private tracker for the current text.
     *
     * @member {string}
     * @private
     */
    this._text = null;

    /**
     * Private tracker for the current style.
     *
     * @member {object}
     * @private
     */
    this._style = null;

    var texture = Texture.fromCanvas(this.canvas);
    texture.trim = new math.Rectangle();
    Sprite.call(this, texture);

    this.text = text;
    this.style = style;
}

// constructor
Text.prototype = Object.create(Sprite.prototype);
Text.prototype.constructor = Text;
module.exports = Text;

Text.fontPropertiesCache = {};
Text.fontPropertiesCanvas = document.createElement('canvas');
Text.fontPropertiesContext = Text.fontPropertiesCanvas.getContext('2d');

Object.defineProperties(Text.prototype, {
    /**
     * The width of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Text#
     */
    width: {
        get: function ()
        {
            if (this.dirty)
            {
                this.updateText();
            }

            return this.scale.x * this._texture._frame.width;
        },
        set: function (value)
        {
            this.scale.x = value / this._texture._frame.width;
            this._width = value;
        }
    },

    /**
     * The height of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Text#
     */
    height: {
        get: function ()
        {
            if (this.dirty)
            {
                this.updateText();
            }

            return  this.scale.y * this._texture._frame.height;
        },
        set: function (value)
        {
            this.scale.y = value / this._texture._frame.height;
            this._height = value;
        }
    },

    /**
     * Set the style of the text
     *
     * @param [style] {object} The style parameters
     * @param [style.font='bold 20pt Arial'] {string} The style and size of the font
     * @param [style.fill='black'] {string|number} A canvas fillstyle that will be used on the text eg 'red', '#00FF00'
     * @param [style.align='left'] {string} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
     * @param [style.stroke='black'] {string|number} A canvas fillstyle that will be used on the text stroke eg 'blue', '#FCFF00'
     * @param [style.strokeThickness=0] {number} A number that represents the thickness of the stroke. Default is 0 (no stroke)
     * @param [style.wordWrap=false] {boolean} Indicates if word wrap should be used
     * @param [style.wordWrapWidth=100] {number} The width at which text will wrap
     * @param [style.lineHeight] {number} The line height, a number that represents the vertical space that a letter uses
     * @param [style.dropShadow=false] {boolean} Set a drop shadow for the text
     * @param [style.dropShadowColor='#000000'] {string|number} A fill style to be used on the dropshadow e.g 'red', '#00FF00'
     * @param [style.dropShadowAngle=Math.PI/6] {number} Set a angle of the drop shadow
     * @param [style.dropShadowDistance=5] {number} Set a distance of the drop shadow
     * @param [style.dropShadowBlur=0] {number} Set a shadow blur radius
     * @param [style.padding=0] {number} Occasionally some fonts are cropped on top or bottom. Adding some padding will
     *      prevent this from happening by adding padding to the top and bottom of text height.
     * @param [style.textBaseline='alphabetic'] {string} The baseline of the text that is rendered.
     * @param [style.lineJoin='miter'] {string} The lineJoin property sets the type of corner created, it can resolve
     *      spiked text issues. Default is 'miter' (creates a sharp corner).
     * @param [style.miterLimit=10] {number} The miter limit to use when using the 'miter' lineJoin mode. This can reduce
     *      or increase the spikiness of rendered text.
     * @memberof PIXI.Text#
     */
    style: {
        get: function ()
        {
            return this._style;
        },
        set: function (style)
        {
            style = style || {};

            if (typeof style.fill === 'number') {
                style.fill = utils.hex2string(style.fill);
            }

            if (typeof style.stroke === 'number') {
                style.stroke = utils.hex2string(style.stroke);
            }

            if (typeof style.dropShadowColor === 'number') {
                style.dropShadowColor = utils.hex2string(style.dropShadowColor);
            }

            style.font = style.font || 'bold 20pt Arial';
            style.fill = style.fill || 'black';
            style.align = style.align || 'left';
            style.stroke = style.stroke || 'black'; //provide a default, see: https://github.com/pixijs/pixi.js/issues/136
            style.strokeThickness = style.strokeThickness || 0;
            style.wordWrap = style.wordWrap || false;
            style.wordWrapWidth = style.wordWrapWidth || 100;

            style.dropShadow = style.dropShadow || false;
            style.dropShadowColor = style.dropShadowColor || '#000000';
            style.dropShadowAngle = style.dropShadowAngle !== undefined ? style.dropShadowAngle : Math.PI / 6;
            style.dropShadowDistance = style.dropShadowDistance !== undefined ? style.dropShadowDistance : 5;
            style.dropShadowBlur = style.dropShadowBlur !== undefined ? style.dropShadowBlur : 0; //shadowBlur is '0' by default according to HTML

            style.padding = style.padding || 0;

            style.textBaseline = style.textBaseline || 'alphabetic';

            style.lineJoin = style.lineJoin || 'miter';
            style.miterLimit = style.miterLimit || 10;

            this._style = style;
            this.dirty = true;
        }
    },

    /**
     * Set the copy for the text object. To split a line you can use '\n'.
     *
     * @param text {string} The copy that you would like the text to display
     * @memberof PIXI.Text#
     */
    text: {
        get: function()
        {
            return this._text;
        },
        set: function (text){
            text = text.toString() || ' ';
            if (this._text === text)
            {
                return;
            }
            this._text = text;
            this.dirty = true;
        }
    }
});

/**
 * Renders text and updates it when needed
 *
 * @private
 */
Text.prototype.updateText = function ()
{
    var style = this._style;
    this.context.font = style.font;

    // word wrap
    // preserve original text
    var outputText = style.wordWrap ? this.wordWrap(this._text) : this._text;

    // split text into lines
    var lines = outputText.split(/(?:\r\n|\r|\n)/);

    // calculate text width
    var lineWidths = new Array(lines.length);
    var maxLineWidth = 0;
    var fontProperties = this.determineFontProperties(style.font);
    for (var i = 0; i < lines.length; i++)
    {
        var lineWidth = this.context.measureText(lines[i]).width;
        lineWidths[i] = lineWidth;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }

    var width = maxLineWidth + style.strokeThickness;
    if (style.dropShadow)
    {
        width += style.dropShadowDistance;
    }

    this.canvas.width = ( width + this.context.lineWidth ) * this.resolution;

    // calculate text height
    var lineHeight = this.style.lineHeight || fontProperties.fontSize + style.strokeThickness;

    var height = lineHeight * lines.length;
    if (style.dropShadow)
    {
        height += style.dropShadowDistance;
    }

    this.canvas.height = ( height + this._style.padding * 2 ) * this.resolution;

    this.context.scale( this.resolution, this.resolution);

    if (navigator.isCocoonJS)
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    }

    //this.context.fillStyle="#FF0000";
    //this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.font = style.font;
    this.context.strokeStyle = style.stroke;
    this.context.lineWidth = style.strokeThickness;
    this.context.textBaseline = style.textBaseline;
    this.context.lineJoin = style.lineJoin;
    this.context.miterLimit = style.miterLimit;

    var linePositionX;
    var linePositionY;

    if (style.dropShadow)
    {
        if (style.dropShadowBlur > 0) {
            this.context.shadowColor = style.dropShadowColor;
            this.context.shadowBlur = style.dropShadowBlur;
        } else {
            this.context.fillStyle = style.dropShadowColor;
        }

        var xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        var yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;

        for (i = 0; i < lines.length; i++)
        {
            linePositionX = style.strokeThickness / 2;
            linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

            if (style.align === 'right')
            {
                linePositionX += maxLineWidth - lineWidths[i];
            }
            else if (style.align === 'center')
            {
                linePositionX += (maxLineWidth - lineWidths[i]) / 2;
            }

            if (style.fill)
            {
                this.context.fillText(lines[i], linePositionX + xShadowOffset, linePositionY + yShadowOffset + this._style.padding);
            }
        }
    }

    //set canvas text styles
    this.context.fillStyle = style.fill;

    //draw lines line by line
    for (i = 0; i < lines.length; i++)
    {
        linePositionX = style.strokeThickness / 2;
        linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

        if (style.align === 'right')
        {
            linePositionX += maxLineWidth - lineWidths[i];
        }
        else if (style.align === 'center')
        {
            linePositionX += (maxLineWidth - lineWidths[i]) / 2;
        }

        if (style.stroke && style.strokeThickness)
        {
            this.context.strokeText(lines[i], linePositionX, linePositionY + this._style.padding);
        }

        if (style.fill)
        {
            this.context.fillText(lines[i], linePositionX, linePositionY + this._style.padding);
        }
    }

    this.updateTexture();
};

/**
 * Updates texture size based on canvas size
 *
 * @private
 */
Text.prototype.updateTexture = function ()
{
    var texture = this._texture;

    texture.baseTexture.hasLoaded = true;
    texture.baseTexture.resolution = this.resolution;

    texture.baseTexture.width = this.canvas.width / this.resolution;
    texture.baseTexture.height = this.canvas.height / this.resolution;
    texture.crop.width = texture._frame.width = this.canvas.width / this.resolution;
    texture.crop.height = texture._frame.height = this.canvas.height / this.resolution;

    texture.trim.x = 0;
    texture.trim.y = -this._style.padding;

    texture.trim.width = texture._frame.width;
    texture.trim.height = texture._frame.height - this._style.padding*2;

    this._width = this.canvas.width / this.resolution;
    this._height = this.canvas.height / this.resolution;

    texture.baseTexture.emit('update',  texture.baseTexture);

    this.dirty = false;
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer}
 */
Text.prototype.renderWebGL = function (renderer)
{
    if (this.dirty)
    {
        //this.resolution = 1//renderer.resolution;

        this.updateText();
    }

    Sprite.prototype.renderWebGL.call(this, renderer);
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer}
 * @private
 */
Text.prototype._renderCanvas = function (renderer)
{
    if (this.dirty)
    {
     //   this.resolution = 1//renderer.resolution;

        this.updateText();
    }

    Sprite.prototype._renderCanvas.call(this, renderer);
};

/**
 * Calculates the ascent, descent and fontSize of a given fontStyle
 *
 * @param fontStyle {object}
 * @private
 */
Text.prototype.determineFontProperties = function (fontStyle)
{
    var properties = Text.fontPropertiesCache[fontStyle];

    if (!properties)
    {
        properties = {};

        var canvas = Text.fontPropertiesCanvas;
        var context = Text.fontPropertiesContext;

        context.font = fontStyle;

        var width = Math.ceil(context.measureText('|MÉq').width);
        var baseline = Math.ceil(context.measureText('M').width);
        var height = 2 * baseline;

        baseline = baseline * 1.4 | 0;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);

        context.font = fontStyle;

        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText('|MÉq', 0, baseline);

        var imagedata = context.getImageData(0, 0, width, height).data;
        var pixels = imagedata.length;
        var line = width * 4;

        var i, j;

        var idx = 0;
        var stop = false;

        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; i++)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }
            if (!stop)
            {
                idx += line;
            }
            else
            {
                break;
            }
        }

        properties.ascent = baseline - i;

        idx = pixels - line;
        stop = false;

        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; i--)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }
            if (!stop)
            {
                idx -= line;
            }
            else
            {
                break;
            }
        }

        properties.descent = i - baseline;
        properties.fontSize = properties.ascent + properties.descent;

        Text.fontPropertiesCache[fontStyle] = properties;
    }

    return properties;
};

/**
 * Applies newlines to a string to have it optimally fit into the horizontal
 * bounds set by the Text object's wordWrapWidth property.
 *
 * @param text {string}
 * @private
 */
Text.prototype.wordWrap = function (text)
{
    // Greedy wrapping algorithm that will wrap words as the line grows longer
    // than its horizontal bounds.
    var result = '';
    var lines = text.split('\n');
    var wordWrapWidth = this._style.wordWrapWidth;
    for (var i = 0; i < lines.length; i++)
    {
        var spaceLeft = wordWrapWidth;
        var words = lines[i].split(' ');
        for (var j = 0; j < words.length; j++)
        {
            var wordWidth = this.context.measureText(words[j]).width;
            var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
            if (j === 0 || wordWidthWithSpace > spaceLeft)
            {
                // Skip printing the newline if it's the first word of the line that is
                // greater than the word wrap width.
                if (j > 0)
                {
                    result += '\n';
                }
                result += words[j];
                spaceLeft = wordWrapWidth - wordWidth;
            }
            else
            {
                spaceLeft -= wordWidthWithSpace;
                result += ' ' + words[j];
            }
        }

        if (i < lines.length-1)
        {
            result += '\n';
        }
    }
    return result;
};

/**
 * Returns the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account.
 *
 * @param matrix {PIXI.Matrix} the transformation matrix of the Text
 * @return {PIXI.Rectangle} the framing rectangle
 */
Text.prototype.getBounds = function (matrix)
{
    if (this.dirty)
    {
        this.updateText();
    }

    return Sprite.prototype.getBounds.call(this, matrix);
};

/**
 * Destroys this text object.
 *
 * @param [destroyBaseTexture=true] {boolean} whether to destroy the base texture as well
 */
Text.prototype.destroy = function (destroyBaseTexture)
{
    // make sure to reset the the context and canvas.. dont want this hanging around in memory!
    this.context = null;
    this.canvas = null;

    this._style = null;

    this._texture.destroy(destroyBaseTexture === undefined ? true : destroyBaseTexture);
};

},{"../const":22,"../math":33,"../sprites/Sprite":67,"../textures/Texture":72,"../utils":77}],70:[function(require,module,exports){
var utils = require('../utils'),
    CONST = require('../const'),
    EventEmitter = require('eventemitter3');

/**
 * A texture stores the information that represents an image. All textures have a base texture.
 *
 * @class
 * @memberof PIXI
 * @param source {Image|Canvas} the source object of the texture.
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param resolution {number} the resolution of the texture for devices with different pixel ratios
 */
function BaseTexture(source, scaleMode, resolution)
{
    EventEmitter.call(this);

    this.uid = utils.uid();

    /**
     * The Resolution of the texture.
     *
     * @member {number}
     */
    this.resolution = resolution || 1;

    /**
     * The width of the base texture set when the image has loaded
     *
     * @member {number}
     * @readOnly
     */
    this.width = 100;

    /**
     * The height of the base texture set when the image has loaded
     *
     * @member {number}
     * @readOnly
     */
    this.height = 100;

    // TODO docs
    // used to store the actual dimensions of the source
    /**
     * Used to store the actual width of the source of this texture
     *
     * @member {number}
     * @readOnly
     */
    this.realWidth = 100;
    /**
     * Used to store the actual height of the source of this texture
     *
     * @member {number}
     * @readOnly
     */
    this.realHeight = 100;

    /**
     * The scale mode to apply when scaling this texture
     *
     * @member {number}
     * @default PIXI.SCALE_MODES.LINEAR
     * @see PIXI.SCALE_MODES
     */
    this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;

    /**
     * Set to true once the base texture has successfully loaded.
     *
     * This is never true if the underlying source fails to load or has no texture data.
     *
     * @member {boolean}
     * @readOnly
     */
    this.hasLoaded = false;

    /**
     * Set to true if the source is currently loading.
     *
     * If an Image source is loading the 'loaded' or 'error' event will be
     * dispatched when the operation ends. An underyling source that is
     * immediately-available bypasses loading entirely.
     *
     * @member {boolean}
     * @readonly
     */
    this.isLoading = false;

    /**
     * The image source that is used to create the texture.
     *
     * TODO: Make this a setter that calls loadSource();
     *
     * @member {Image|Canvas}
     * @readonly
     */
    this.source = null; // set in loadSource, if at all

    /**
     * Controls if RGB channels should be pre-multiplied by Alpha  (WebGL only)
     * All blend modes, and shaders written for default value. Change it on your own risk.
     *
     * @member {boolean}
     * @default true
     */
    this.premultipliedAlpha = true;

    /**
     * @member {string}
     */
    this.imageUrl = null;

    /**
     * Wether or not the texture is a power of two, try to use power of two textures as much as you can
     * @member {boolean}
     * @private
     */
    this.isPowerOfTwo = false;

    // used for webGL

    /**
     *
     * Set this to true if a mipmap of this texture needs to be generated. This value needs to be set before the texture is used
     * Also the texture must be a power of two size to work
     *
     * @member {boolean}
     */
    this.mipmap = false;

    /**
     * A map of renderer IDs to webgl textures
     *
     * @member {object<number, WebGLTexture>}
     * @private
     */
    this._glTextures = {};

    // if no source passed don't try to load
    if (source)
    {
        this.loadSource(source);
    }

    /**
     * Fired when a not-immediately-available source finishes loading.
     *
     * @event loaded
     * @memberof PIXI.BaseTexture#
     * @protected
     */

    /**
     * Fired when a not-immediately-available source fails to load.
     *
     * @event error
     * @memberof PIXI.BaseTexture#
     * @protected
     */
}

BaseTexture.prototype = Object.create(EventEmitter.prototype);
BaseTexture.prototype.constructor = BaseTexture;
module.exports = BaseTexture;

/**
 * Updates the texture on all the webgl renderers, this also assumes the src has changed.
 *
 * @fires update
 */
BaseTexture.prototype.update = function ()
{
    this.realWidth = this.source.naturalWidth || this.source.width;
    this.realHeight = this.source.naturalHeight || this.source.height;

    this.width = this.realWidth / this.resolution;
    this.height = this.realHeight / this.resolution;

    this.isPowerOfTwo = utils.isPowerOfTwo(this.realWidth, this.realHeight);

    this.emit('update', this);
};

/**
 * Load a source.
 *
 * If the source is not-immediately-available, such as an image that needs to be
 * downloaded, then the 'loaded' or 'error' event will be dispatched in the future
 * and `hasLoaded` will remain false after this call.
 *
 * The logic state after calling `loadSource` directly or indirectly (eg. `fromImage`, `new BaseTexture`) is:
 *
 *     if (texture.hasLoaded)
 {
 *        // texture ready for use
 *     } else if (texture.isLoading)
 {
 *        // listen to 'loaded' and/or 'error' events on texture
 *     } else {
 *        // not loading, not going to load UNLESS the source is reloaded
 *        // (it may still make sense to listen to the events)
 *     }
 *
 * @protected
 * @param source {Image|Canvas} the source object of the texture.
 */
BaseTexture.prototype.loadSource = function (source)
{
    var wasLoading = this.isLoading;
    this.hasLoaded = false;
    this.isLoading = false;

    if (wasLoading && this.source)
    {
        this.source.onload = null;
        this.source.onerror = null;
    }

    this.source = source;

    // Apply source if loaded. Otherwise setup appropriate loading monitors.
    if ((this.source.complete || this.source.getContext) && this.source.width && this.source.height)
    {
        this._sourceLoaded();
    }
    else if (!source.getContext)
    {

        // Image fail / not ready
        this.isLoading = true;

        var scope = this;

        source.onload = function ()
        {
            source.onload = null;
            source.onerror = null;

            if (!scope.isLoading)
            {
                return;
            }

            scope.isLoading = false;
            scope._sourceLoaded();

            scope.emit('loaded', scope);
        };

        source.onerror = function ()
        {
            source.onload = null;
            source.onerror = null;

            if (!scope.isLoading)
            {
                return;
            }

            scope.isLoading = false;
            scope.emit('error', scope);
        };

        // Per http://www.w3.org/TR/html5/embedded-content-0.html#the-img-element
        //   "The value of `complete` can thus change while a script is executing."
        // So complete needs to be re-checked after the callbacks have been added..
        // NOTE: complete will be true if the image has no src so best to check if the src is set.
        if (source.complete && source.src)
        {
            this.isLoading = false;

            // ..and if we're complete now, no need for callbacks
            source.onload = null;
            source.onerror = null;

            if (source.width && source.height)
            {
                this._sourceLoaded();

                // If any previous subscribers possible
                if (wasLoading)
                {
                    this.emit('loaded', this);
                }
            }
            else
            {
                // If any previous subscribers possible
                if (wasLoading)
                {
                    this.emit('error', this);
                }
            }
        }
    }
};

/**
 * Used internally to update the width, height, and some other tracking vars once
 * a source has successfully loaded.
 *
 * @private
 */
BaseTexture.prototype._sourceLoaded = function ()
{
    this.hasLoaded = true;
    this.update();
};

/**
 * Destroys this base texture
 *
 */
BaseTexture.prototype.destroy = function ()
{
    if (this.imageUrl)
    {
        delete utils.BaseTextureCache[this.imageUrl];
        delete utils.TextureCache[this.imageUrl];

        this.imageUrl = null;

        if (!navigator.isCocoonJS)
        {
            this.source.src = '';
        }
    }
    else if (this.source && this.source._pixiId)
    {
        delete utils.BaseTextureCache[this.source._pixiId];
    }

    this.source = null;

    this.dispose();
};

/**
 * Frees the texture from WebGL memory without destroying this texture object.
 * This means you can still use the texture later which will upload it to GPU
 * memory again.
 *
 */
BaseTexture.prototype.dispose = function ()
{
    this.emit('dispose', this);

    // this should no longer be needed, the renderers should cleanup all the gl textures.
    // this._glTextures = {};
};

/**
 * Changes the source image of the texture.
 * The original source must be an Image element.
 *
 * @param newSrc {string} the path of the image
 */
BaseTexture.prototype.updateSourceImage = function (newSrc)
{
    this.source.src = newSrc;

    this.loadSource(this.source);
};

/**
 * Helper function that creates a base texture from the given image url.
 * If the image is not in the base texture cache it will be created and loaded.
 *
 * @static
 * @param imageUrl {string} The image url of the texture
 * @param [crossorigin=(auto)] {boolean} Should use anonymous CORS? Defaults to true if the URL is not a data-URI.
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return PIXI.BaseTexture
 */
BaseTexture.fromImage = function (imageUrl, crossorigin, scaleMode)
{
    var baseTexture = utils.BaseTextureCache[imageUrl];

    if (crossorigin === undefined && imageUrl.indexOf('data:') !== 0)
    {
        crossorigin = true;
    }

    if (!baseTexture)
    {
        // new Image() breaks tex loading in some versions of Chrome.
        // See https://code.google.com/p/chromium/issues/detail?id=238071
        var image = new Image();//document.createElement('img');
        if (crossorigin)
        {
            image.crossOrigin = '';
        }

        baseTexture = new BaseTexture(image, scaleMode);
        baseTexture.imageUrl = imageUrl;

        image.src = imageUrl;

        utils.BaseTextureCache[imageUrl] = baseTexture;

        // if there is an @2x at the end of the url we are going to assume its a highres image
        baseTexture.resolution = utils.getResolutionOfUrl(imageUrl);
    }

    return baseTexture;
};

/**
 * Helper function that creates a base texture from the given canvas element.
 *
 * @static
 * @param canvas {Canvas} The canvas element source of the texture
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return PIXI.BaseTexture
 */
BaseTexture.fromCanvas = function (canvas, scaleMode)
{
    if (!canvas._pixiId)
    {
        canvas._pixiId = 'canvas_' + utils.uid();
    }

    var baseTexture = utils.BaseTextureCache[canvas._pixiId];

    if (!baseTexture)
    {
        baseTexture = new BaseTexture(canvas, scaleMode);
        utils.BaseTextureCache[canvas._pixiId] = baseTexture;
    }

    return baseTexture;
};

},{"../const":22,"../utils":77,"eventemitter3":10}],71:[function(require,module,exports){
var BaseTexture = require('./BaseTexture'),
    Texture = require('./Texture'),
    RenderTarget = require('../renderers/webgl/utils/RenderTarget'),
    FilterManager = require('../renderers/webgl/managers/FilterManager'),
    CanvasBuffer = require('../renderers/canvas/utils/CanvasBuffer'),
    math = require('../math'),
    CONST = require('../const'),
    tempMatrix = new math.Matrix();

/**
 * A RenderTexture is a special texture that allows any Pixi display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a RenderTexture should be preloaded
 * otherwise black rectangles will be drawn instead.
 *
 * A RenderTexture takes a snapshot of any Display Object given to its render method. The position
 * and rotation of the given Display Objects is ignored. For example:
 *
 * ```js
 * var renderer = PIXI.autoDetectRenderer(1024, 1024, { view: canvas, ratio: 1 });
 * var renderTexture = new PIXI.RenderTexture(renderer, 800, 600);
 * var sprite = PIXI.Sprite.fromImage("spinObj_01.png");
 *
 * sprite.position.x = 800/2;
 * sprite.position.y = 600/2;
 * sprite.anchor.x = 0.5;
 * sprite.anchor.y = 0.5;
 *
 * renderTexture.render(sprite);
 * ```
 *
 * The Sprite in this case will be rendered to a position of 0,0. To render this sprite at its actual
 * position a Container should be used:
 *
 * ```js
 * var doc = new PIXI.Container();
 *
 * doc.addChild(sprite);
 *
 * renderTexture.render(doc);  // Renders to center of renderTexture
 * ```
 *
 * @class
 * @extends PIXI.Texture
 * @memberof PIXI
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} The renderer used for this RenderTexture
 * @param [width=100] {number} The width of the render texture
 * @param [height=100] {number} The height of the render texture
 * @param [scaleMode] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param [resolution=1] {number} The resolution of the texture being generated
 */
function RenderTexture(renderer, width, height, scaleMode, resolution)
{
    if (!renderer)
    {
        throw new Error('Unable to create RenderTexture, you must pass a renderer into the constructor.');
    }

    width = width || 100;
    height = height || 100;
    resolution = resolution || CONST.RESOLUTION;

    /**
     * The base texture object that this texture uses
     *
     * @member {BaseTexture}
     */
    var baseTexture = new BaseTexture();
    baseTexture.width = width;
    baseTexture.height = height;
    baseTexture.resolution = resolution;
    baseTexture.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;
    baseTexture.hasLoaded = true;


    Texture.call(this,
        baseTexture,
        new math.Rectangle(0, 0, width, height)
    );


    /**
     * The with of the render texture
     *
     * @member {number}
     */
    this.width = width;

    /**
     * The height of the render texture
     *
     * @member {number}
     */
    this.height = height;

    /**
     * The Resolution of the texture.
     *
     * @member {number}
     */
    this.resolution = resolution;

    /**
     * Draw/render the given DisplayObject onto the texture.
     *
     * The displayObject and descendents are transformed during this operation.
     * If `updateTransform` is true then the transformations will be restored before the
     * method returns. Otherwise it is up to the calling code to correctly use or reset
     * the transformed display objects.
     *
     * The display object is always rendered with a worldAlpha value of 1.
     *
     * @method
     * @param displayObject {PIXI.DisplayObject} The display object to render this texture on
     * @param [matrix] {PIXI.Matrix} Optional matrix to apply to the display object before rendering.
     * @param [clear=false] {boolean} If true the texture will be cleared before the displayObject is drawn
     * @param [updateTransform=true] {boolean} If true the displayObject's worldTransform/worldAlpha and all children
     *  transformations will be restored. Not restoring this information will be a little faster.
     */
    this.render = null;

    /**
     * The renderer this RenderTexture uses. A RenderTexture can only belong to one renderer at the moment if its webGL.
     *
     * @member {PIXI.CanvasRenderer|PIXI.WebGLRenderer}
     */
    this.renderer = renderer;

    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        var gl = this.renderer.gl;

        this.textureBuffer = new RenderTarget(gl, this.width, this.height, baseTexture.scaleMode, this.resolution);//, this.baseTexture.scaleMode);
        this.baseTexture._glTextures[gl.id] = this.textureBuffer.texture;

        //TODO refactor filter manager.. as really its no longer a manager if we use it here..
        this.filterManager = new FilterManager(this.renderer);
        this.filterManager.onContextChange();
        this.filterManager.resize(width, height);
        this.render = this.renderWebGL;

        // the creation of a filter manager unbinds the buffers..
        this.renderer.currentRenderer.start();
        this.renderer.currentRenderTarget.activate();
    }
    else
    {

        this.render = this.renderCanvas;
        this.textureBuffer = new CanvasBuffer(this.width* this.resolution, this.height* this.resolution);
        this.baseTexture.source = this.textureBuffer.canvas;
    }

    /**
     * @member {boolean}
     */
    this.valid = true;

    this._updateUvs();
}

RenderTexture.prototype = Object.create(Texture.prototype);
RenderTexture.prototype.constructor = RenderTexture;
module.exports = RenderTexture;

/**
 * Resizes the RenderTexture.
 *
 * @param width {number} The width to resize to.
 * @param height {number} The height to resize to.
 * @param updateBase {boolean} Should the baseTexture.width and height values be resized as well?
 */
RenderTexture.prototype.resize = function (width, height, updateBase)
{
    if (width === this.width && height === this.height)
    {
        return;
    }

    this.valid = (width > 0 && height > 0);

    this.width = this._frame.width = this.crop.width = width;
    this.height =  this._frame.height = this.crop.height = height;

    if (updateBase)
    {
        this.baseTexture.width = this.width;
        this.baseTexture.height = this.height;
    }

    if (!this.valid)
    {
        return;
    }

    this.textureBuffer.resize(this.width, this.height);

    if(this.filterManager)
    {
        this.filterManager.resize(this.width, this.height);
    }
};

/**
 * Clears the RenderTexture.
 *
 */
RenderTexture.prototype.clear = function ()
{
    if (!this.valid)
    {
        return;
    }

    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
    }

    this.textureBuffer.clear();
};

/**
 * Internal method assigned to the `render` property if using a CanvasRenderer.
 *
 * @private
 * @param displayObject {PIXI.DisplayObject} The display object to render this texture on
 * @param [matrix] {PIXI.Matrix} Optional matrix to apply to the display object before rendering.
 * @param [clear=false] {boolean} If true the texture will be cleared before the displayObject is drawn
 * @param [updateTransform=true] {boolean} If true the displayObject's worldTransform/worldAlpha and all children
 *  transformations will be restored. Not restoring this information will be a little faster.
 */
RenderTexture.prototype.renderWebGL = function (displayObject, matrix, clear, updateTransform)
{
    if (!this.valid)
    {
        return;
    }


    updateTransform = (updateTransform !== undefined) ? updateTransform : true;//!updateTransform;

    this.textureBuffer.transform = matrix;

    //TODO not a fan that this is here... it will move!
    this.textureBuffer.activate();

    // setWorld Alpha to ensure that the object is renderer at full opacity
    displayObject.worldAlpha = 1;

    if (updateTransform)
    {

        // reset the matrix of the displatyObject..
        displayObject.worldTransform.identity();

        displayObject.currentBounds = null;

        // Time to update all the children of the displayObject with the new matrix..
        var children = displayObject.children;
        var i, j;

        for (i = 0, j = children.length; i < j; ++i)
        {
            children[i].updateTransform();
        }
    }

    //TODO rename textureBuffer to renderTarget..
    var temp =  this.renderer.filterManager;

    this.renderer.filterManager = this.filterManager;
    this.renderer.renderDisplayObject(displayObject, this.textureBuffer, clear);

    this.renderer.filterManager = temp;
};


/**
 * Internal method assigned to the `render` property if using a CanvasRenderer.
 *
 * @private
 * @param displayObject {PIXI.DisplayObject} The display object to render this texture on
 * @param [matrix] {PIXI.Matrix} Optional matrix to apply to the display object before rendering.
 * @param [clear] {boolean} If true the texture will be cleared before the displayObject is drawn
 */
RenderTexture.prototype.renderCanvas = function (displayObject, matrix, clear, updateTransform)
{
    if (!this.valid)
    {
        return;
    }

    updateTransform = !!updateTransform;

    var wt = tempMatrix;

    wt.identity();

    if (matrix)
    {
        wt.append(matrix);
    }

    var cachedWt = displayObject.worldTransform;
    displayObject.worldTransform = wt;

    // setWorld Alpha to ensure that the object is renderer at full opacity
    displayObject.worldAlpha = 1;

    // Time to update all the children of the displayObject with the new matrix..
    var children = displayObject.children;
    var i, j;

    for (i = 0, j = children.length; i < j; ++i)
    {
        children[i].updateTransform();
    }

    if (clear)
    {
        this.textureBuffer.clear();
    }


//    this.textureBuffer.
    var context = this.textureBuffer.context;

    var realResolution = this.renderer.resolution;

    this.renderer.resolution = this.resolution;

    this.renderer.renderDisplayObject(displayObject, context);

    this.renderer.resolution = realResolution;

    if(displayObject.worldTransform === wt)
    {
        // fixes cacheAsBitmap Happening during the above..
        displayObject.worldTransform = cachedWt;
    }

};

/**
 * Destroys this texture
 *
 * @param destroyBase {boolean} Whether to destroy the base texture as well
 */
RenderTexture.prototype.destroy = function ()
{
    Texture.prototype.destroy.call(this, true);

    this.textureBuffer.destroy();

    // destroy the filtermanager..
    if(this.filterManager)
    {
        this.filterManager.destroy();
    }

    this.renderer = null;
};

/**
 * Will return a HTML Image of the texture
 *
 * @return {Image}
 */
RenderTexture.prototype.getImage = function ()
{
    var image = new Image();
    image.src = this.getBase64();
    return image;
};

/**
 * Will return a a base64 encoded string of this texture. It works by calling RenderTexture.getCanvas and then running toDataURL on that.
 *
 * @return {string} A base64 encoded string of the texture.
 */
RenderTexture.prototype.getBase64 = function ()
{
    return this.getCanvas().toDataURL();
};

/**
 * Creates a Canvas element, renders this RenderTexture to it and then returns it.
 *
 * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
 */
RenderTexture.prototype.getCanvas = function ()
{
    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        var gl = this.renderer.gl;
        var width = this.textureBuffer.size.width;
        var height = this.textureBuffer.size.height;

        var webGLPixels = new Uint8Array(4 * width * height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        var tempCanvas = new CanvasBuffer(width, height);
        var canvasData = tempCanvas.context.getImageData(0, 0, width, height);
        canvasData.data.set(webGLPixels);

        tempCanvas.context.putImageData(canvasData, 0, 0);

        return tempCanvas.canvas;
    }
    else
    {
        return this.textureBuffer.canvas;
    }
};

/**
 * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA order, with integer values between 0 and 255 (included).
 *
 * @return {Uint8ClampedArray}
 */
RenderTexture.prototype.getPixels = function ()
{
    var width, height;

    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        var gl = this.renderer.gl;
        width = this.textureBuffer.size.width;
        height = this.textureBuffer.size.height;

        var webGLPixels = new Uint8Array(4 * width * height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return webGLPixels;
    }
    else
    {
        width = this.textureBuffer.canvas.width;
        height = this.textureBuffer.canvas.height;

        return this.textureBuffer.canvas.getContext('2d').getImageData(0, 0, width, height).data;
    }
};

/**
 * Will return a one-dimensional array containing the pixel data of a pixel within the texture in RGBA order, with integer values between 0 and 255 (included).
 *
 * @param x {number} The x coordinate of the pixel to retrieve.
 * @param y {number} The y coordinate of the pixel to retrieve.
 * @return {Uint8ClampedArray}
 */
RenderTexture.prototype.getPixel = function (x, y)
{
    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        var gl = this.renderer.gl;

        var webGLPixels = new Uint8Array(4);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return webGLPixels;
    }
    else
    {
        return this.textureBuffer.canvas.getContext('2d').getImageData(x, y, 1, 1).data;
    }
};

},{"../const":22,"../math":33,"../renderers/canvas/utils/CanvasBuffer":45,"../renderers/webgl/managers/FilterManager":54,"../renderers/webgl/utils/RenderTarget":65,"./BaseTexture":70,"./Texture":72}],72:[function(require,module,exports){
var BaseTexture = require('./BaseTexture'),
    VideoBaseTexture = require('./VideoBaseTexture'),
    TextureUvs = require('./TextureUvs'),
    EventEmitter = require('eventemitter3'),
    math = require('../math'),
    utils = require('../utils');

/**
 * A texture stores the information that represents an image or part of an image. It cannot be added
 * to the display list directly. Instead use it as the texture for a Sprite. If no frame is provided then the whole image is used.
 *
 * You can directly create a texture from an image and then reuse it multiple times like this :
 *
 * ```js
 * var texture = PIXI.Texture.fromImage('assets/image.png');
 * var sprite1 = new PIXI.Sprite(texture);
 * var sprite2 = new PIXI.Sprite(texture);
 * ```
 *
 * @class
 * @memberof PIXI
 * @param baseTexture {PIXI.BaseTexture} The base texture source to create the texture from
 * @param [frame] {PIXI.Rectangle} The rectangle frame of the texture to show
 * @param [crop] {PIXI.Rectangle} The area of original texture
 * @param [trim] {PIXI.Rectangle} Trimmed texture rectangle
 * @param [rotate] {number} indicates how the texture was rotated by texture packer. See {@link PIXI.GroupD8}
 */
function Texture(baseTexture, frame, crop, trim, rotate)
{
    EventEmitter.call(this);

    /**
     * Does this Texture have any frame data assigned to it?
     *
     * @member {boolean}
     */
    this.noFrame = false;

    if (!frame)
    {
        this.noFrame = true;
        frame = new math.Rectangle(0, 0, 1, 1);
    }

    if (baseTexture instanceof Texture)
    {
        baseTexture = baseTexture.baseTexture;
    }

    /**
     * The base texture that this texture uses.
     *
     * @member {PIXI.BaseTexture}
     */
    this.baseTexture = baseTexture;

    /**
     * The frame specifies the region of the base texture that this texture uses
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._frame = frame;

    /**
     * The texture trim data.
     *
     * @member {PIXI.Rectangle}
     */
    this.trim = trim;

    /**
     * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
     *
     * @member {boolean}
     */
    this.valid = false;

    /**
     * This will let a renderer know that a texture has been updated (used mainly for webGL uv updates)
     *
     * @member {boolean}
     */
    this.requiresUpdate = false;

    /**
     * The WebGL UV data cache.
     *
     * @member {PIXI.TextureUvs}
     * @private
     */
    this._uvs = null;

    /**
     * The width of the Texture in pixels.
     *
     * @member {number}
     */
    this.width = 0;

    /**
     * The height of the Texture in pixels.
     *
     * @member {number}
     */
    this.height = 0;

    /**
     * This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
     * irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
     *
     * @member {PIXI.Rectangle}
     */
    this.crop = crop || frame;//new math.Rectangle(0, 0, 1, 1);

    this._rotate = +(rotate || 0);

    if (rotate === true) {
        // this is old texturepacker legacy, some games/libraries are passing "true" for rotated textures
        this._rotate = 2;
    } else {
        if (this._rotate % 2 !== 0) {
            throw 'attempt to use diamond-shaped UVs. If you are sure, set rotation manually';
        }
    }

    if (baseTexture.hasLoaded)
    {
        if (this.noFrame)
        {
            frame = new math.Rectangle(0, 0, baseTexture.width, baseTexture.height);

            // if there is no frame we should monitor for any base texture changes..
            baseTexture.on('update', this.onBaseTextureUpdated, this);
        }
        this.frame = frame;
    }
    else
    {
        baseTexture.once('loaded', this.onBaseTextureLoaded, this);
    }

    /**
     * Fired when the texture is updated. This happens if the frame or the baseTexture is updated.
     *
     * @event update
     * @memberof PIXI.Texture#
     * @protected
     */
}

Texture.prototype = Object.create(EventEmitter.prototype);
Texture.prototype.constructor = Texture;
module.exports = Texture;

Object.defineProperties(Texture.prototype, {
    /**
     * The frame specifies the region of the base texture that this texture uses.
     *
     * @member {PIXI.Rectangle}
     * @memberof PIXI.Texture#
     */
    frame: {
        get: function ()
        {
            return this._frame;
        },
        set: function (frame)
        {
            this._frame = frame;

            this.noFrame = false;

            this.width = frame.width;
            this.height = frame.height;

            if (!this.trim && !this.rotate && (frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height))
            {
                throw new Error('Texture Error: frame does not fit inside the base Texture dimensions ' + this);
            }

            //this.valid = frame && frame.width && frame.height && this.baseTexture.source && this.baseTexture.hasLoaded;
            this.valid = frame && frame.width && frame.height && this.baseTexture.hasLoaded;

            if (this.trim)
            {
                this.width = this.trim.width;
                this.height = this.trim.height;
                this._frame.width = this.trim.width;
                this._frame.height = this.trim.height;
            }
            else
            {
                this.crop = frame;
            }

            if (this.valid)
            {
                this._updateUvs();
            }
        }
    },
    /**
     * Indicates whether the texture is rotated inside the atlas
     * set to 2 to compensate for texture packer rotation
     * set to 6 to compensate for spine packer rotation
     * can be used to rotate or mirror sprites
     * See {@link PIXI.GroupD8} for explanation
     *
     * @member {number}
     */
    rotate: {
        get: function ()
        {
            return this._rotate;
        },
        set: function (rotate)
        {
            this._rotate = rotate;
            if (this.valid)
            {
                this._updateUvs();
            }
        }
    }
});

/**
 * Updates this texture on the gpu.
 *
 */
Texture.prototype.update = function ()
{
    this.baseTexture.update();
};

/**
 * Called when the base texture is loaded
 *
 * @private
 */
Texture.prototype.onBaseTextureLoaded = function (baseTexture)
{
    // TODO this code looks confusing.. boo to abusing getters and setterss!
    if (this.noFrame)
    {
        this.frame = new math.Rectangle(0, 0, baseTexture.width, baseTexture.height);
    }
    else
    {
        this.frame = this._frame;
    }

    this.emit('update', this);
};

/**
 * Called when the base texture is updated
 *
 * @private
 */
Texture.prototype.onBaseTextureUpdated = function (baseTexture)
{
    this._frame.width = baseTexture.width;
    this._frame.height = baseTexture.height;

    this.emit('update', this);
};

/**
 * Destroys this texture
 *
 * @param [destroyBase=false] {boolean} Whether to destroy the base texture as well
 */
Texture.prototype.destroy = function (destroyBase)
{
    if (this.baseTexture)
    {
        if (destroyBase)
        {
            this.baseTexture.destroy();
        }

        this.baseTexture.off('update', this.onBaseTextureUpdated, this);
        this.baseTexture.off('loaded', this.onBaseTextureLoaded, this);

        this.baseTexture = null;
    }

    this._frame = null;
    this._uvs = null;
    this.trim = null;
    this.crop = null;

    this.valid = false;

    this.off('dispose', this.dispose, this);
    this.off('update', this.update, this);
};

/**
 * Creates a new texture object that acts the same as this one.
 *
 * @return {PIXI.Texture}
 */
Texture.prototype.clone = function ()
{
    return new Texture(this.baseTexture, this.frame, this.crop, this.trim, this.rotate);
};

/**
 * Updates the internal WebGL UV cache.
 *
 * @private
 */
Texture.prototype._updateUvs = function ()
{
    if (!this._uvs)
    {
        this._uvs = new TextureUvs();
    }

    this._uvs.set(this.crop, this.baseTexture, this.rotate);
};

/**
 * Helper function that creates a Texture object from the given image url.
 * If the image is not in the texture cache it will be  created and loaded.
 *
 * @static
 * @param imageUrl {string} The image url of the texture
 * @param crossorigin {boolean} Whether requests should be treated as crossorigin
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} The newly created texture
 */
Texture.fromImage = function (imageUrl, crossorigin, scaleMode)
{
    var texture = utils.TextureCache[imageUrl];

    if (!texture)
    {
        texture = new Texture(BaseTexture.fromImage(imageUrl, crossorigin, scaleMode));
        utils.TextureCache[imageUrl] = texture;
    }

    return texture;
};

/**
 * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {string} The frame Id of the texture in the cache
 * @return {PIXI.Texture} The newly created texture
 */
Texture.fromFrame = function (frameId)
{
    var texture = utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
    }

    return texture;
};

/**
 * Helper function that creates a new Texture based on the given canvas element.
 *
 * @static
 * @param canvas {Canvas} The canvas element source of the texture
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture}
 */
Texture.fromCanvas = function (canvas, scaleMode)
{
    return new Texture(BaseTexture.fromCanvas(canvas, scaleMode));
};

/**
 * Helper function that creates a new Texture based on the given video element.
 *
 * @static
 * @param video {HTMLVideoElement}
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} A Texture
 */
Texture.fromVideo = function (video, scaleMode)
{
    if (typeof video === 'string')
    {
        return Texture.fromVideoUrl(video, scaleMode);
    }
    else
    {
        return new Texture(VideoBaseTexture.fromVideo(video, scaleMode));
    }
};

/**
 * Helper function that creates a new Texture based on the video url.
 *
 * @static
 * @param videoUrl {string}
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} A Texture
 */
Texture.fromVideoUrl = function (videoUrl, scaleMode)
{
    return new Texture(VideoBaseTexture.fromUrl(videoUrl, scaleMode));
};

/**
 * Adds a texture to the global utils.TextureCache. This cache is shared across the whole PIXI object.
 *
 * @static
 * @param texture {PIXI.Texture} The Texture to add to the cache.
 * @param id {string} The id that the texture will be stored against.
 */
Texture.addTextureToCache = function (texture, id)
{
    utils.TextureCache[id] = texture;
};

/**
 * Remove a texture from the global utils.TextureCache.
 *
 * @static
 * @param id {string} The id of the texture to be removed
 * @return {PIXI.Texture} The texture that was removed
 */
Texture.removeTextureFromCache = function (id)
{
    var texture = utils.TextureCache[id];

    delete utils.TextureCache[id];
    delete utils.BaseTextureCache[id];

    return texture;
};

/**
 * An empty texture, used often to not have to create multiple empty textures.
 *
 * @static
 * @constant
 */
Texture.EMPTY = new Texture(new BaseTexture());

},{"../math":33,"../utils":77,"./BaseTexture":70,"./TextureUvs":73,"./VideoBaseTexture":74,"eventemitter3":10}],73:[function(require,module,exports){

/**
 * A standard object to store the Uvs of a texture
 *
 * @class
 * @private
 * @memberof PIXI
 */
function TextureUvs()
{
    this.x0 = 0;
    this.y0 = 0;

    this.x1 = 1;
    this.y1 = 0;

    this.x2 = 1;
    this.y2 = 1;

    this.x3 = 0;
    this.y3 = 1;
}

module.exports = TextureUvs;

var GroupD8 = require('../math/GroupD8');

/**
 * Sets the texture Uvs based on the given frame information
 * @param frame {PIXI.Rectangle}
 * @param baseFrame {PIXI.Rectangle}
 * @param rotate {number} Rotation of frame, see {@link PIXI.GroupD8}
 * @private
 */
TextureUvs.prototype.set = function (frame, baseFrame, rotate)
{
    var tw = baseFrame.width;
    var th = baseFrame.height;

    if(rotate)
    {
        //width and height div 2 div baseFrame size
        var swapWidthHeight = GroupD8.isSwapWidthHeight(rotate);
        var w2 = (swapWidthHeight ? frame.height : frame.width) / 2 / tw;
        var h2 = (swapWidthHeight ? frame.width : frame.height) / 2 / th;
        //coordinates of center
        var cX = frame.x / tw + w2;
        var cY = frame.y / th + h2;
        rotate = GroupD8.add(rotate, GroupD8.NW); //NW is top-left corner
        this.x0 = cX + w2 * GroupD8.uX(rotate);
        this.y0 = cY + h2 * GroupD8.uY(rotate);
        rotate = GroupD8.add(rotate, 2); //rotate 90 degrees clockwise
        this.x1 = cX + w2 * GroupD8.uX(rotate);
        this.y1 = cY + h2 * GroupD8.uY(rotate);
        rotate = GroupD8.add(rotate, 2);
        this.x2 = cX + w2 * GroupD8.uX(rotate);
        this.y2 = cY + h2 * GroupD8.uY(rotate);
        rotate = GroupD8.add(rotate, 2);
        this.x3 = cX + w2 * GroupD8.uX(rotate);
        this.y3 = cY + h2 * GroupD8.uY(rotate);
    }
    else
    {

        this.x0 = frame.x / tw;
        this.y0 = frame.y / th;

        this.x1 = (frame.x + frame.width) / tw;
        this.y1 = frame.y / th;

        this.x2 = (frame.x + frame.width) / tw;
        this.y2 = (frame.y + frame.height) / th;

        this.x3 = frame.x / tw;
        this.y3 = (frame.y + frame.height) / th;
    }
};

},{"../math/GroupD8":30}],74:[function(require,module,exports){
var BaseTexture = require('./BaseTexture'),
    utils = require('../utils');

/**
 * A texture of a [playing] Video.
 *
 * Video base textures mimic Pixi BaseTexture.from.... method in their creation process.
 *
 * This can be used in several ways, such as:
 *
 * ```js
 * var texture = PIXI.VideoBaseTexture.fromUrl('http://mydomain.com/video.mp4');
 *
 * var texture = PIXI.VideoBaseTexture.fromUrl({ src: 'http://mydomain.com/video.mp4', mime: 'video/mp4' });
 *
 * var texture = PIXI.VideoBaseTexture.fromUrls(['/video.webm', '/video.mp4']);
 *
 * var texture = PIXI.VideoBaseTexture.fromUrls([
 *     { src: '/video.webm', mime: 'video/webm' },
 *     { src: '/video.mp4', mime: 'video/mp4' }
 * ]);
 * ```
 *
 * See the ["deus" demo](http://www.goodboydigital.com/pixijs/examples/deus/).
 *
 * @class
 * @extends PIXI.BaseTexture
 * @memberof PIXI
 * @param source {HTMLVideoElement}
 * @param [scaleMode] {number} See {@link PIXI.SCALE_MODES} for possible values
 */
function VideoBaseTexture(source, scaleMode)
{
    if (!source)
    {
        throw new Error('No video source element specified.');
    }

    // hook in here to check if video is already available.
    // BaseTexture looks for a source.complete boolean, plus width & height.

    if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA) && source.width && source.height)
    {
        source.complete = true;
    }

    BaseTexture.call(this, source, scaleMode);

    /**
     * Should the base texture automatically update itself, set to true by default
     *
     * @member {boolean}
     * @default true
     */
    this.autoUpdate = false;

    this._onUpdate = this._onUpdate.bind(this);
    this._onCanPlay = this._onCanPlay.bind(this);

    if (!source.complete)
    {
        source.addEventListener('canplay', this._onCanPlay);
        source.addEventListener('canplaythrough', this._onCanPlay);

        // started playing..
        source.addEventListener('play', this._onPlayStart.bind(this));
        source.addEventListener('pause', this._onPlayStop.bind(this));
    }

    this.__loaded = false;
}

VideoBaseTexture.prototype = Object.create(BaseTexture.prototype);
VideoBaseTexture.prototype.constructor = VideoBaseTexture;
module.exports = VideoBaseTexture;

/**
 * The internal update loop of the video base texture, only runs when autoUpdate is set to true
 *
 * @private
 */
VideoBaseTexture.prototype._onUpdate = function ()
{
    if (this.autoUpdate)
    {
        window.requestAnimationFrame(this._onUpdate);
        this.update();
    }
};

/**
 * Runs the update loop when the video is ready to play
 *
 * @private
 */
VideoBaseTexture.prototype._onPlayStart = function ()
{
    if (!this.autoUpdate)
    {
        window.requestAnimationFrame(this._onUpdate);
        this.autoUpdate = true;
    }
};

/**
 * Fired when a pause event is triggered, stops the update loop
 *
 * @private
 */
VideoBaseTexture.prototype._onPlayStop = function ()
{
    this.autoUpdate = false;
};

/**
 * Fired when the video is loaded and ready to play
 *
 * @private
 */
VideoBaseTexture.prototype._onCanPlay = function ()
{
    this.hasLoaded = true;

    if (this.source)
    {
        this.source.removeEventListener('canplay', this._onCanPlay);
        this.source.removeEventListener('canplaythrough', this._onCanPlay);

        this.width = this.source.videoWidth;
        this.height = this.source.videoHeight;

        this.source.play();

        // prevent multiple loaded dispatches..
        if (!this.__loaded)
        {
            this.__loaded = true;
            this.emit('loaded', this);
        }
    }
};

/**
 * Destroys this texture
 *
 */
VideoBaseTexture.prototype.destroy = function ()
{
    if (this.source && this.source._pixiId)
    {
        delete utils.BaseTextureCache[ this.source._pixiId ];
        delete this.source._pixiId;
    }

    BaseTexture.prototype.destroy.call(this);
};

/**
 * Mimic Pixi BaseTexture.from.... method.
 *
 * @static
 * @param video {HTMLVideoElement}
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.VideoBaseTexture}
 */
VideoBaseTexture.fromVideo = function (video, scaleMode)
{
    if (!video._pixiId)
    {
        video._pixiId = 'video_' + utils.uid();
    }

    var baseTexture = utils.BaseTextureCache[video._pixiId];

    if (!baseTexture)
    {
        baseTexture = new VideoBaseTexture(video, scaleMode);
        utils.BaseTextureCache[ video._pixiId ] = baseTexture;
    }

    return baseTexture;
};

/**
 * Helper function that creates a new BaseTexture based on the given video element.
 * This BaseTexture can then be used to create a texture
 *
 * @static
 * @param videoSrc {string|object|string[]|object[]} The URL(s) for the video.
 * @param [videoSrc.src] {string} One of the source urls for the video
 * @param [videoSrc.mime] {string} The mimetype of the video (e.g. 'video/mp4'). If not specified
 *  the url's extension will be used as the second part of the mime type.
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.VideoBaseTexture}
 */
VideoBaseTexture.fromUrl = function (videoSrc, scaleMode)
{
    var video = document.createElement('video');

    // array of objects or strings
    if (Array.isArray(videoSrc))
    {
        for (var i = 0; i < videoSrc.length; ++i)
        {
            video.appendChild(createSource(videoSrc[i].src || videoSrc[i], videoSrc[i].mime));
        }
    }
    // single object or string
    else
    {
        video.appendChild(createSource(videoSrc.src || videoSrc, videoSrc.mime));
    }

    video.load();
    video.play();

    return VideoBaseTexture.fromVideo(video, scaleMode);
};

VideoBaseTexture.fromUrls = VideoBaseTexture.fromUrl;

function createSource(path, type)
{
    if (!type)
    {
        type = 'video/' + path.substr(path.lastIndexOf('.') + 1);
    }

    var source = document.createElement('source');

    source.src = path;
    source.type = type;

    return source;
}

},{"../utils":77,"./BaseTexture":70}],75:[function(require,module,exports){
var CONST = require('../const'),
    EventEmitter = require('eventemitter3'),
    // Internal event used by composed emitter
    TICK = 'tick';

/**
 * A Ticker class that runs an update loop that other objects listen to.
 * This class is composed around an EventEmitter object to add listeners
 * meant for execution on the next requested animation frame.
 * Animation frames are requested only when necessary,
 * e.g. When the ticker is started and the emitter has listeners.
 *
 * @class
 * @memberof PIXI.ticker
 */
function Ticker()
{
    var _this = this;

    /**
     * Internal tick method bound to ticker instance.
     * This is because in early 2015, Function.bind
     * is still 60% slower in high performance scenarios.
     * Also separating frame requests from update method
     * so listeners may be called at any time and with
     * any animation API, just invoke ticker.update(time).
     *
     * @private
     */
    this._tick = function _tick(time) {

        _this._requestId = null;

        if (_this.started)
        {
            // Invoke listeners now
            _this.update(time);
            // Listener side effects may have modified ticker state.
            if (_this.started && _this._requestId === null && _this._emitter.listeners(TICK, true))
            {
                _this._requestId = requestAnimationFrame(_this._tick);
            }
        }
    };

    /**
     * Internal emitter used to fire 'tick' event
     * @private
     */
    this._emitter = new EventEmitter();

    /**
     * Internal current frame request ID
     * @private
     */
    this._requestId = null;

    /**
     * Internal value managed by minFPS property setter and getter.
     * This is the maximum allowed milliseconds between updates.
     * @private
     */
    this._maxElapsedMS = 100;

    /**
     * Whether or not this ticker should invoke the method
     * {@link PIXI.ticker.Ticker#start} automatically
     * when a listener is added.
     *
     * @member {boolean}
     * @default false
     */
    this.autoStart = false;

    /**
     * Scalar time value from last frame to this frame.
     * This value is capped by setting {@link PIXI.ticker.Ticker#minFPS}
     * and is scaled with {@link PIXI.ticker.Ticker#speed}.
     * **Note:** The cap may be exceeded by scaling.
     *
     * @member {number}
     * @default 1
     */
    this.deltaTime = 1;

    /**
     * Time elapsed in milliseconds from last frame to this frame.
     * Opposed to what the scalar {@link PIXI.ticker.Ticker#deltaTime}
     * is based, this value is neither capped nor scaled.
     * If the platform supports DOMHighResTimeStamp,
     * this value will have a precision of 1 µs.
     *
     * @member {DOMHighResTimeStamp|number}
     * @default 1 / TARGET_FPMS
     */
    this.elapsedMS = 1 / CONST.TARGET_FPMS; // default to target frame time

    /**
     * The last time {@link PIXI.ticker.Ticker#update} was invoked.
     * This value is also reset internally outside of invoking
     * update, but only when a new animation frame is requested.
     * If the platform supports DOMHighResTimeStamp,
     * this value will have a precision of 1 µs.
     *
     * @member {DOMHighResTimeStamp|number}
     * @default 0
     */
    this.lastTime = 0;

    /**
     * Factor of current {@link PIXI.ticker.Ticker#deltaTime}.
     * @example
     * // Scales ticker.deltaTime to what would be
     * // the equivalent of approximately 120 FPS
     * ticker.speed = 2;
     *
     * @member {number}
     * @default 1
     */
    this.speed = 1;

    /**
     * Whether or not this ticker has been started.
     * `true` if {@link PIXI.ticker.Ticker#start} has been called.
     * `false` if {@link PIXI.ticker.Ticker#stop} has been called.
     * While `false`, this value may change to `true` in the
     * event of {@link PIXI.ticker.Ticker#autoStart} being `true`
     * and a listener is added.
     *
     * @member {boolean}
     * @default false
     */
    this.started = false;
}

Object.defineProperties(Ticker.prototype, {
    /**
     * The frames per second at which this ticker is running.
     * The default is approximately 60 in most modern browsers.
     * **Note:** This does not factor in the value of
     * {@link PIXI.ticker.Ticker#speed}, which is specific
     * to scaling {@link PIXI.ticker.Ticker#deltaTime}.
     *
     * @member
     * @memberof PIXI.ticker.Ticker#
     * @readonly
     */
    FPS: {
        get: function()
        {
            return 1000 / this.elapsedMS;
        }
    },

    /**
     * Manages the maximum amount of milliseconds allowed to
     * elapse between invoking {@link PIXI.ticker.Ticker#update}.
     * This value is used to cap {@link PIXI.ticker.Ticker#deltaTime},
     * but does not effect the measured value of {@link PIXI.ticker.Ticker#FPS}.
     * When setting this property it is clamped to a value between
     * `0` and `PIXI.TARGET_FPMS * 1000`.
     *
     * @member
     * @memberof PIXI.ticker.Ticker#
     * @default 10
     */
    minFPS: {
        get: function()
        {
            return 1000 / this._maxElapsedMS;
        },
        set: function(fps)
        {
            // Clamp: 0 to TARGET_FPMS
            var minFPMS = Math.min(Math.max(0, fps) / 1000, CONST.TARGET_FPMS);
            this._maxElapsedMS = 1 / minFPMS;
        }
    }
});

/**
 * Conditionally requests a new animation frame.
 * If a frame has not already been requested, and if the internal
 * emitter has listeners, a new frame is requested.
 *
 * @private
 */
Ticker.prototype._requestIfNeeded = function _requestIfNeeded()
{
    if (this._requestId === null && this._emitter.listeners(TICK, true))
    {
        // ensure callbacks get correct delta
        this.lastTime = performance.now();
        this._requestId = requestAnimationFrame(this._tick);
    }
};

/**
 * Conditionally cancels a pending animation frame.
 *
 * @private
 */
Ticker.prototype._cancelIfNeeded = function _cancelIfNeeded()
{
    if (this._requestId !== null)
    {
        cancelAnimationFrame(this._requestId);
        this._requestId = null;
    }
};

/**
 * Conditionally requests a new animation frame.
 * If the ticker has been started it checks if a frame has not already
 * been requested, and if the internal emitter has listeners. If these
 * conditions are met, a new frame is requested. If the ticker has not
 * been started, but autoStart is `true`, then the ticker starts now,
 * and continues with the previous conditions to request a new frame.
 *
 * @private
 */
Ticker.prototype._startIfPossible = function _startIfPossible()
{
    if (this.started)
    {
        this._requestIfNeeded();
    }
    else if (this.autoStart)
    {
        this.start();
    }
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#on} internally for the
 * internal 'tick' event. It checks if the emitter has listeners,
 * and if so it requests a new animation frame at this point.
 *
 * @param fn {Function} The listener function to be added for updates
 * @param [context] {Function} The listener context
 * @returns {PIXI.ticker.Ticker} this
 */
Ticker.prototype.add = function add(fn, context)
{
    this._emitter.on(TICK, fn, context);

    this._startIfPossible();

    return this;
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#once} internally for the
 * internal 'tick' event. It checks if the emitter has listeners,
 * and if so it requests a new animation frame at this point.
 *
 * @param fn {Function} The listener function to be added for one update
 * @param [context] {Function} The listener context
 * @returns {PIXI.ticker.Ticker} this
 */
Ticker.prototype.addOnce = function addOnce(fn, context)
{
    this._emitter.once(TICK, fn, context);

    this._startIfPossible();

    return this;
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#off} internally for 'tick' event.
 * It checks if the emitter has listeners for 'tick' event.
 * If it does, then it cancels the animation frame.
 *
 * @param [fn] {Function} The listener function to be removed
 * @param [context] {Function} The listener context to be removed
 * @returns {PIXI.ticker.Ticker} this
 */
Ticker.prototype.remove = function remove(fn, context)
{
    this._emitter.off(TICK, fn, context);

    if (!this._emitter.listeners(TICK, true))
    {
        this._cancelIfNeeded();
    }

    return this;
};

/**
 * Starts the ticker. If the ticker has listeners
 * a new animation frame is requested at this point.
 */
Ticker.prototype.start = function start()
{
    if (!this.started)
    {
        this.started = true;
        this._requestIfNeeded();
    }
};

/**
 * Stops the ticker. If the ticker has requested
 * an animation frame it is canceled at this point.
 */
Ticker.prototype.stop = function stop()
{
    if (this.started)
    {
        this.started = false;
        this._cancelIfNeeded();
    }
};

/**
 * Triggers an update. An update entails setting the
 * current {@link PIXI.ticker.Ticker#elapsedMS},
 * the current {@link PIXI.ticker.Ticker#deltaTime},
 * invoking all listeners with current deltaTime,
 * and then finally setting {@link PIXI.ticker.Ticker#lastTime}
 * with the value of currentTime that was provided.
 * This method will be called automatically by animation
 * frame callbacks if the ticker instance has been started
 * and listeners are added.
 *
 * @param [currentTime=performance.now()] {DOMHighResTimeStamp|number} the current time of execution
 */
Ticker.prototype.update = function update(currentTime)
{
    var elapsedMS;

    // Allow calling update directly with default currentTime.
    currentTime = currentTime || performance.now();
    // Save uncapped elapsedMS for measurement
    elapsedMS = this.elapsedMS = currentTime - this.lastTime;

    // cap the milliseconds elapsed used for deltaTime
    if (elapsedMS > this._maxElapsedMS)
    {
        elapsedMS = this._maxElapsedMS;
    }

    this.deltaTime = elapsedMS * CONST.TARGET_FPMS * this.speed;

    // Invoke listeners added to internal emitter
    this._emitter.emit(TICK, this.deltaTime);

    this.lastTime = currentTime;
};

module.exports = Ticker;

},{"../const":22,"eventemitter3":10}],76:[function(require,module,exports){
var Ticker = require('./Ticker');

/**
 * The shared ticker instance used by {@link PIXI.extras.MovieClip}.
 * and by {@link PIXI.interaction.InteractionManager}.
 * The property {@link PIXI.ticker.Ticker#autoStart} is set to `true`
 * for this instance. Please follow the examples for usage, including
 * how to opt-out of auto-starting the shared ticker.
 *
 * @example
 * var ticker = PIXI.ticker.shared;
 * // Set this to prevent starting this ticker when listeners are added.
 * // By default this is true only for the PIXI.ticker.shared instance.
 * ticker.autoStart = false;
 * // FYI, call this to ensure the ticker is stopped. It should be stopped
 * // if you have not attempted to render anything yet.
 * ticker.stop();
 * // Call this when you are ready for a running shared ticker.
 * ticker.start();
 *
 * @example
 * // You may use the shared ticker to render...
 * var renderer = PIXI.autoDetectRenderer(800, 600);
 * var stage = new PIXI.Container();
 * var interactionManager = PIXI.interaction.InteractionManager(renderer);
 * document.body.appendChild(renderer.view);
 * ticker.add(function (time) {
 *     renderer.render(stage);
 * });
 *
 * @example
 * // Or you can just update it manually.
 * ticker.autoStart = false;
 * ticker.stop();
 * function animate(time) {
 *     ticker.update(time);
 *     renderer.render(stage);
 *     requestAnimationFrame(animate);
 * }
 * animate(performance.now());
 *
 * @type {PIXI.ticker.Ticker}
 * @memberof PIXI.ticker
 */
var shared = new Ticker();
shared.autoStart = true;

/**
 * @namespace PIXI.ticker
 */
module.exports = {
    shared: shared,
    Ticker: Ticker
};

},{"./Ticker":75}],77:[function(require,module,exports){
var CONST = require('../const');

/**
 * @namespace PIXI.utils
 */
var utils = module.exports = {
    _uid: 0,
    _saidHello: false,

    EventEmitter:   require('eventemitter3'),
    pluginTarget:   require('./pluginTarget'),
    async:          require('async'),

    /**
     * Gets the next unique identifier
     *
     * @return {number} The next unique identifier to use.
     */
    uid: function ()
    {
        return ++utils._uid;
    },

    /**
     * Converts a hex color number to an [R, G, B] array
     *
     * @param hex {number}
     * @param  {number[]} [out=[]]
     * @return {number[]} An array representing the [R, G, B] of the color.
     */
    hex2rgb: function (hex, out)
    {
        out = out || [];

        out[0] = (hex >> 16 & 0xFF) / 255;
        out[1] = (hex >> 8 & 0xFF) / 255;
        out[2] = (hex & 0xFF) / 255;

        return out;
    },

    /**
     * Converts a hex color number to a string.
     *
     * @param hex {number}
     * @return {string} The string color.
     */
    hex2string: function (hex)
    {
        hex = hex.toString(16);
        hex = '000000'.substr(0, 6 - hex.length) + hex;

        return '#' + hex;
    },

    /**
     * Converts a color as an [R, G, B] array to a hex number
     *
     * @param rgb {number[]}
     * @return {number} The color number
     */
    rgb2hex: function (rgb)
    {
        return ((rgb[0]*255 << 16) + (rgb[1]*255 << 8) + rgb[2]*255);
    },

    /**
     * Checks whether the Canvas BlendModes are supported by the current browser
     *
     * @return {boolean} whether they are supported
     */
    canUseNewCanvasBlendModes: function ()
    {
        if (typeof document === 'undefined')
        {
            return false;
        }

        var pngHead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/';
        var pngEnd = 'AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';

        var magenta = new Image();
        magenta.src = pngHead + 'AP804Oa6' + pngEnd;

        var yellow = new Image();
        yellow.src = pngHead + '/wCKxvRF' + pngEnd;

        var canvas = document.createElement('canvas');
        canvas.width = 6;
        canvas.height = 1;

        var context = canvas.getContext('2d');
        context.globalCompositeOperation = 'multiply';
        context.drawImage(magenta, 0, 0);
        context.drawImage(yellow, 2, 0);

        var data = context.getImageData(2,0,1,1).data;

        return (data[0] === 255 && data[1] === 0 && data[2] === 0);
    },

    /**
     * Given a number, this function returns the closest number that is a power of two
     * this function is taken from Starling Framework as its pretty neat ;)
     *
     * @param number {number}
     * @return {number} the closest number that is a power of two
     */
    getNextPowerOfTwo: function (number)
    {
        // see: http://en.wikipedia.org/wiki/Power_of_two#Fast_algorithm_to_check_if_a_positive_number_is_a_power_of_two
        if (number > 0 && (number & (number - 1)) === 0)
        {
            return number;
        }
        else
        {
            var result = 1;

            while (result < number)
            {
                result <<= 1;
            }

            return result;
        }
    },

    /**
     * checks if the given width and height make a power of two rectangle
     *
     * @param width {number}
     * @param height {number}
     * @return {boolean}
     */
    isPowerOfTwo: function (width, height)
    {
        return (width > 0 && (width & (width - 1)) === 0 && height > 0 && (height & (height - 1)) === 0);
    },

    /**
     * get the resolution of an asset by looking for the prefix
     * used by spritesheets and image urls
     *
     * @param url {string} the image path
     * @return {number}
     */
    getResolutionOfUrl: function (url)
    {
        var resolution = CONST.RETINA_PREFIX.exec(url);

        if (resolution)
        {
           return parseFloat(resolution[1]);
        }

        return 1;
    },

    /**
     * Logs out the version and renderer information for this running instance of PIXI.
     * If you don't want to see this message you can set `PIXI.utils._saidHello = true;`
     * so the library thinks it already said it. Keep in mind that doing that will forever
     * makes you a jerk face.
     *
     * @param {string} type - The string renderer type to log.
     * @constant
     * @static
     */
    sayHello: function (type)
    {
        if (utils._saidHello)
        {
            return;
        }

        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
        {
            var args = [
                '\n %c %c %c Pixi.js ' + CONST.VERSION + ' - ✰ ' + type + ' ✰  %c ' + ' %c ' + ' http://www.pixijs.com/  %c %c ♥%c♥%c♥ \n\n',
                'background: #ff66a5; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'color: #ff66a5; background: #030307; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'background: #ffc3dc; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;'
            ];

            window.console.log.apply(console, args); //jshint ignore:line
        }
        else if (window.console)
        {
            window.console.log('Pixi.js ' + CONST.VERSION + ' - ' + type + ' - http://www.pixijs.com/'); //jshint ignore:line
        }

        utils._saidHello = true;
    },

    /**
     * Helper for checking for webgl support
     *
     * @return {boolean}
     */
    isWebGLSupported: function ()
    {
        var contextOptions = { stencil: true };
        try
        {
            if (!window.WebGLRenderingContext)
            {
                return false;
            }

            var canvas = document.createElement('canvas'),
                gl = canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);

            return !!(gl && gl.getContextAttributes().stencil);
        }
        catch (e)
        {
            return false;
        }
    },

    /**
     * Returns sign of number
     *
     * @param n {number}
     * @returns {number} 0 if n is 0, -1 if n is negative, 1 if n i positive
     */
    sign: function (n)
    {
        return n ? (n < 0 ? -1 : 1) : 0;
    },

    /**
     * removeItems
     *
     * @param {array} arr The target array
     * @param {number} startIdx The index to begin removing from (inclusive)
     * @param {number} removeCount How many items to remove
     */
    removeItems: function (arr, startIdx, removeCount)
    {
        var length = arr.length;

        if (startIdx >= length || removeCount === 0)
        {
            return;
        }

        removeCount = (startIdx+removeCount > length ? length-startIdx : removeCount);
        for (var i = startIdx, len = length-removeCount; i < len; ++i)
        {
            arr[i] = arr[i + removeCount];
        }

        arr.length = len;
    },

    /**
     * @todo Describe property usage
     * @private
     */
    TextureCache: {},

    /**
     * @todo Describe property usage
     * @private
     */
    BaseTextureCache: {}
};

},{"../const":22,"./pluginTarget":78,"async":1,"eventemitter3":10}],78:[function(require,module,exports){
/**
 * Mixins functionality to make an object have "plugins".
 *
 * @mixin
 * @memberof PIXI.utils
 * @param obj {object} The object to mix into.
 * @example
 *      function MyObject() {}
 *
 *      pluginTarget.mixin(MyObject);
 */
function pluginTarget(obj)
{
    obj.__plugins = {};

    /**
     * Adds a plugin to an object
     *
     * @param pluginName {string} The events that should be listed.
     * @param ctor {Function} The constructor function for the plugin.
     */
    obj.registerPlugin = function (pluginName, ctor)
    {
        obj.__plugins[pluginName] = ctor;
    };

    /**
     * Instantiates all the plugins of this object
     *
     */
    obj.prototype.initPlugins = function ()
    {
        this.plugins = this.plugins || {};

        for (var o in obj.__plugins)
        {
            this.plugins[o] = new (obj.__plugins[o])(this);
        }
    };

    /**
     * Removes all the plugins of this object
     *
     */
    obj.prototype.destroyPlugins = function ()
    {
        for (var o in this.plugins)
        {
            this.plugins[o].destroy();
            this.plugins[o] = null;
        }

        this.plugins = null;
    };
}


module.exports = {
    /**
     * Mixes in the properties of the pluginTarget into another object
     *
     * @param object {object} The obj to mix into
     */
    mixin: function mixin(obj)
    {
        pluginTarget(obj);
    }
};

},{}],79:[function(require,module,exports){
/*global console */
var core = require('./core'),
    mesh = require('./mesh'),
    extras = require('./extras'),
    filters = require('./filters');

/**
 * @class
 * @private
 * @name SpriteBatch
 * @memberof PIXI
 * @see PIXI.ParticleContainer
 * @throws {ReferenceError} SpriteBatch does not exist any more, please use the new ParticleContainer instead.
 * @deprecated since version 3.0.0
 */
core.SpriteBatch = function()
{
    throw new ReferenceError('SpriteBatch does not exist any more, please use the new ParticleContainer instead.');
};

/**
 * @class
 * @private
 * @name AssetLoader
 * @memberof PIXI
 * @see PIXI.loaders.Loader
 * @throws {ReferenceError} The loader system was overhauled in pixi v3, please see the new PIXI.loaders.Loader class.
 * @deprecated since version 3.0.0
 */
core.AssetLoader = function()
{
    throw new ReferenceError('The loader system was overhauled in pixi v3, please see the new PIXI.loaders.Loader class.');
};

Object.defineProperties(core, {

    /**
     * @class
     * @private
     * @name Stage
     * @memberof PIXI
     * @see PIXI.Container
     * @deprecated since version 3.0.0
     */
    Stage: {
        get: function()
        {
            console.warn('You do not need to use a PIXI Stage any more, you can simply render any container.');
            return core.Container;
        }
    },

    /**
     * @class
     * @private
     * @name DisplayObjectContainer
     * @memberof PIXI
     * @see PIXI.Container
     * @deprecated since version 3.0.0
     */
    DisplayObjectContainer: {
        get: function()
        {
            console.warn('DisplayObjectContainer has been shortened to Container, please use Container from now on.');
            return core.Container;
        }
    },

    /**
     * @class
     * @private
     * @name Strip
     * @memberof PIXI
     * @see PIXI.mesh.Mesh
     * @deprecated since version 3.0.0
     */
    Strip: {
        get: function()
        {
            console.warn('The Strip class has been renamed to Mesh and moved to mesh.Mesh, please use mesh.Mesh from now on.');
            return mesh.Mesh;
        }
    },

    /**
     * @class
     * @private
     * @name Rope
     * @memberof PIXI
     * @see PIXI.mesh.Rope
     * @deprecated since version 3.0.0
     */
    Rope: {
        get: function()
        {
            console.warn('The Rope class has been moved to mesh.Rope, please use mesh.Rope from now on.');
            return mesh.Rope;
        }
    },

    /**
     * @class
     * @private
     * @name MovieClip
     * @memberof PIXI
     * @see PIXI.extras.MovieClip
     * @deprecated since version 3.0.0
     */
    MovieClip: {
        get: function()
        {
            console.warn('The MovieClip class has been moved to extras.MovieClip, please use extras.MovieClip from now on.');
            return extras.MovieClip;
        }
    },

    /**
     * @class
     * @private
     * @name TilingSprite
     * @memberof PIXI
     * @see PIXI.extras.TilingSprite
     * @deprecated since version 3.0.0
     */
    TilingSprite: {
        get: function()
        {
            console.warn('The TilingSprite class has been moved to extras.TilingSprite, please use extras.TilingSprite from now on.');
            return extras.TilingSprite;
        }
    },

    /**
     * @class
     * @private
     * @name BitmapText
     * @memberof PIXI
     * @see PIXI.extras.BitmapText
     * @deprecated since version 3.0.0
     */
    BitmapText: {
        get: function()
        {
            console.warn('The BitmapText class has been moved to extras.BitmapText, please use extras.BitmapText from now on.');
            return extras.BitmapText;
        }
    },

    /**
     * @class
     * @private
     * @name blendModes
     * @memberof PIXI
     * @see PIXI.BLEND_MODES
     * @deprecated since version 3.0.0
     */
    blendModes: {
        get: function()
        {
            console.warn('The blendModes has been moved to BLEND_MODES, please use BLEND_MODES from now on.');
            return core.BLEND_MODES;
        }
    },

    /**
     * @class
     * @private
     * @name scaleModes
     * @memberof PIXI
     * @see PIXI.SCALE_MODES
     * @deprecated since version 3.0.0
     */
    scaleModes: {
        get: function()
        {
            console.warn('The scaleModes has been moved to SCALE_MODES, please use SCALE_MODES from now on.');
            return core.SCALE_MODES;
        }
    },

    /**
     * @class
     * @private
     * @name BaseTextureCache
     * @memberof PIXI
     * @see PIXI.utils.BaseTextureCache
     * @deprecated since version 3.0.0
     */
    BaseTextureCache: {
        get: function ()
        {
            console.warn('The BaseTextureCache class has been moved to utils.BaseTextureCache, please use utils.BaseTextureCache from now on.');
            return core.utils.BaseTextureCache;
        }
    },

    /**
     * @class
     * @private
     * @name TextureCache
     * @memberof PIXI
     * @see PIXI.utils.TextureCache
     * @deprecated since version 3.0.0
     */
    TextureCache: {
        get: function ()
        {
            console.warn('The TextureCache class has been moved to utils.TextureCache, please use utils.TextureCache from now on.');
            return core.utils.TextureCache;
        }
    },

    /**
     * @namespace
     * @private
     * @name math
     * @memberof PIXI
     * @see PIXI
     * @deprecated since version 3.0.6
     */
    math: {
        get: function ()
        {
            console.warn('The math namespace is deprecated, please access members already accessible on PIXI.');
            return core;
        }
    }
});

/**
 * @method
 * @private
 * @name PIXI.Sprite#setTexture
 * @see PIXI.Sprite#texture
 * @deprecated since version 3.0.0
 */
core.Sprite.prototype.setTexture = function(texture)
{
    this.texture = texture;
    console.warn('setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;');
};

/**
 * @method
 * @name PIXI.extras.BitmapText#setText
 * @see PIXI.extras.BitmapText#text
 * @deprecated since version 3.0.0
 */
extras.BitmapText.prototype.setText = function(text)
{
    this.text = text;
    console.warn('setText is now deprecated, please use the text property, e.g : myBitmapText.text = \'my text\';');
};

/**
 * @method
 * @name PIXI.Text#setText
 * @see PIXI.Text#text
 * @deprecated since version 3.0.0
 */
core.Text.prototype.setText = function(text)
{
    this.text = text;
    console.warn('setText is now deprecated, please use the text property, e.g : myText.text = \'my text\';');
};

/**
 * @method
 * @name PIXI.Text#setStyle
 * @see PIXI.Text#style
 * @deprecated since version 3.0.0
 */
core.Text.prototype.setStyle = function(style)
{
    this.style = style;
    console.warn('setStyle is now deprecated, please use the style property, e.g : myText.style = style;');
};

/**
 * @method
 * @name PIXI.Texture#setFrame
 * @see PIXI.Texture#setFrame
 * @deprecated since version 3.0.0
 */
core.Texture.prototype.setFrame = function(frame)
{
    this.frame = frame;
    console.warn('setFrame is now deprecated, please use the frame property, e.g : myTexture.frame = frame;');
};

Object.defineProperties(filters, {

    /**
     * @class
     * @private
     * @name PIXI.filters.AbstractFilter
     * @see PIXI.AbstractFilter
     * @deprecated since version 3.0.6
     */
    AbstractFilter: {
        get: function()
        {
            console.warn('filters.AbstractFilter is an undocumented alias, please use AbstractFilter from now on.');
            return core.AbstractFilter;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.filters.FXAAFilter
     * @see PIXI.FXAAFilter
     * @deprecated since version 3.0.6
     */
    FXAAFilter: {
        get: function()
        {
            console.warn('filters.FXAAFilter is an undocumented alias, please use FXAAFilter from now on.');
            return core.FXAAFilter;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.filters.SpriteMaskFilter
     * @see PIXI.SpriteMaskFilter
     * @deprecated since version 3.0.6
     */
    SpriteMaskFilter: {
        get: function()
        {
            console.warn('filters.SpriteMaskFilter is an undocumented alias, please use SpriteMaskFilter from now on.');
            return core.SpriteMaskFilter;
        }
    }
});

/**
 * @method
 * @name PIXI.utils.uuid
 * @see PIXI.utils.uid
 * @deprecated since version 3.0.6
 */
core.utils.uuid = function ()
{
    console.warn('utils.uuid() is deprecated, please use utils.uid() from now on.');
    return core.utils.uid();
};

},{"./core":29,"./extras":86,"./filters":103,"./mesh":128}],80:[function(require,module,exports){
var core = require('../core');

/**
 * A BitmapText object will create a line or multiple lines of text using bitmap font. To
 * split a line you can use '\n', '\r' or '\r\n' in your string. You can generate the fnt files using:
 *
 * A BitmapText can only be created when the font is loaded
 *
 * ```js
 * // in this case the font is in a file called 'desyrel.fnt'
 * var bitmapText = new PIXI.extras.BitmapText("text using a fancy font!", {font: "35px Desyrel", align: "right"});
 * ```
 *
 *
 * http://www.angelcode.com/products/bmfont/ for windows or
 * http://www.bmglyph.com/ for mac.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.extras
 * @param text {string} The copy that you would like the text to display
 * @param style {object} The style parameters
 * @param style.font {string|object} The font descriptor for the object, can be passed as a string of form
 *      "24px FontName" or "FontName" or as an object with explicit name/size properties.
 * @param [style.font.name] {string} The bitmap font id
 * @param [style.font.size] {number} The size of the font in pixels, e.g. 24
 * @param [style.align='left'] {string} Alignment for multiline text ('left', 'center' or 'right'), does not affect
 *      single line text
 * @param [style.tint=0xFFFFFF] {number} The tint color
 */
function BitmapText(text, style)
{
    core.Container.call(this);

    style = style || {};

    /**
     * The width of the overall text, different from fontSize,
     * which is defined in the style object
     *
     * @member {number}
     * @readOnly
     */
    this.textWidth = 0;

    /**
     * The height of the overall text, different from fontSize,
     * which is defined in the style object
     *
     * @member {number}
     * @readOnly
     */
    this.textHeight = 0;

    /**
     * Private tracker for the letter sprite pool.
     *
     * @member {PIXI.Sprite[]}
     * @private
     */
    this._glyphs = [];

    /**
     * Private tracker for the current style.
     *
     * @member {object}
     * @private
     */
    this._font = {
        tint: style.tint !== undefined ? style.tint : 0xFFFFFF,
        align: style.align || 'left',
        name: null,
        size: 0
    };

    /**
     * Private tracker for the current font.
     *
     * @member {object}
     * @private
     */
    this.font = style.font; // run font setter

    /**
     * Private tracker for the current text.
     *
     * @member {string}
     * @private
     */
    this._text = text;

    /**
     * The max width of this bitmap text in pixels. If the text provided is longer than the value provided, line breaks will be automatically inserted in the last whitespace.
     * Disable by setting value to 0
     *
     * @member {number}
     */
    this.maxWidth = 0;

    /**
     * The max line height. This is useful when trying to use the total height of the Text, ie: when trying to vertically align.
     *
     * @member {number}
     */
    this.maxLineHeight = 0;

    /**
     * The dirty state of this object.
     *
     * @member {boolean}
     */
    this.dirty = false;

    this.updateText();
}

// constructor
BitmapText.prototype = Object.create(core.Container.prototype);
BitmapText.prototype.constructor = BitmapText;
module.exports = BitmapText;

Object.defineProperties(BitmapText.prototype, {
    /**
     * The tint of the BitmapText object
     *
     * @member {number}
     * @memberof PIXI.extras.BitmapText#
     */
    tint: {
        get: function ()
        {
            return this._font.tint;
        },
        set: function (value)
        {
            this._font.tint = (typeof value === 'number' && value >= 0) ? value : 0xFFFFFF;

            this.dirty = true;
        }
    },

    /**
     * The alignment of the BitmapText object
     *
     * @member {string}
     * @default 'left'
     * @memberof PIXI.extras.BitmapText#
     */
    align: {
        get: function ()
        {
            return this._font.align;
        },
        set: function (value)
        {
            this._font.align = value || 'left';

            this.dirty = true;
        }
    },

    /**
     * The font descriptor of the BitmapText object
     *
     * @member {Font}
     * @memberof PIXI.extras.BitmapText#
     */
    font: {
        get: function ()
        {
            return this._font;
        },
        set: function (value)
        {
            if (!value) {
                return;
            }

            if (typeof value === 'string') {
                value = value.split(' ');

                this._font.name = value.length === 1 ? value[0] : value.slice(1).join(' ');
                this._font.size = value.length >= 2 ? parseInt(value[0], 10) : BitmapText.fonts[this._font.name].size;
            }
            else {
                this._font.name = value.name;
                this._font.size = typeof value.size === 'number' ? value.size : parseInt(value.size, 10);
            }

            this.dirty = true;
        }
    },

    /**
     * The text of the BitmapText object
     *
     * @member {string}
     * @memberof PIXI.extras.BitmapText#
     */
    text: {
        get: function ()
        {
            return this._text;
        },
        set: function (value)
        {
            value = value.toString() || ' ';
            if (this._text === value)
            {
                return;
            }
            this._text = value;
            this.dirty = true;
        }
    }
});

/**
 * Renders text and updates it when needed
 *
 * @private
 */
BitmapText.prototype.updateText = function ()
{
    var data = BitmapText.fonts[this._font.name];
    var pos = new core.Point();
    var prevCharCode = null;
    var chars = [];
    var lastLineWidth = 0;
    var maxLineWidth = 0;
    var lineWidths = [];
    var line = 0;
    var scale = this._font.size / data.size;
    var lastSpace = -1;
    var maxLineHeight = 0;

    for (var i = 0; i < this.text.length; i++)
    {
        var charCode = this.text.charCodeAt(i);
        lastSpace = /(\s)/.test(this.text.charAt(i)) ? i : lastSpace;

        if (/(?:\r\n|\r|\n)/.test(this.text.charAt(i)))
        {
            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }

        if (lastSpace !== -1 && this.maxWidth > 0 && pos.x * scale > this.maxWidth)
        {
            core.utils.removeItems(chars, lastSpace, i - lastSpace);
            i = lastSpace;
            lastSpace = -1;

            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }

        var charData = data.chars[charCode];

        if (!charData)
        {
            continue;
        }

        if (prevCharCode && charData.kerning[prevCharCode])
        {
            pos.x += charData.kerning[prevCharCode];
        }

        chars.push({texture:charData.texture, line: line, charCode: charCode, position: new core.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)});
        lastLineWidth = pos.x + (charData.texture.width + charData.xOffset);
        pos.x += charData.xAdvance;
        maxLineHeight = Math.max(maxLineHeight, (charData.yOffset + charData.texture.height));
        prevCharCode = charCode;
    }

    lineWidths.push(lastLineWidth);
    maxLineWidth = Math.max(maxLineWidth, lastLineWidth);

    var lineAlignOffsets = [];

    for (i = 0; i <= line; i++)
    {
        var alignOffset = 0;

        if (this._font.align === 'right')
        {
            alignOffset = maxLineWidth - lineWidths[i];
        }
        else if (this._font.align === 'center')
        {
            alignOffset = (maxLineWidth - lineWidths[i]) / 2;
        }

        lineAlignOffsets.push(alignOffset);
    }

    var lenChars = chars.length;
    var tint = this.tint;

    for (i = 0; i < lenChars; i++)
    {
        var c = this._glyphs[i]; // get the next glyph sprite

        if (c)
        {
            c.texture = chars[i].texture;
        }
        else
        {
            c = new core.Sprite(chars[i].texture);
            this._glyphs.push(c);
        }

        c.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
        c.position.y = chars[i].position.y * scale;
        c.scale.x = c.scale.y = scale;
        c.tint = tint;

        if (!c.parent)
        {
            this.addChild(c);
        }
    }

    // remove unnecessary children.
    for (i = lenChars; i < this._glyphs.length; ++i)
    {
        this.removeChild(this._glyphs[i]);
    }

    this.textWidth = maxLineWidth * scale;
    this.textHeight = (pos.y + data.lineHeight) * scale;
    this.maxLineHeight = maxLineHeight * scale;
};

/**
 * Updates the transform of this object
 *
 * @private
 */
BitmapText.prototype.updateTransform = function ()
{
    this.validate();
    this.containerUpdateTransform();
};

/**
 * Validates text before calling parent's getLocalBounds
 *
 * @return {PIXI.Rectangle} The rectangular bounding area
 */

BitmapText.prototype.getLocalBounds = function()
{
    this.validate();
    return core.Container.prototype.getLocalBounds.call(this);
};

/**
 * Updates text when needed
 *
 * @private
 */
BitmapText.prototype.validate = function()
{
    if (this.dirty)
    {
        this.updateText();
        this.dirty = false;
    }
};

BitmapText.fonts = {};

},{"../core":29}],81:[function(require,module,exports){
var core = require('../core');

/**
 * A MovieClip is a simple way to display an animation depicted by a list of textures.
 *
 * ```js
 * var alienImages = ["image_sequence_01.png","image_sequence_02.png","image_sequence_03.png","image_sequence_04.png"];
 * var textureArray = [];
 *
 * for (var i=0; i < 4; i++)
 * {
 *      var texture = PIXI.Texture.fromImage(alienImages[i]);
 *      textureArray.push(texture);
 * };
 *
 * var mc = new PIXI.MovieClip(textureArray);
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
 * @param textures {PIXI.Texture[]|Object[]} an array of {@link PIXI.Texture} or frame objects that make up the animation
 * @param textures[].texture {PIXI.Texture} the {@link PIXI.Texture} of the frame
 * @param textures[].time {number} the duration of the frame in ms
 */
function MovieClip(textures)
{
    core.Sprite.call(this, textures[0] instanceof core.Texture ? textures[0] : textures[0].texture);

    /**
     * @private
     */
    this._textures = null;

    /**
     * @private
     */
    this._durations = null;

    this.textures = textures;

    /**
     * The speed that the MovieClip will play at. Higher is faster, lower is slower
     *
     * @member {number}
     * @default 1
     */
    this.animationSpeed = 1;

    /**
     * Whether or not the movie clip repeats after playing.
     *
     * @member {boolean}
     * @default true
     */
    this.loop = true;

    /**
     * Function to call when a MovieClip finishes playing
     *
     * @method
     * @memberof PIXI.extras.MovieClip#
     */
    this.onComplete = null;

    /**
     * Elapsed time since animation has been started, used internally to display current texture
     *
     * @member {number}
     * @private
     */
    this._currentTime = 0;

    /**
     * Indicates if the MovieClip is currently playing
     *
     * @member {boolean}
     * @readonly
     */
    this.playing = false;
}

// constructor
MovieClip.prototype = Object.create(core.Sprite.prototype);
MovieClip.prototype.constructor = MovieClip;
module.exports = MovieClip;

Object.defineProperties(MovieClip.prototype, {
    /**
     * totalFrames is the total number of frames in the MovieClip. This is the same as number of textures
     * assigned to the MovieClip.
     *
     * @member {number}
     * @memberof PIXI.extras.MovieClip#
     * @default 0
     * @readonly
     */
    totalFrames: {
        get: function()
        {
            return this._textures.length;
        }
    },

    /**
     * The array of textures used for this MovieClip
     *
     * @member {PIXI.Texture[]}
     * @memberof PIXI.extras.MovieClip#
     *
     */
    textures: {
        get: function ()
        {
            return this._textures;
        },
        set: function (value)
        {
            if(value[0] instanceof core.Texture)
            {
                this._textures = value;
                this._durations = null;
            }
            else
            {
                this._textures = [];
                this._durations = [];
                for(var i = 0; i < value.length; i++)
                {
                    this._textures.push(value[i].texture);
                    this._durations.push(value[i].time);
                }
            }
        }
    },

    /**
    * The MovieClips current frame index
    *
    * @member {number}
    * @memberof PIXI.extras.MovieClip#
    * @readonly
    */
    currentFrame: {
        get: function ()
        {
            var currentFrame = Math.floor(this._currentTime) % this._textures.length;
            if (currentFrame < 0)
            {
                currentFrame += this._textures.length;
            }
            return currentFrame;
        }
    }

});

/**
 * Stops the MovieClip
 *
 */
MovieClip.prototype.stop = function ()
{
    if(!this.playing)
    {
        return;
    }

    this.playing = false;
    core.ticker.shared.remove(this.update, this);
};

/**
 * Plays the MovieClip
 *
 */
MovieClip.prototype.play = function ()
{
    if(this.playing)
    {
        return;
    }

    this.playing = true;
    core.ticker.shared.add(this.update, this);
};

/**
 * Stops the MovieClip and goes to a specific frame
 *
 * @param frameNumber {number} frame index to stop at
 */
MovieClip.prototype.gotoAndStop = function (frameNumber)
{
    this.stop();

    this._currentTime = frameNumber;

    this._texture = this._textures[this.currentFrame];
};

/**
 * Goes to a specific frame and begins playing the MovieClip
 *
 * @param frameNumber {number} frame index to start at
 */
MovieClip.prototype.gotoAndPlay = function (frameNumber)
{
    this._currentTime = frameNumber;

    this.play();
};

/*
 * Updates the object transform for rendering
 * @private
 */
MovieClip.prototype.update = function (deltaTime)
{
    var elapsed = this.animationSpeed * deltaTime;

    if (this._durations !== null)
    {
        var lag = this._currentTime % 1 * this._durations[this.currentFrame];

        lag += elapsed / 60 * 1000;

        while (lag < 0)
        {
            this._currentTime--;
            lag += this._durations[this.currentFrame];
        }

        var sign = Math.sign(this.animationSpeed * deltaTime);
        this._currentTime = Math.floor(this._currentTime);

        while (lag >= this._durations[this.currentFrame])
        {
            lag -= this._durations[this.currentFrame] * sign;
            this._currentTime += sign;
        }

        this._currentTime += lag / this._durations[this.currentFrame];
    }
    else
    {
        this._currentTime += elapsed;
    }

    if (this._currentTime < 0 && !this.loop)
    {
        this.gotoAndStop(0);

        if (this.onComplete)
        {
            this.onComplete();
        }
    }
    else if (this._currentTime >= this._textures.length && !this.loop)
    {
        this.gotoAndStop(this._textures.length - 1);

        if (this.onComplete)
        {
            this.onComplete();
        }
    }
    else
    {
        this._texture = this._textures[this.currentFrame];
    }

};

/*
 * Stops the MovieClip and destroys it
 *
 */
MovieClip.prototype.destroy = function ( )
{
    this.stop();
    core.Sprite.prototype.destroy.call(this);
};

/**
 * A short hand way of creating a movieclip from an array of frame ids
 *
 * @static
 * @param frames {string[]} the array of frames ids the movieclip will use as its texture frames
 */
MovieClip.fromFrames = function (frames)
{
    var textures = [];

    for (var i = 0; i < frames.length; ++i)
    {
        textures.push(new core.Texture.fromFrame(frames[i]));
    }

    return new MovieClip(textures);
};

/**
 * A short hand way of creating a movieclip from an array of image ids
 *
 * @static
 * @param images {string[]} the array of image urls the movieclip will use as its texture frames
 */
MovieClip.fromImages = function (images)
{
    var textures = [];

    for (var i = 0; i < images.length; ++i)
    {
        textures.push(new core.Texture.fromImage(images[i]));
    }

    return new MovieClip(textures);
};
},{"../core":29}],82:[function(require,module,exports){
var core = require('../core'),
    // a sprite use dfor rendering textures..
    tempPoint = new core.Point(),
    CanvasTinter = require('../core/renderers/canvas/utils/CanvasTinter');

/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
 * @param texture {Texture} the texture of the tiling sprite
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 */
function TilingSprite(texture, width, height)
{
    core.Sprite.call(this, texture);

    /**
     * The scaling of the image that is being tiled
     *
     * @member {PIXI.Point}
     */
    this.tileScale = new core.Point(1,1);


    /**
     * The offset position of the image that is being tiled
     *
     * @member {PIXI.Point}
     */
    this.tilePosition = new core.Point(0,0);

    ///// private

    /**
     * The with of the tiling sprite
     *
     * @member {number}
     * @private
     */
    this._width = width || 100;

    /**
     * The height of the tiling sprite
     *
     * @member {number}
     * @private
     */
    this._height = height || 100;

    /**
     * An internal WebGL UV cache.
     *
     * @member {PIXI.TextureUvs}
     * @private
     */
    this._uvs = new core.TextureUvs();

    this._canvasPattern = null;

    //TODO move..
    this.shader = new core.AbstractFilter(

      [
        'precision lowp float;',
        'attribute vec2 aVertexPosition;',
        'attribute vec2 aTextureCoord;',
        'attribute vec4 aColor;',

        'uniform mat3 projectionMatrix;',

        'uniform vec4 uFrame;',
        'uniform vec4 uTransform;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'void main(void){',
        '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',

        '   vec2 coord = aTextureCoord;',
        '   coord -= uTransform.xy;',
        '   coord /= uTransform.zw;',
        '   vTextureCoord = coord;',

        '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
        '}'
      ].join('\n'),
      [
        'precision lowp float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform sampler2D uSampler;',
        'uniform vec4 uFrame;',
        'uniform vec2 uPixelSize;',

        'void main(void){',

        '   vec2 coord = mod(vTextureCoord, uFrame.zw);',
        '   coord = clamp(coord, uPixelSize, uFrame.zw - uPixelSize);',
        '   coord += uFrame.xy;',

        '   gl_FragColor =  texture2D(uSampler, coord) * vColor ;',
        '}'
      ].join('\n'),

            // set the uniforms
            {
                uFrame: { type: '4fv', value: [0,0,1,1] },
                uTransform: { type: '4fv', value: [0,0,1,1] },
                uPixelSize : { type : '2fv', value: [1, 1]}
            }
      );
}

TilingSprite.prototype = Object.create(core.Sprite.prototype);
TilingSprite.prototype.constructor = TilingSprite;
module.exports = TilingSprite;


Object.defineProperties(TilingSprite.prototype, {
    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.extras.TilingSprite#
     */
    width: {
        get: function ()
        {
            return this._width;
        },
        set: function (value)
        {
            this._width = value;
        }
    },

    /**
     * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.extras.TilingSprite#
     */
    height: {
        get: function ()
        {
            return this._height;
        },
        set: function (value)
        {
            this._height = value;
        }
    }
});

TilingSprite.prototype._onTextureUpdate = function ()
{
    return;
};


/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer}
 * @private
 */
TilingSprite.prototype._renderWebGL = function (renderer)
{
    // tweak our texture temporarily..
    var texture = this._texture;

    if(!texture || !texture._uvs)
    {
        return;
    }

    var tempUvs = texture._uvs,
        tempWidth = texture._frame.width,
        tempHeight = texture._frame.height,
        tw = texture.baseTexture.width,
        th = texture.baseTexture.height;

    texture._uvs = this._uvs;
    texture._frame.width = this.width;
    texture._frame.height = this.height;

    this.shader.uniforms.uPixelSize.value[0] = 1.0/tw;
    this.shader.uniforms.uPixelSize.value[1] = 1.0/th;

    this.shader.uniforms.uFrame.value[0] = tempUvs.x0;
    this.shader.uniforms.uFrame.value[1] = tempUvs.y0;
    this.shader.uniforms.uFrame.value[2] = tempUvs.x1 - tempUvs.x0;
    this.shader.uniforms.uFrame.value[3] = tempUvs.y2 - tempUvs.y0;

    this.shader.uniforms.uTransform.value[0] = (this.tilePosition.x % (tempWidth * this.tileScale.x)) / this._width;
    this.shader.uniforms.uTransform.value[1] = (this.tilePosition.y % (tempHeight * this.tileScale.y)) / this._height;
    this.shader.uniforms.uTransform.value[2] = ( tw / this._width ) * this.tileScale.x;
    this.shader.uniforms.uTransform.value[3] = ( th / this._height ) * this.tileScale.y;

    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render(this);

    texture._uvs = tempUvs;
    texture._frame.width = tempWidth;
    texture._frame.height = tempHeight;
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} a reference to the canvas renderer
 * @private
 */
TilingSprite.prototype._renderCanvas = function (renderer)
{
    var texture = this._texture;

    if (!texture.baseTexture.hasLoaded)
    {
      return;
    }

    var context = renderer.context,
        transform = this.worldTransform,
        resolution = renderer.resolution,
        baseTexture = texture.baseTexture,
        modX = (this.tilePosition.x / this.tileScale.x) % texture._frame.width,
        modY = (this.tilePosition.y / this.tileScale.y) % texture._frame.height;

    // create a nice shiny pattern!
    // TODO this needs to be refreshed if texture changes..
    if(!this._canvasPattern)
    {
        // cut an object from a spritesheet..
        var tempCanvas = new core.CanvasBuffer(texture._frame.width, texture._frame.height);

        // Tint the tiling sprite
        if (this.tint !== 0xFFFFFF)
        {
            if (this.cachedTint !== this.tint)
            {
                this.cachedTint = this.tint;

                this.tintedTexture = CanvasTinter.getTintedTexture(this, this.tint);
            }
            tempCanvas.context.drawImage(this.tintedTexture, 0, 0);
        }
        else
        {
            tempCanvas.context.drawImage(baseTexture.source, -texture._frame.x, -texture._frame.y);
        }
        this._canvasPattern = tempCanvas.context.createPattern( tempCanvas.canvas, 'repeat' );
    }

    // set context state..
    context.globalAlpha = this.worldAlpha;
    context.setTransform(transform.a * resolution,
                       transform.b * resolution,
                       transform.c * resolution,
                       transform.d * resolution,
                       transform.tx * resolution,
                       transform.ty * resolution);

    // TODO - this should be rolled into the setTransform above..
    context.scale(this.tileScale.x,this.tileScale.y);

    context.translate(modX + (this.anchor.x * -this._width ),
                      modY + (this.anchor.y * -this._height));

    // check blend mode
    var compositeOperation = renderer.blendModes[this.blendMode];
    if (compositeOperation !== renderer.context.globalCompositeOperation)
    {
        context.globalCompositeOperation = compositeOperation;
    }

    // fill the pattern!
    context.fillStyle = this._canvasPattern;
    context.fillRect(-modX,
                     -modY,
                     this._width / this.tileScale.x,
                     this._height / this.tileScale.y);


    //TODO - pretty sure this can be deleted...
    //context.translate(-this.tilePosition.x + (this.anchor.x * this._width), -this.tilePosition.y + (this.anchor.y * this._height));
    //context.scale(1 / this.tileScale.x, 1 / this.tileScale.y);
};


/**
 * Returns the framing rectangle of the sprite as a Rectangle object
*
 * @return {PIXI.Rectangle} the framing rectangle
 */
TilingSprite.prototype.getBounds = function ()
{
    var width = this._width;
    var height = this._height;

    var w0 = width * (1-this.anchor.x);
    var w1 = width * -this.anchor.x;

    var h0 = height * (1-this.anchor.y);
    var h1 = height * -this.anchor.y;

    var worldTransform = this.worldTransform;

    var a = worldTransform.a;
    var b = worldTransform.b;
    var c = worldTransform.c;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;

    var x1 = a * w1 + c * h1 + tx;
    var y1 = d * h1 + b * w1 + ty;

    var x2 = a * w0 + c * h1 + tx;
    var y2 = d * h1 + b * w0 + ty;

    var x3 = a * w0 + c * h0 + tx;
    var y3 = d * h0 + b * w0 + ty;

    var x4 =  a * w1 + c * h0 + tx;
    var y4 =  d * h0 + b * w1 + ty;

    var minX,
        maxX,
        minY,
        maxY;

    minX = x1;
    minX = x2 < minX ? x2 : minX;
    minX = x3 < minX ? x3 : minX;
    minX = x4 < minX ? x4 : minX;

    minY = y1;
    minY = y2 < minY ? y2 : minY;
    minY = y3 < minY ? y3 : minY;
    minY = y4 < minY ? y4 : minY;

    maxX = x1;
    maxX = x2 > maxX ? x2 : maxX;
    maxX = x3 > maxX ? x3 : maxX;
    maxX = x4 > maxX ? x4 : maxX;

    maxY = y1;
    maxY = y2 > maxY ? y2 : maxY;
    maxY = y3 > maxY ? y3 : maxY;
    maxY = y4 > maxY ? y4 : maxY;

    var bounds = this._bounds;

    bounds.x = minX;
    bounds.width = maxX - minX;

    bounds.y = minY;
    bounds.height = maxY - minY;

    // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
    this._currentBounds = bounds;

    return bounds;
};

/**
 * Checks if a point is inside this tiling sprite
 * @param point {PIXI.Point} the point to check
 */
TilingSprite.prototype.containsPoint = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var width = this._width;
    var height = this._height;
    var x1 = -width * this.anchor.x;
    var y1;

    if ( tempPoint.x > x1 && tempPoint.x < x1 + width )
    {
        y1 = -height * this.anchor.y;

        if ( tempPoint.y > y1 && tempPoint.y < y1 + height )
        {
            return true;
        }
    }

    return false;
};

/**
 * Destroys this tiling sprite
 *
 */
TilingSprite.prototype.destroy = function () {
    core.Sprite.prototype.destroy.call(this);

    this.tileScale = null;
    this._tileScaleOffset = null;
    this.tilePosition = null;

    this._uvs = null;
};

/**
 * Helper function that creates a tiling sprite that will use a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {string} The frame Id of the texture in the cache
 * @return {PIXI.extras.TilingSprite} A new TilingSprite using a texture from the texture cache matching the frameId
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 */
TilingSprite.fromFrame = function (frameId,width,height)
{
    var texture = core.utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache ' + this);
    }

    return new TilingSprite(texture,width,height);
};

/**
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @static
 * @param imageId {string} The image url of the texture
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 * @param [crossorigin=(auto)] {boolean} if you want to specify the cross-origin parameter
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} if you want to specify the scale mode, see {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.extras.TilingSprite} A new TilingSprite using a texture from the texture cache matching the image id
 */
TilingSprite.fromImage = function (imageId, width, height, crossorigin, scaleMode)
{
    return new TilingSprite(core.Texture.fromImage(imageId, crossorigin, scaleMode),width,height);
};

},{"../core":29,"../core/renderers/canvas/utils/CanvasTinter":48}],83:[function(require,module,exports){
var core = require('../core'),
    DisplayObject = core.DisplayObject,
    _tempMatrix = new core.Matrix();

DisplayObject.prototype._cacheAsBitmap = false;
DisplayObject.prototype._originalRenderWebGL = null;
DisplayObject.prototype._originalRenderCanvas = null;

DisplayObject.prototype._originalUpdateTransform = null;
DisplayObject.prototype._originalHitTest = null;
DisplayObject.prototype._originalDestroy = null;
DisplayObject.prototype._cachedSprite = null;

Object.defineProperties(DisplayObject.prototype, {

    /**
     * Set this to true if you want this display object to be cached as a bitmap.
     * This basically takes a snap shot of the display object as it is at that moment. It can provide a performance benefit for complex static displayObjects.
     * To remove simply set this property to 'false'
     *
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    cacheAsBitmap: {
        get: function ()
        {
            return this._cacheAsBitmap;
        },
        set: function (value)
        {
            if (this._cacheAsBitmap === value)
            {
                return;
            }

            this._cacheAsBitmap = value;

            if (value)
            {
                this._originalRenderWebGL = this.renderWebGL;
                this._originalRenderCanvas = this.renderCanvas;

                this._originalUpdateTransform = this.updateTransform;
                this._originalGetBounds = this.getBounds;

                this._originalDestroy = this.destroy;

                this._originalContainsPoint = this.containsPoint;

                this.renderWebGL = this._renderCachedWebGL;
                this.renderCanvas = this._renderCachedCanvas;

                this.destroy = this._cacheAsBitmapDestroy;

            }
            else
            {
                if (this._cachedSprite)
                {
                    this._destroyCachedDisplayObject();
                }

                this.renderWebGL = this._originalRenderWebGL;
                this.renderCanvas = this._originalRenderCanvas;
                this.getBounds = this._originalGetBounds;

                this.destroy = this._originalDestroy;

                this.updateTransform = this._originalUpdateTransform;
                this.containsPoint = this._originalContainsPoint;
            }
        }
    }
});
/**
* Renders a cached version of the sprite with WebGL
*
* @param renderer {PIXI.WebGLRenderer} the WebGL renderer
* @private
*/
DisplayObject.prototype._renderCachedWebGL = function (renderer)
{
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
    {
        return;
    }

    this._initCachedDisplayObject( renderer );

    this._cachedSprite.worldAlpha = this.worldAlpha;

    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render( this._cachedSprite );
};

/**
* Prepares the WebGL renderer to cache the sprite
*
* @param renderer {PIXI.WebGLRenderer} the WebGL renderer
* @private
*/
DisplayObject.prototype._initCachedDisplayObject = function (renderer)
{
    if(this._cachedSprite)
    {
        return;
    }

    // first we flush anything left in the renderer (otherwise it would get rendered to the cached texture)
    renderer.currentRenderer.flush();
    //this.filters= [];
    // next we find the dimensions of the untransformed object
    // this function also calls updatetransform on all its children as part of the measuring. This means we don't need to update the transform again in this function
    // TODO pass an object to clone too? saves having to create a new one each time!
    var bounds = this.getLocalBounds().clone();

    // add some padding!
    if(this._filters)
    {
        var padding = this._filters[0].padding;
        bounds.x -= padding;
        bounds.y -= padding;

        bounds.width += padding * 2;
        bounds.height += padding * 2;
    }

    // for now we cache the current renderTarget that the webGL renderer is currently using.
    // this could be more elegent..
    var cachedRenderTarget = renderer.currentRenderTarget;
    // We also store the filter stack - I will definitely look to change how this works a little later down the line.
    var stack = renderer.filterManager.filterStack;

    // this renderTexture will be used to store the cached DisplayObject
    var renderTexture = new core.RenderTexture(renderer, bounds.width | 0, bounds.height | 0);

    // need to set //
    var m = _tempMatrix;

    m.tx = -bounds.x;
    m.ty = -bounds.y;



    // set all properties to there original so we can render to a texture
    this.renderWebGL = this._originalRenderWebGL;

    renderTexture.render(this, m, true, true);

    // now restore the state be setting the new properties
    renderer.setRenderTarget(cachedRenderTarget);
    renderer.filterManager.filterStack = stack;

    this.renderWebGL     = this._renderCachedWebGL;
    this.updateTransform = this.displayObjectUpdateTransform;
    this.getBounds       = this._getCachedBounds;


    // create our cached sprite
    this._cachedSprite = new core.Sprite(renderTexture);
    this._cachedSprite.worldTransform = this.worldTransform;
    this._cachedSprite.anchor.x = -( bounds.x / bounds.width );
    this._cachedSprite.anchor.y = -( bounds.y / bounds.height );

    // restore the transform of the cached sprite to avoid the nasty flicker..
    this.updateTransform();

    // map the hit test..
    this.containsPoint = this._cachedSprite.containsPoint.bind(this._cachedSprite);
};

/**
* Renders a cached version of the sprite with canvas
*
* @param renderer {PIXI.CanvasRenderer} the Canvas renderer
* @private
*/
DisplayObject.prototype._renderCachedCanvas = function (renderer)
{
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
    {
        return;
    }

    this._initCachedDisplayObjectCanvas( renderer );

    this._cachedSprite.worldAlpha = this.worldAlpha;

    this._cachedSprite.renderCanvas(renderer);
};

//TODO this can be the same as the webGL verison.. will need to do a little tweaking first though..
/**
* Prepares the Canvas renderer to cache the sprite
*
* @param renderer {PIXI.CanvasRenderer} the Canvas renderer
* @private
*/
DisplayObject.prototype._initCachedDisplayObjectCanvas = function (renderer)
{
    if(this._cachedSprite)
    {
        return;
    }

    //get bounds actually transforms the object for us already!
    var bounds = this.getLocalBounds();

    var cachedRenderTarget = renderer.context;

    var renderTexture = new core.RenderTexture(renderer, bounds.width | 0, bounds.height | 0);

    // need to set //
    var m = _tempMatrix;

    m.tx = -bounds.x;
    m.ty = -bounds.y;

    // set all properties to there original so we can render to a texture
    this.renderCanvas = this._originalRenderCanvas;

    renderTexture.render(this, m, true);

    // now restore the state be setting the new properties
    renderer.context = cachedRenderTarget;

    this.renderCanvas = this._renderCachedCanvas;
    this.updateTransform = this.displayObjectUpdateTransform;
    this.getBounds  = this._getCachedBounds;


    // create our cached sprite
    this._cachedSprite = new core.Sprite(renderTexture);
    this._cachedSprite.worldTransform = this.worldTransform;
    this._cachedSprite.anchor.x = -( bounds.x / bounds.width );
    this._cachedSprite.anchor.y = -( bounds.y / bounds.height );

    this.updateTransform();

    this.containsPoint = this._cachedSprite.containsPoint.bind(this._cachedSprite);
};

/**
* Calculates the bounds of the cached sprite
*
* @private
*/
DisplayObject.prototype._getCachedBounds = function ()
{
    this._cachedSprite._currentBounds = null;

    return this._cachedSprite.getBounds();
};

/**
* Destroys the cached sprite.
*
* @private
*/
DisplayObject.prototype._destroyCachedDisplayObject = function ()
{
    this._cachedSprite._texture.destroy();
    this._cachedSprite = null;
};

DisplayObject.prototype._cacheAsBitmapDestroy = function ()
{
    this.cacheAsBitmap = false;
    this._originalDestroy();
};

},{"../core":29}],84:[function(require,module,exports){
var core = require('../core');

/**
 * The instance name of the object.
 *
 * @memberof PIXI.DisplayObject#
 * @member {string}
 */
core.DisplayObject.prototype.name = null;

/**
* Returns the display object in the container
*
* @memberof PIXI.Container#
* @param name {string} instance name
* @return {PIXI.DisplayObject}
*/
core.Container.prototype.getChildByName = function (name)
{
    for (var i = 0; i < this.children.length; i++)
    {
        if (this.children[i].name === name)
        {
            return this.children[i];
        }
    }
    return null;
};

},{"../core":29}],85:[function(require,module,exports){
var core = require('../core');

/**
* Returns the global position of the displayObject
*
* @memberof PIXI.DisplayObject#
* @param point {Point} the point to write the global value to. If null a new point will be returned
* @return {Point}
*/
core.DisplayObject.prototype.getGlobalPosition = function (point)
{
    point = point || new core.Point();

    if(this.parent)
    {
        this.displayObjectUpdateTransform();

        point.x = this.worldTransform.tx;
        point.y = this.worldTransform.ty;
    }
    else
    {
        point.x = this.position.x;
        point.y = this.position.y;
    }

    return point;
};

},{"../core":29}],86:[function(require,module,exports){
/**
 * @file        Main export of the PIXI extras library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

require('./cacheAsBitmap');
require('./getChildByName');
require('./getGlobalPosition');

/**
 * @namespace PIXI.extras
 */
module.exports = {
    MovieClip:      require('./MovieClip'),
    TilingSprite:   require('./TilingSprite'),
    BitmapText:     require('./BitmapText')
};

},{"./BitmapText":80,"./MovieClip":81,"./TilingSprite":82,"./cacheAsBitmap":83,"./getChildByName":84,"./getGlobalPosition":85}],87:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


// TODO (cengler) - The Y is flipped in this shader for some reason.

/**
 * @author Vico @vicocotea
 * original shader : https://www.shadertoy.com/view/lssGDj by @movAX13h
 */

/**
 * An ASCII filter.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function AsciiFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nuniform vec4 dimensions;\nuniform float pixelSize;\nuniform sampler2D uSampler;\n\nfloat character(float n, vec2 p)\n{\n    p = floor(p*vec2(4.0, -4.0) + 2.5);\n    if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y)\n    {\n        if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;\n    }\n    return 0.0;\n}\n\nvoid main()\n{\n    vec2 uv = gl_FragCoord.xy;\n\n    vec3 col = texture2D(uSampler, floor( uv / pixelSize ) * pixelSize / dimensions.xy).rgb;\n\n    float gray = (col.r + col.g + col.b) / 3.0;\n\n    float n =  65536.0;             // .\n    if (gray > 0.2) n = 65600.0;    // :\n    if (gray > 0.3) n = 332772.0;   // *\n    if (gray > 0.4) n = 15255086.0; // o\n    if (gray > 0.5) n = 23385164.0; // &\n    if (gray > 0.6) n = 15252014.0; // 8\n    if (gray > 0.7) n = 13199452.0; // @\n    if (gray > 0.8) n = 11512810.0; // #\n\n    vec2 p = mod( uv / ( pixelSize * 0.5 ), 2.0) - vec2(1.0);\n    col = col * character(n, p);\n\n    gl_FragColor = vec4(col, 1.0);\n}\n",
        // custom uniforms
        {
            dimensions: { type: '4fv', value: new Float32Array([0, 0, 0, 0]) },
            pixelSize:  { type: '1f', value: 8 }
        }
    );
}

AsciiFilter.prototype = Object.create(core.AbstractFilter.prototype);
AsciiFilter.prototype.constructor = AsciiFilter;
module.exports = AsciiFilter;

Object.defineProperties(AsciiFilter.prototype, {
    /**
     * The pixel size used by the filter.
     *
     * @member {number}
     * @memberof PIXI.filters.AsciiFilter#
     */
    size: {
        get: function ()
        {
            return this.uniforms.pixelSize.value;
        },
        set: function (value)
        {
            this.uniforms.pixelSize.value = value;
        }
    }
});

},{"../../core":29}],88:[function(require,module,exports){
var core = require('../../core'),
    BlurXFilter = require('../blur/BlurXFilter'),
    BlurYFilter = require('../blur/BlurYFilter');

/**
 * The BloomFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function BloomFilter()
{
    core.AbstractFilter.call(this);

    this.blurXFilter = new BlurXFilter();
    this.blurYFilter = new BlurYFilter();

    this.defaultFilter = new core.AbstractFilter();
}

BloomFilter.prototype = Object.create(core.AbstractFilter.prototype);
BloomFilter.prototype.constructor = BloomFilter;
module.exports = BloomFilter;

BloomFilter.prototype.applyFilter = function (renderer, input, output)
{
    var renderTarget = renderer.filterManager.getRenderTarget(true);

    //TODO - copyTexSubImage2D could be used here?
    this.defaultFilter.applyFilter(renderer, input, output);

    this.blurXFilter.applyFilter(renderer, input, renderTarget);

    renderer.blendModeManager.setBlendMode(core.BLEND_MODES.SCREEN);

    this.blurYFilter.applyFilter(renderer, renderTarget, output);

    renderer.blendModeManager.setBlendMode(core.BLEND_MODES.NORMAL);

    renderer.filterManager.returnRenderTarget(renderTarget);
};

Object.defineProperties(BloomFilter.prototype, {
    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @memberOf PIXI.filters.BloomFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.blurXFilter.blur = this.blurYFilter.blur = value;
        }
    },

    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @memberOf PIXI.filters.BloomFilter#
     * @default 2
     */
    blurX: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.blurXFilter.blur = value;
        }
    },

    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @memberOf PIXI.filters.BloomFilter#
     * @default 2
     */
    blurY: {
        get: function ()
        {
            return this.blurYFilter.blur;
        },
        set: function (value)
        {
            this.blurYFilter.blur = value;
        }
    }
});

},{"../../core":29,"../blur/BlurXFilter":91,"../blur/BlurYFilter":92}],89:[function(require,module,exports){
var core = require('../../core');


/**
 * The BlurDirFilter applies a Gaussian blur toward a direction to an object.
 *
 * @class
 * @param {number} dirX
 * @param {number} dirY
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function BlurDirFilter(dirX, dirY)
{
    core.AbstractFilter.call(this,
        // vertex shader
        "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform float dirX;\nuniform float dirY;\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[3];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[0] = aTextureCoord + vec2( (0.004 * strength) * dirX, (0.004 * strength) * dirY );\n    vBlurTexCoords[1] = aTextureCoord + vec2( (0.008 * strength) * dirX, (0.008 * strength) * dirY );\n    vBlurTexCoords[2] = aTextureCoord + vec2( (0.012 * strength) * dirX, (0.012 * strength) * dirY );\n\n    vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n",
        // fragment shader
        "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[3];\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = vec4(0.0);\n\n    gl_FragColor += texture2D(uSampler, vTextureCoord     ) * 0.3989422804014327;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 0]) * 0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 1]) * 0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 2]) * 0.004431848411938341;\n}\n",
        // set the uniforms
        {
            strength: { type: '1f', value: 1 },
            dirX: { type: '1f', value: dirX || 0 },
            dirY: { type: '1f', value: dirY || 0 }
        }
    );

    this.defaultFilter = new core.AbstractFilter();

    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @default 1
     */
    this.passes = 1;

    /**
     * Sets the X direction of the blur
     *
     * @member {number}
     * @default 0
     */
    this.dirX = dirX || 0;

    /**
     * Sets the Y direction of the blur
     *
     * @member {number}
     * @default 0
     */
    this.dirY = dirY || 0;

    this.strength = 4;
}

BlurDirFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurDirFilter.prototype.constructor = BlurDirFilter;
module.exports = BlurDirFilter;

BlurDirFilter.prototype.applyFilter = function (renderer, input, output, clear) {

    var shader = this.getShader(renderer);

    this.uniforms.strength.value = this.strength / 4 / this.passes * (input.frame.width / input.size.width);

    if (this.passes === 1) {
        renderer.filterManager.applyFilter(shader, input, output, clear);
    } else {
        var renderTarget = renderer.filterManager.getRenderTarget(true);

        renderer.filterManager.applyFilter(shader, input, renderTarget, clear);

        for(var i = 0; i < this.passes-2; i++)
        {
            //this.uniforms.strength.value = this.strength / 4 / (this.passes+(i*2)) * (input.frame.width / input.size.width);
            renderer.filterManager.applyFilter(shader, renderTarget, renderTarget, clear);
        }

        renderer.filterManager.applyFilter(shader, renderTarget, output, clear);

        renderer.filterManager.returnRenderTarget(renderTarget);
    }
};


Object.defineProperties(BlurDirFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurDirFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return this.strength;
        },
        set: function (value)
        {
            this.padding = value * 0.5;
            this.strength = value;
        }
    },
    /**
     * Sets the X direction of the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurYFilter#
     * @default 0
     */
    dirX: {
        get: function ()
        {
            return this.dirX;
        },
        set: function (value)
        {
            this.uniforms.dirX.value = value;
        }
    },
    /**
     * Sets the Y direction of the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurDirFilter#
     * @default 0
     */
    dirY: {
        get: function ()
        {
            return this.dirY;
        },
        set: function (value)
        {
            this.uniforms.dirY.value = value;
        }
    }
});

},{"../../core":29}],90:[function(require,module,exports){
var core = require('../../core'),
    BlurXFilter = require('./BlurXFilter'),
    BlurYFilter = require('./BlurYFilter');

/**
 * The BlurFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function BlurFilter()
{
    core.AbstractFilter.call(this);

    this.blurXFilter = new BlurXFilter();
    this.blurYFilter = new BlurYFilter();
}

BlurFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurFilter.prototype.constructor = BlurFilter;
module.exports = BlurFilter;

BlurFilter.prototype.applyFilter = function (renderer, input, output)
{
    var renderTarget = renderer.filterManager.getRenderTarget(true);

    this.blurXFilter.applyFilter(renderer, input, renderTarget);
    this.blurYFilter.applyFilter(renderer, renderTarget, output);

    renderer.filterManager.returnRenderTarget(renderTarget);
};

Object.defineProperties(BlurFilter.prototype, {
    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.padding = Math.abs(value) * 0.5;
            this.blurXFilter.blur = this.blurYFilter.blur = value;
        }
    },

    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurYFilter#
     * @default 1
     */
    passes: {
        get: function ()
        {
            return  this.blurXFilter.passes;
        },
        set: function (value)
        {
            this.blurXFilter.passes = this.blurYFilter.passes = value;
        }
    },

    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    blurX: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.blurXFilter.blur = value;
        }
    },

    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    blurY: {
        get: function ()
        {
            return this.blurYFilter.blur;
        },
        set: function (value)
        {
            this.blurYFilter.blur = value;
        }
    }
});

},{"../../core":29,"./BlurXFilter":91,"./BlurYFilter":92}],91:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * The BlurXFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function BlurXFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[6];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[ 0] = aTextureCoord + vec2(-0.012 * strength, 0.0);\n    vBlurTexCoords[ 1] = aTextureCoord + vec2(-0.008 * strength, 0.0);\n    vBlurTexCoords[ 2] = aTextureCoord + vec2(-0.004 * strength, 0.0);\n    vBlurTexCoords[ 3] = aTextureCoord + vec2( 0.004 * strength, 0.0);\n    vBlurTexCoords[ 4] = aTextureCoord + vec2( 0.008 * strength, 0.0);\n    vBlurTexCoords[ 5] = aTextureCoord + vec2( 0.012 * strength, 0.0);\n\n    vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n",
        // fragment shader
        "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[6];\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = vec4(0.0);\n\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 0])*0.004431848411938341;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 1])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 2])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vTextureCoord     )*0.3989422804014327;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 3])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 4])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 5])*0.004431848411938341;\n}\n",
        // set the uniforms
        {
            strength: { type: '1f', value: 1 }
        }
    );

    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @default 1
     */
    this.passes = 1;

    this.strength = 4;
}

BlurXFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurXFilter.prototype.constructor = BlurXFilter;
module.exports = BlurXFilter;

BlurXFilter.prototype.applyFilter = function (renderer, input, output, clear)
{
    var shader = this.getShader(renderer);

    this.uniforms.strength.value = this.strength / 4 / this.passes * (input.frame.width / input.size.width);

    if(this.passes === 1)
    {
        renderer.filterManager.applyFilter(shader, input, output, clear);
    }
    else
    {
        var renderTarget = renderer.filterManager.getRenderTarget(true);
        var flip = input;
        var flop = renderTarget;

        for(var i = 0; i < this.passes-1; i++)
        {
            renderer.filterManager.applyFilter(shader, flip, flop, true);

           var temp = flop;
           flop = flip;
           flip = temp;
        }

        renderer.filterManager.applyFilter(shader, flip, output, clear);

        renderer.filterManager.returnRenderTarget(renderTarget);
    }
};


Object.defineProperties(BlurXFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurXFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return  this.strength;
        },
        set: function (value)
        {
            this.padding =  Math.abs(value) * 0.5;
            this.strength = value;
        }
    }
});

},{"../../core":29}],92:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * The BlurYFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function BlurYFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[6];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[ 0] = aTextureCoord + vec2(0.0, -0.012 * strength);\n    vBlurTexCoords[ 1] = aTextureCoord + vec2(0.0, -0.008 * strength);\n    vBlurTexCoords[ 2] = aTextureCoord + vec2(0.0, -0.004 * strength);\n    vBlurTexCoords[ 3] = aTextureCoord + vec2(0.0,  0.004 * strength);\n    vBlurTexCoords[ 4] = aTextureCoord + vec2(0.0,  0.008 * strength);\n    vBlurTexCoords[ 5] = aTextureCoord + vec2(0.0,  0.012 * strength);\n\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n",
        // fragment shader
        "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[6];\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = vec4(0.0);\n\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 0])*0.004431848411938341;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 1])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 2])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vTextureCoord     )*0.3989422804014327;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 3])*0.2419707245191454;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 4])*0.05399096651318985;\n    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 5])*0.004431848411938341;\n}\n",
        // set the uniforms
        {
            strength: { type: '1f', value: 1 }
        }
    );

    this.passes = 1;
    this.strength = 4;
}

BlurYFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurYFilter.prototype.constructor = BlurYFilter;
module.exports = BlurYFilter;

BlurYFilter.prototype.applyFilter = function (renderer, input, output, clear)
{
    var shader = this.getShader(renderer);

    this.uniforms.strength.value = Math.abs(this.strength) / 4 / this.passes * (input.frame.height / input.size.height);

    if(this.passes === 1)
    {
        renderer.filterManager.applyFilter(shader, input, output, clear);
    }
    else
    {
        var renderTarget = renderer.filterManager.getRenderTarget(true);
        var flip = input;
        var flop = renderTarget;

        for(var i = 0; i < this.passes-1; i++)
        {
            renderer.filterManager.applyFilter(shader, flip, flop, true);

           var temp = flop;
           flop = flip;
           flip = temp;
        }

        renderer.filterManager.applyFilter(shader, flip, output, clear);

        renderer.filterManager.returnRenderTarget(renderTarget);
    }
};


Object.defineProperties(BlurYFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurYFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return  this.strength;
        },
        set: function (value)
        {
            this.padding = Math.abs(value) * 0.5;
            this.strength = value;
        }
    }
});

},{"../../core":29}],93:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * A Smart Blur Filter.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function SmartBlurFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec2 delta;\n\nfloat random(vec3 scale, float seed)\n{\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n    float total = 0.0;\n\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n    for (float t = -30.0; t <= 30.0; t++)\n    {\n        float percent = (t + offset - 0.5) / 30.0;\n        float weight = 1.0 - abs(percent);\n        vec4 sample = texture2D(uSampler, vTextureCoord + delta * percent);\n        sample.rgb *= sample.a;\n        color += sample * weight;\n        total += weight;\n    }\n\n    gl_FragColor = color / total;\n    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n}\n",
        // uniforms
        {
          delta: { type: 'v2', value: { x: 0.1, y: 0.0 } }
        }
    );
}

SmartBlurFilter.prototype = Object.create(core.AbstractFilter.prototype);
SmartBlurFilter.prototype.constructor = SmartBlurFilter;
module.exports = SmartBlurFilter;

},{"../../core":29}],94:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * The ColorMatrixFilter class lets you apply a 5x4 matrix transformation on the RGBA
 * color and alpha values of every pixel on your displayObject to produce a result
 * with a new set of RGBA color and alpha values. It's pretty powerful!
 *
 * ```js
 *  var colorMatrix = new PIXI.ColorMatrixFilter();
 *  container.filters = [colorMatrix];
 *  colorMatrix.contrast(2);
 * ```
 * @author Clément Chenebault <clement@goodboydigital.com>
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function ColorMatrixFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float m[25];\n\nvoid main(void)\n{\n\n    vec4 c = texture2D(uSampler, vTextureCoord);\n\n    gl_FragColor.r = (m[0] * c.r);\n        gl_FragColor.r += (m[1] * c.g);\n        gl_FragColor.r += (m[2] * c.b);\n        gl_FragColor.r += (m[3] * c.a);\n        gl_FragColor.r += m[4];\n\n    gl_FragColor.g = (m[5] * c.r);\n        gl_FragColor.g += (m[6] * c.g);\n        gl_FragColor.g += (m[7] * c.b);\n        gl_FragColor.g += (m[8] * c.a);\n        gl_FragColor.g += m[9];\n\n     gl_FragColor.b = (m[10] * c.r);\n        gl_FragColor.b += (m[11] * c.g);\n        gl_FragColor.b += (m[12] * c.b);\n        gl_FragColor.b += (m[13] * c.a);\n        gl_FragColor.b += m[14];\n\n     gl_FragColor.a = (m[15] * c.r);\n        gl_FragColor.a += (m[16] * c.g);\n        gl_FragColor.a += (m[17] * c.b);\n        gl_FragColor.a += (m[18] * c.a);\n        gl_FragColor.a += m[19];\n\n}\n",
        // custom uniforms
        {
            m: {
                type: '1fv', value: [
                    1, 0, 0, 0, 0,
                    0, 1, 0, 0, 0,
                    0, 0, 1, 0, 0,
                    0, 0, 0, 1, 0
                ]
            }
        }
    );
}

ColorMatrixFilter.prototype = Object.create(core.AbstractFilter.prototype);
ColorMatrixFilter.prototype.constructor = ColorMatrixFilter;
module.exports = ColorMatrixFilter;


/**
 * Transforms current matrix and set the new one
 *
 * @param matrix {number[]} (mat 5x4)
 * @param multiply {boolean} if true, current matrix and matrix are multiplied. If false, just set the current matrix with @param matrix
 */
ColorMatrixFilter.prototype._loadMatrix = function (matrix, multiply)
{
    multiply = !!multiply;

    var newMatrix = matrix;

    if (multiply) {
        this._multiply(newMatrix, this.uniforms.m.value, matrix);
        newMatrix = this._colorMatrix(newMatrix);
    }

    // set the new matrix
    this.uniforms.m.value = newMatrix;
};

/**
 * Multiplies two mat5's
 *
 * @param out {number[]} (mat 5x4) the receiving matrix
 * @param a {number[]} (mat 5x4) the first operand
 * @param b {number[]} (mat 5x4) the second operand
 * @returns out {number[]} (mat 5x4)
 */
ColorMatrixFilter.prototype._multiply = function (out, a, b)
{

    // Red Channel
    out[0] = (a[0] * b[0]) + (a[1] * b[5]) + (a[2] * b[10]) + (a[3] * b[15]);
    out[1] = (a[0] * b[1]) + (a[1] * b[6]) + (a[2] * b[11]) + (a[3] * b[16]);
    out[2] = (a[0] * b[2]) + (a[1] * b[7]) + (a[2] * b[12]) + (a[3] * b[17]);
    out[3] = (a[0] * b[3]) + (a[1] * b[8]) + (a[2] * b[13]) + (a[3] * b[18]);
    out[4] = (a[0] * b[4]) + (a[1] * b[9]) + (a[2] * b[14]) + (a[3] * b[19]);

    // Green Channel
    out[5] = (a[5] * b[0]) + (a[6] * b[5]) + (a[7] * b[10]) + (a[8] * b[15]);
    out[6] = (a[5] * b[1]) + (a[6] * b[6]) + (a[7] * b[11]) + (a[8] * b[16]);
    out[7] = (a[5] * b[2]) + (a[6] * b[7]) + (a[7] * b[12]) + (a[8] * b[17]);
    out[8] = (a[5] * b[3]) + (a[6] * b[8]) + (a[7] * b[13]) + (a[8] * b[18]);
    out[9] = (a[5] * b[4]) + (a[6] * b[9]) + (a[7] * b[14]) + (a[8] * b[19]);

    // Blue Channel
    out[10] = (a[10] * b[0]) + (a[11] * b[5]) + (a[12] * b[10]) + (a[13] * b[15]);
    out[11] = (a[10] * b[1]) + (a[11] * b[6]) + (a[12] * b[11]) + (a[13] * b[16]);
    out[12] = (a[10] * b[2]) + (a[11] * b[7]) + (a[12] * b[12]) + (a[13] * b[17]);
    out[13] = (a[10] * b[3]) + (a[11] * b[8]) + (a[12] * b[13]) + (a[13] * b[18]);
    out[14] = (a[10] * b[4]) + (a[11] * b[9]) + (a[12] * b[14]) + (a[13] * b[19]);

    // Alpha Channel
    out[15] = (a[15] * b[0]) + (a[16] * b[5]) + (a[17] * b[10]) + (a[18] * b[15]);
    out[16] = (a[15] * b[1]) + (a[16] * b[6]) + (a[17] * b[11]) + (a[18] * b[16]);
    out[17] = (a[15] * b[2]) + (a[16] * b[7]) + (a[17] * b[12]) + (a[18] * b[17]);
    out[18] = (a[15] * b[3]) + (a[16] * b[8]) + (a[17] * b[13]) + (a[18] * b[18]);
    out[19] = (a[15] * b[4]) + (a[16] * b[9]) + (a[17] * b[14]) + (a[18] * b[19]);

    return out;
};

/**
 * Create a Float32 Array and normalize the offset component to 0-1
 *
 * @param matrix {number[]} (mat 5x4)
 * @return m {number[]} (mat 5x4) with all values between 0-1
 */
ColorMatrixFilter.prototype._colorMatrix = function (matrix)
{
    // Create a Float32 Array and normalize the offset component to 0-1
    var m = new Float32Array(matrix);
    m[4] /= 255;
    m[9] /= 255;
    m[14] /= 255;
    m[19] /= 255;

    return m;
};

/**
 * Adjusts brightness
 *
 * @param b {number} value of the brigthness (0 is black)
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.brightness = function (b, multiply)
{
    var matrix = [
        b, 0, 0, 0, 0,
        0, b, 0, 0, 0,
        0, 0, b, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Set the matrices in grey scales
 *
 * @param scale {number} value of the grey (0 is black)
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.greyscale = function (scale, multiply)
{
    var matrix = [
        scale, scale, scale, 0, 0,
        scale, scale, scale, 0, 0,
        scale, scale, scale, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};
//Americanized alias
ColorMatrixFilter.prototype.grayscale = ColorMatrixFilter.prototype.greyscale;

/**
 * Set the black and white matrice
 * Multiply the current matrix
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.blackAndWhite = function (multiply)
{
    var matrix = [
        0.3, 0.6, 0.1, 0, 0,
        0.3, 0.6, 0.1, 0, 0,
        0.3, 0.6, 0.1, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Set the hue property of the color
 *
 * @param rotation {number} in degrees
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.hue = function (rotation, multiply)
{
    rotation = (rotation || 0) / 180 * Math.PI;
    var cos = Math.cos(rotation),
        sin = Math.sin(rotation);

    // luminanceRed, luminanceGreen, luminanceBlue
    var lumR = 0.213, // or 0.3086
        lumG = 0.715, // or 0.6094
        lumB = 0.072; // or 0.0820

    var matrix = [
        lumR + cos * (1 - lumR) + sin * (-lumR), lumG + cos * (-lumG) + sin * (-lumG), lumB + cos * (-lumB) + sin * (1 - lumB), 0, 0,
        lumR + cos * (-lumR) + sin * (0.143), lumG + cos * (1 - lumG) + sin * (0.140), lumB + cos * (-lumB) + sin * (-0.283), 0, 0,
        lumR + cos * (-lumR) + sin * (-(1 - lumR)), lumG + cos * (-lumG) + sin * (lumG), lumB + cos * (1 - lumB) + sin * (lumB), 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};


/**
 * Set the contrast matrix, increase the separation between dark and bright
 * Increase contrast : shadows darker and highlights brighter
 * Decrease contrast : bring the shadows up and the highlights down
 *
 * @param amount {number} value of the contrast
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.contrast = function (amount, multiply)
{
    var v = (amount || 0) + 1;
    var o = -128 * (v - 1);

    var matrix = [
        v, 0, 0, 0, o,
        0, v, 0, 0, o,
        0, 0, v, 0, o,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Set the saturation matrix, increase the separation between colors
 * Increase saturation : increase contrast, brightness, and sharpness
 *
 * @param amount {number}
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.saturate = function (amount, multiply)
{
    var x = (amount || 0) * 2 / 3 + 1;
    var y = ((x - 1) * -0.5);

    var matrix = [
        x, y, y, 0, 0,
        y, x, y, 0, 0,
        y, y, x, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Desaturate image (remove color)
 *
 * Call the saturate function
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.desaturate = function (multiply) // jshint unused:false
{
    this.saturate(-1);
};

/**
 * Negative image (inverse of classic rgb matrix)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.negative = function (multiply)
{
    var matrix = [
        0, 1, 1, 0, 0,
        1, 0, 1, 0, 0,
        1, 1, 0, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Sepia image
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.sepia = function (multiply)
{
    var matrix = [
        0.393, 0.7689999, 0.18899999, 0, 0,
        0.349, 0.6859999, 0.16799999, 0, 0,
        0.272, 0.5339999, 0.13099999, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Color motion picture process invented in 1916 (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.technicolor = function (multiply)
{
    var matrix = [
        1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, 11.793603434377337,
        -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -70.35205161461398,
        -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 30.950940869491138,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Polaroid filter
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.polaroid = function (multiply)
{
    var matrix = [
        1.438, -0.062, -0.062, 0, 0,
        -0.122, 1.378, -0.122, 0, 0,
        -0.016, -0.016, 1.483, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Filter who transforms : Red -> Blue and Blue -> Red
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.toBGR = function (multiply)
{
    var matrix = [
        0, 0, 1, 0, 0,
        0, 1, 0, 0, 0,
        1, 0, 0, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Color reversal film introduced by Eastman Kodak in 1935. (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.kodachrome = function (multiply)
{
    var matrix = [
        1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, 63.72958762196502,
        -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, 24.732407896706203,
        -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 35.62982807460946,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Brown delicious browni filter (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.browni = function (multiply)
{
    var matrix = [
        0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, 47.43192855600873,
        -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, -36.96841498319127,
        0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, -7.562075277591283,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * Vintage filter (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.vintage = function (multiply)
{
    var matrix = [
        0.6279345635605994, 0.3202183420819367, -0.03965408211312453, 0, 9.651285835294123,
        0.02578397704808868, 0.6441188644374771, 0.03259127616149294, 0, 7.462829176470591,
        0.0466055556782719, -0.0851232987247891, 0.5241648018700465, 0, 5.159190588235296,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * We don't know exactly what it does, kind of gradient map, but funny to play with!
 *
 * @param desaturation {number}
 * @param toned {number}
 * @param lightColor {string} (example : "0xFFE580")
 * @param darkColor {string}  (example : "0xFFE580")
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.colorTone = function (desaturation, toned, lightColor, darkColor, multiply)
{
    desaturation = desaturation || 0.2;
    toned = toned || 0.15;
    lightColor = lightColor || 0xFFE580;
    darkColor = darkColor || 0x338000;

    var lR = ((lightColor >> 16) & 0xFF) / 255;
    var lG = ((lightColor >> 8) & 0xFF) / 255;
    var lB = (lightColor & 0xFF) / 255;

    var dR = ((darkColor >> 16) & 0xFF) / 255;
    var dG = ((darkColor >> 8) & 0xFF) / 255;
    var dB = (darkColor & 0xFF) / 255;

    var matrix = [
        0.3, 0.59, 0.11, 0, 0,
        lR, lG, lB, desaturation, 0,
        dR, dG, dB, toned, 0,
        lR - dR, lG - dG, lB - dB, 0, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * Night effect
 *
 * @param intensity {number}
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.night = function (intensity, multiply)
{
    intensity = intensity || 0.1;
    var matrix = [
        intensity * ( -2.0), -intensity, 0, 0, 0,
        -intensity, 0, intensity, 0, 0,
        0, intensity, intensity * 2.0, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};


/*
 * Predator effect
 *
 * Erase the current matrix by setting a new indepent one
 *
 * @param amount {number} how much the predator feels his future victim
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.predator = function (amount, multiply)
{
    var matrix = [
        11.224130630493164 * amount, -4.794486999511719 * amount, -2.8746118545532227 * amount, 0 * amount, 0.40342438220977783 * amount,
        -3.6330697536468506 * amount, 9.193157196044922 * amount, -2.951810836791992 * amount, 0 * amount, -1.316135048866272 * amount,
        -3.2184197902679443 * amount, -4.2375030517578125 * amount, 7.476448059082031 * amount, 0 * amount, 0.8044459223747253 * amount,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * LSD effect
 *
 * Multiply the current matrix
 *
 * @param amount {number} How crazy is your effect
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.lsd = function (multiply)
{
    var matrix = [
        2, -0.4, 0.5, 0, 0,
        -0.5, 2, -0.4, 0, 0,
        -0.4, -0.5, 3, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * Erase the current matrix by setting the default one
 *
 */
ColorMatrixFilter.prototype.reset = function ()
{
    var matrix = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, false);
};


Object.defineProperties(ColorMatrixFilter.prototype, {
    /**
     * Sets the matrix of the color matrix filter
     *
     * @member {number[]}
     * @memberof PIXI.filters.ColorMatrixFilter#
     * @default [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]
     */
    matrix: {
        get: function ()
        {
            return this.uniforms.m.value;
        },
        set: function (value)
        {
            this.uniforms.m.value = value;
        }
    }
});

},{"../../core":29}],95:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * This lowers the color depth of your image by the given amount, producing an image with a smaller palette.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function ColorStepFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float step;\n\nvoid main(void)\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    color = floor(color * step) / step;\n\n    gl_FragColor = color;\n}\n",
        // custom uniforms
        {
            step: { type: '1f', value: 5 }
        }
    );
}

ColorStepFilter.prototype = Object.create(core.AbstractFilter.prototype);
ColorStepFilter.prototype.constructor = ColorStepFilter;
module.exports = ColorStepFilter;

Object.defineProperties(ColorStepFilter.prototype, {
    /**
     * The number of steps to reduce the palette by.
     *
     * @member {number}
     * @memberof PIXI.filters.ColorStepFilter#
     */
    step: {
        get: function ()
        {
            return this.uniforms.step.value;
        },
        set: function (value)
        {
            this.uniforms.step.value = value;
        }
    }
});

},{"../../core":29}],96:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * The ConvolutionFilter class applies a matrix convolution filter effect.
 * A convolution combines pixels in the input image with neighboring pixels to produce a new image.
 * A wide variety of image effects can be achieved through convolutions, including blurring, edge
 * detection, sharpening, embossing, and beveling. The matrix should be specified as a 9 point Array.
 * See http://docs.gimp.org/en/plug-in-convmatrix.html for more info.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 * @param matrix {number[]} An array of values used for matrix transformation. Specified as a 9 point Array.
 * @param width {number} Width of the object you are transforming
 * @param height {number} Height of the object you are transforming
 */
function ConvolutionFilter(matrix, width, height)
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying mediump vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec2 texelSize;\nuniform float matrix[9];\n\nvoid main(void)\n{\n   vec4 c11 = texture2D(uSampler, vTextureCoord - texelSize); // top left\n   vec4 c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)); // top center\n   vec4 c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)); // top right\n\n   vec4 c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)); // mid left\n   vec4 c22 = texture2D(uSampler, vTextureCoord); // mid center\n   vec4 c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)); // mid right\n\n   vec4 c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)); // bottom left\n   vec4 c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)); // bottom center\n   vec4 c33 = texture2D(uSampler, vTextureCoord + texelSize); // bottom right\n\n   gl_FragColor =\n       c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +\n       c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +\n       c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];\n\n   gl_FragColor.a = c22.a;\n}\n",
        // custom uniforms
        {
            matrix:     { type: '1fv', value: new Float32Array(matrix) },
            texelSize:  { type: 'v2', value: { x: 1 / width, y: 1 / height } }
        }
    );
}

ConvolutionFilter.prototype = Object.create(core.AbstractFilter.prototype);
ConvolutionFilter.prototype.constructor = ConvolutionFilter;
module.exports = ConvolutionFilter;

Object.defineProperties(ConvolutionFilter.prototype, {
    /**
     * An array of values used for matrix transformation. Specified as a 9 point Array.
     *
     * @member {number[]}
     * @memberof PIXI.filters.ConvolutionFilter#
     */
    matrix: {
        get: function ()
        {
            return this.uniforms.matrix.value;
        },
        set: function (value)
        {
            this.uniforms.matrix.value = new Float32Array(value);
        }
    },

    /**
     * Width of the object you are transforming
     *
     * @member {number}
     * @memberof PIXI.filters.ConvolutionFilter#
     */
    width: {
        get: function ()
        {
            return 1/this.uniforms.texelSize.value.x;
        },
        set: function (value)
        {
            this.uniforms.texelSize.value.x = 1/value;
        }
    },

    /**
     * Height of the object you are transforming
     *
     * @member {number}
     * @memberof PIXI.filters.ConvolutionFilter#
     */
    height: {
        get: function ()
        {
            return 1/this.uniforms.texelSize.value.y;
        },
        set: function (value)
        {
            this.uniforms.texelSize.value.y = 1/value;
        }
    }
});

},{"../../core":29}],97:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * A Cross Hatch effect filter.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function CrossHatchFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);\n\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n\n    if (lum < 1.00)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.75)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.50)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.3)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n}\n"
    );
}

CrossHatchFilter.prototype = Object.create(core.AbstractFilter.prototype);
CrossHatchFilter.prototype.constructor = CrossHatchFilter;
module.exports = CrossHatchFilter;

},{"../../core":29}],98:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * The DisplacementFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used to offset the x and the g property of the texture is used to offset the y.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 * @param sprite {PIXI.Sprite} the sprite used for the displacement map. (make sure its added to the scene!)
 */
function DisplacementFilter(sprite, scale)
{
    var maskMatrix = new core.Matrix();
    sprite.renderable = false;

    core.AbstractFilter.call(this,
        // vertex shader
        "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMapCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvoid main(void)\n{\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n   vMapCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n",
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vMapCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform vec2 scale;\n\nuniform sampler2D uSampler;\nuniform sampler2D mapSampler;\n\nvoid main(void)\n{\n   vec4 map =  texture2D(mapSampler, vMapCoord);\n\n   map -= 0.5;\n   map.xy *= scale;\n\n   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y));\n}\n",
        // uniforms
        {
            mapSampler:     { type: 'sampler2D', value: sprite.texture },
            otherMatrix:    { type: 'mat3', value: maskMatrix.toArray(true) },
            scale:          { type: 'v2', value: { x: 1, y: 1 } }
        }
    );

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;

    if (scale === null || scale === undefined)
    {
        scale = 20;
    }

    this.scale = new core.Point(scale, scale);
}

DisplacementFilter.prototype = Object.create(core.AbstractFilter.prototype);
DisplacementFilter.prototype.constructor = DisplacementFilter;
module.exports = DisplacementFilter;

DisplacementFilter.prototype.applyFilter = function (renderer, input, output)
{
    var filterManager = renderer.filterManager;

    filterManager.calculateMappedMatrix(input.frame, this.maskSprite, this.maskMatrix);

    this.uniforms.otherMatrix.value = this.maskMatrix.toArray(true);
    this.uniforms.scale.value.x = this.scale.x * (1/input.frame.width);
    this.uniforms.scale.value.y = this.scale.y * (1/input.frame.height);

    var shader = this.getShader(renderer);
     // draw the filter...
    filterManager.applyFilter(shader, input, output);
};


Object.defineProperties(DisplacementFilter.prototype, {
    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.filters.DisplacementFilter#
     */
    map: {
        get: function ()
        {
            return this.uniforms.mapSampler.value;
        },
        set: function (value)
        {
            this.uniforms.mapSampler.value = value;

        }
    }
});

},{"../../core":29}],99:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/fun/dotscreen.js
 */

/**
 * This filter applies a dotscreen effect making display objects appear to be made out of
 * black and white halftone dots like an old printer.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function DotScreenFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform vec4 dimensions;\nuniform sampler2D uSampler;\n\nuniform float angle;\nuniform float scale;\n\nfloat pattern()\n{\n   float s = sin(angle), c = cos(angle);\n   vec2 tex = vTextureCoord * dimensions.xy;\n   vec2 point = vec2(\n       c * tex.x - s * tex.y,\n       s * tex.x + c * tex.y\n   ) * scale;\n   return (sin(point.x) * sin(point.y)) * 4.0;\n}\n\nvoid main()\n{\n   vec4 color = texture2D(uSampler, vTextureCoord);\n   float average = (color.r + color.g + color.b) / 3.0;\n   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\n}\n",
        // custom uniforms
        {
            scale:      { type: '1f', value: 1 },
            angle:      { type: '1f', value: 5 },
            dimensions: { type: '4fv', value: [0, 0, 0, 0] }
        }
    );
}

DotScreenFilter.prototype = Object.create(core.AbstractFilter.prototype);
DotScreenFilter.prototype.constructor = DotScreenFilter;
module.exports = DotScreenFilter;

Object.defineProperties(DotScreenFilter.prototype, {
    /**
     * The scale of the effect.
     * @member {number}
     * @memberof PIXI.filters.DotScreenFilter#
     */
    scale: {
        get: function ()
        {
            return this.uniforms.scale.value;
        },
        set: function (value)
        {
            this.uniforms.scale.value = value;
        }
    },

    /**
     * The radius of the effect.
     * @member {number}
     * @memberof PIXI.filters.DotScreenFilter#
     */
    angle: {
        get: function ()
        {
            return this.uniforms.angle.value;
        },
        set: function (value)
        {
            this.uniforms.angle.value = value;
        }
    }
});

},{"../../core":29}],100:[function(require,module,exports){
var core = require('../../core');

// @see https://github.com/substack/brfs/issues/25


/**
 * The BlurYTintFilter applies a vertical Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function BlurYTintFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform float strength;\nuniform vec2 offset;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vBlurTexCoords[6];\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition+offset), 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n\n    vBlurTexCoords[ 0] = aTextureCoord + vec2(0.0, -0.012 * strength);\n    vBlurTexCoords[ 1] = aTextureCoord + vec2(0.0, -0.008 * strength);\n    vBlurTexCoords[ 2] = aTextureCoord + vec2(0.0, -0.004 * strength);\n    vBlurTexCoords[ 3] = aTextureCoord + vec2(0.0,  0.004 * strength);\n    vBlurTexCoords[ 4] = aTextureCoord + vec2(0.0,  0.008 * strength);\n    vBlurTexCoords[ 5] = aTextureCoord + vec2(0.0,  0.012 * strength);\n\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n",
        // fragment shader
        "precision lowp float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vBlurTexCoords[6];\nvarying vec4 vColor;\n\nuniform vec3 color;\nuniform float alpha;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    vec4 sum = vec4(0.0);\n\n    sum += texture2D(uSampler, vBlurTexCoords[ 0])*0.004431848411938341;\n    sum += texture2D(uSampler, vBlurTexCoords[ 1])*0.05399096651318985;\n    sum += texture2D(uSampler, vBlurTexCoords[ 2])*0.2419707245191454;\n    sum += texture2D(uSampler, vTextureCoord     )*0.3989422804014327;\n    sum += texture2D(uSampler, vBlurTexCoords[ 3])*0.2419707245191454;\n    sum += texture2D(uSampler, vBlurTexCoords[ 4])*0.05399096651318985;\n    sum += texture2D(uSampler, vBlurTexCoords[ 5])*0.004431848411938341;\n\n    gl_FragColor = vec4( color.rgb * sum.a * alpha, sum.a * alpha );\n}\n",
        // set the uniforms
        {
            blur: { type: '1f', value: 1 / 512 },
            color: { type: 'c', value: [0,0,0]},
            alpha: { type: '1f', value: 0.7 },
            offset: { type: '2f', value:[5, 5]},
            strength: { type: '1f', value:1}
        }
    );

    this.passes = 1;
    this.strength = 4;
}

BlurYTintFilter.prototype = Object.create(core.AbstractFilter.prototype);
BlurYTintFilter.prototype.constructor = BlurYTintFilter;
module.exports = BlurYTintFilter;

BlurYTintFilter.prototype.applyFilter = function (renderer, input, output, clear)
{
    var shader = this.getShader(renderer);

    this.uniforms.strength.value = this.strength / 4 / this.passes * (input.frame.height / input.size.height);

    if(this.passes === 1)
    {
        renderer.filterManager.applyFilter(shader, input, output, clear);
    }
    else
    {
        var renderTarget = renderer.filterManager.getRenderTarget(true);
        var flip = input;
        var flop = renderTarget;

        for(var i = 0; i < this.passes-1; i++)
        {
            renderer.filterManager.applyFilter(shader, flip, flop, clear);

           var temp = flop;
           flop = flip;
           flip = temp;
        }

        renderer.filterManager.applyFilter(shader, flip, output, clear);

        renderer.filterManager.returnRenderTarget(renderTarget);
    }
};


Object.defineProperties(BlurYTintFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurYTintFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return  this.strength;
        },
        set: function (value)
        {
            this.padding = value * 0.5;
            this.strength = value;
        }
    }
});

},{"../../core":29}],101:[function(require,module,exports){
var core = require('../../core'),
    BlurXFilter = require('../blur/BlurXFilter'),
    BlurYTintFilter = require('./BlurYTintFilter');

/**
 * The DropShadowFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function DropShadowFilter()
{
    core.AbstractFilter.call(this);

    this.blurXFilter = new BlurXFilter();
    this.blurYTintFilter = new BlurYTintFilter();

    this.defaultFilter = new core.AbstractFilter();

    this.padding = 30;

    this._dirtyPosition = true;
    this._angle = 45 * Math.PI / 180;
    this._distance = 10;
    this.alpha = 0.75;
    this.hideObject = false;
    this.blendMode = core.BLEND_MODES.MULTIPLY;
}

DropShadowFilter.prototype = Object.create(core.AbstractFilter.prototype);
DropShadowFilter.prototype.constructor = DropShadowFilter;
module.exports = DropShadowFilter;

DropShadowFilter.prototype.applyFilter = function (renderer, input, output)
{
    var renderTarget = renderer.filterManager.getRenderTarget(true);

    //TODO - copyTexSubImage2D could be used here?
    if(this._dirtyPosition)
    {
        this._dirtyPosition = false;

        this.blurYTintFilter.uniforms.offset.value[0] = Math.sin(this._angle) * this._distance;
        this.blurYTintFilter.uniforms.offset.value[1] = Math.cos(this._angle) * this._distance;
    }

    this.blurXFilter.applyFilter(renderer, input, renderTarget);

    renderer.blendModeManager.setBlendMode(this.blendMode);

    this.blurYTintFilter.applyFilter(renderer, renderTarget, output);

    renderer.blendModeManager.setBlendMode(core.BLEND_MODES.NORMAL);

    if(!this.hideObject)
    {

        this.defaultFilter.applyFilter(renderer, input, output);
    }


    renderer.filterManager.returnRenderTarget(renderTarget);
};

Object.defineProperties(DropShadowFilter.prototype, {
    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @memberOf PIXI.filters.DropShadowFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.blurXFilter.blur = this.blurYTintFilter.blur = value;
        }
    },

    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @memberOf PIXI.filters.DropShadowFilter#
     * @default 2
     */
    blurX: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.blurXFilter.blur = value;
        }
    },

    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @memberOf PIXI.filters.DropShadowFilter#
     * @default 2
     */
    blurY: {
        get: function ()
        {
            return this.blurYTintFilter.blur;
        },
        set: function (value)
        {
            this.blurYTintFilter.blur = value;
        }
    },

    /**
     * Sets the color of the shadow
     *
     * @member {number}
     * @memberOf PIXI.filters.DropShadowFilter#
     */
    color: {
        get: function ()
        {
            return  core.utils.rgb2hex( this.blurYTintFilter.uniforms.color.value );
        },
        set: function (value)
        {
            this.blurYTintFilter.uniforms.color.value = core.utils.hex2rgb(value);
        }
    },

    /**
     * Sets the alpha of the shadow
     *
     * @member {number}
     * @memberOf PIXI.filters.DropShadowFilter#
     */
    alpha: {
        get: function ()
        {
            return  this.blurYTintFilter.uniforms.alpha.value;
        },
        set: function (value)
        {
            this.blurYTintFilter.uniforms.alpha.value = value;
        }
    },

    /**
     * Sets the distance of the shadow
     *
     * @member {number}
     * @memberOf PIXI.filters.DropShadowFilter#
     */
    distance: {
        get: function ()
        {
            return  this._distance;
        },
        set: function (value)
        {
            this._dirtyPosition = true;
            this._distance = value;
        }
    },

    /**
     * Sets the angle of the shadow
     *
     * @member {number}
     * @memberOf PIXI.filters.DropShadowFilter#
     */
    angle: {
        get: function ()
        {
            return  this._angle;
        },
        set: function (value)
        {
            this._dirtyPosition = true;
            this._angle = value;
        }
    }
});

},{"../../core":29,"../blur/BlurXFilter":91,"./BlurYTintFilter":100}],102:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * This greyscales the palette of your Display Objects.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function GrayFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\nuniform float gray;\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\n   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);\n}\n",
        // set the uniforms
        {
            gray: { type: '1f', value: 1 }
        }
    );
}

GrayFilter.prototype = Object.create(core.AbstractFilter.prototype);
GrayFilter.prototype.constructor = GrayFilter;
module.exports = GrayFilter;

Object.defineProperties(GrayFilter.prototype, {
    /**
     * The strength of the gray. 1 will make the object black and white, 0 will make the object its normal color.
     *
     * @member {number}
     * @memberof PIXI.filters.GrayFilter#
     */
    gray: {
        get: function ()
        {
            return this.uniforms.gray.value;
        },
        set: function (value)
        {
            this.uniforms.gray.value = value;
        }
    }
});

},{"../../core":29}],103:[function(require,module,exports){
/**
 * @file        Main export of the PIXI filters library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.filters
 */
module.exports = {
    AsciiFilter:        require('./ascii/AsciiFilter'),
    BloomFilter:        require('./bloom/BloomFilter'),
    BlurFilter:         require('./blur/BlurFilter'),
    BlurXFilter:        require('./blur/BlurXFilter'),
    BlurYFilter:        require('./blur/BlurYFilter'),
    BlurDirFilter:      require('./blur/BlurDirFilter'),
    ColorMatrixFilter:  require('./color/ColorMatrixFilter'),
    ColorStepFilter:    require('./color/ColorStepFilter'),
    ConvolutionFilter:  require('./convolution/ConvolutionFilter'),
    CrossHatchFilter:   require('./crosshatch/CrossHatchFilter'),
    DisplacementFilter: require('./displacement/DisplacementFilter'),
    DotScreenFilter:    require('./dot/DotScreenFilter'),
    GrayFilter:         require('./gray/GrayFilter'),
    DropShadowFilter:   require('./dropshadow/DropShadowFilter'),
    InvertFilter:       require('./invert/InvertFilter'),
    NoiseFilter:        require('./noise/NoiseFilter'),
    PixelateFilter:     require('./pixelate/PixelateFilter'),
    RGBSplitFilter:     require('./rgb/RGBSplitFilter'),
    ShockwaveFilter:    require('./shockwave/ShockwaveFilter'),
    SepiaFilter:        require('./sepia/SepiaFilter'),
    SmartBlurFilter:    require('./blur/SmartBlurFilter'),
    TiltShiftFilter:    require('./tiltshift/TiltShiftFilter'),
    TiltShiftXFilter:   require('./tiltshift/TiltShiftXFilter'),
    TiltShiftYFilter:   require('./tiltshift/TiltShiftYFilter'),
    TwistFilter:        require('./twist/TwistFilter')
};

},{"./ascii/AsciiFilter":87,"./bloom/BloomFilter":88,"./blur/BlurDirFilter":89,"./blur/BlurFilter":90,"./blur/BlurXFilter":91,"./blur/BlurYFilter":92,"./blur/SmartBlurFilter":93,"./color/ColorMatrixFilter":94,"./color/ColorStepFilter":95,"./convolution/ConvolutionFilter":96,"./crosshatch/CrossHatchFilter":97,"./displacement/DisplacementFilter":98,"./dot/DotScreenFilter":99,"./dropshadow/DropShadowFilter":101,"./gray/GrayFilter":102,"./invert/InvertFilter":104,"./noise/NoiseFilter":105,"./pixelate/PixelateFilter":106,"./rgb/RGBSplitFilter":107,"./sepia/SepiaFilter":108,"./shockwave/ShockwaveFilter":109,"./tiltshift/TiltShiftFilter":111,"./tiltshift/TiltShiftXFilter":112,"./tiltshift/TiltShiftYFilter":113,"./twist/TwistFilter":114}],104:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * This inverts your Display Objects colors.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function InvertFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform float invert;\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n\n    gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, 1.0 - invert);\n}\n",
        // custom uniforms
        {
            invert: { type: '1f', value: 1 }
        }
    );
}

InvertFilter.prototype = Object.create(core.AbstractFilter.prototype);
InvertFilter.prototype.constructor = InvertFilter;
module.exports = InvertFilter;

Object.defineProperties(InvertFilter.prototype, {
    /**
     * The strength of the invert. `1` will fully invert the colors, and
     * `0` will make the object its normal color.
     *
     * @member {number}
     * @memberof PIXI.filters.InvertFilter#
     */
    invert: {
        get: function ()
        {
            return this.uniforms.invert.value;
        },
        set: function (value)
        {
            this.uniforms.invert.value = value;
        }
    }
});

},{"../../core":29}],105:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * @author Vico @vicocotea
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 */

/**
 * A Noise effect filter.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function NoiseFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision highp float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform float noise;\nuniform sampler2D uSampler;\n\nfloat rand(vec2 co)\n{\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main()\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    float diff = (rand(vTextureCoord) - 0.5) * noise;\n\n    color.r += diff;\n    color.g += diff;\n    color.b += diff;\n\n    gl_FragColor = color;\n}\n",
        // custom uniforms
        {
            noise: { type: '1f', value: 0.5 }
        }
    );
}

NoiseFilter.prototype = Object.create(core.AbstractFilter.prototype);
NoiseFilter.prototype.constructor = NoiseFilter;
module.exports = NoiseFilter;

Object.defineProperties(NoiseFilter.prototype, {
    /**
     * The amount of noise to apply.
     *
     * @member {number}
     * @memberof PIXI.filters.NoiseFilter#
     * @default 0.5
     */
    noise: {
        get: function ()
        {
            return this.uniforms.noise.value;
        },
        set: function (value)
        {
            this.uniforms.noise.value = value;
        }
    }
});

},{"../../core":29}],106:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * This filter applies a pixelate effect making display objects appear 'blocky'.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function PixelateFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform vec4 dimensions;\nuniform vec2 pixelSize;\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    vec2 coord = vTextureCoord;\n\n    vec2 size = dimensions.xy / pixelSize;\n\n    vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;\n\n    gl_FragColor = texture2D(uSampler, color);\n}\n",
        // custom uniforms
        {
            dimensions: { type: '4fv',  value: new Float32Array([0, 0, 0, 0]) },
            pixelSize:  { type: 'v2',   value: { x: 10, y: 10 } }
        }
    );
}

PixelateFilter.prototype = Object.create(core.AbstractFilter.prototype);
PixelateFilter.prototype.constructor = PixelateFilter;
module.exports = PixelateFilter;

Object.defineProperties(PixelateFilter.prototype, {
    /**
     * This a point that describes the size of the blocks.
     * x is the width of the block and y is the height.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.PixelateFilter#
     */
    size: {
        get: function ()
        {
            return this.uniforms.pixelSize.value;
        },
        set: function (value)
        {
            this.uniforms.pixelSize.value = value;
        }
    }
});

},{"../../core":29}],107:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * An RGB Split Filter.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function RGBSplitFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 dimensions;\nuniform vec2 red;\nuniform vec2 green;\nuniform vec2 blue;\n\nvoid main(void)\n{\n   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;\n   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;\n   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;\n   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;\n}\n",
        // custom uniforms
        {
            red:        { type: 'v2', value: { x: 20, y: 20 } },
            green:      { type: 'v2', value: { x: -20, y: 20 } },
            blue:       { type: 'v2', value: { x: 20, y: -20 } },
            dimensions: { type: '4fv', value: [0, 0, 0, 0] }
        }
    );
}

RGBSplitFilter.prototype = Object.create(core.AbstractFilter.prototype);
RGBSplitFilter.prototype.constructor = RGBSplitFilter;
module.exports = RGBSplitFilter;

Object.defineProperties(RGBSplitFilter.prototype, {
    /**
     * Red channel offset.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.RGBSplitFilter#
     */
    red: {
        get: function ()
        {
            return this.uniforms.red.value;
        },
        set: function (value)
        {
            this.uniforms.red.value = value;
        }
    },

    /**
     * Green channel offset.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.RGBSplitFilter#
     */
    green: {
        get: function ()
        {
            return this.uniforms.green.value;
        },
        set: function (value)
        {
            this.uniforms.green.value = value;
        }
    },

    /**
     * Blue offset.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.RGBSplitFilter#
     */
    blue: {
        get: function ()
        {
            return this.uniforms.blue.value;
        },
        set: function (value)
        {
            this.uniforms.blue.value = value;
        }
    }
});

},{"../../core":29}],108:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * This applies a sepia effect to your Display Objects.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function SepiaFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float sepia;\n\nconst mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\n   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);\n}\n",
        // custom uniforms
        {
            sepia: { type: '1f', value: 1 }
        }
    );
}

SepiaFilter.prototype = Object.create(core.AbstractFilter.prototype);
SepiaFilter.prototype.constructor = SepiaFilter;
module.exports = SepiaFilter;

Object.defineProperties(SepiaFilter.prototype, {
    /**
     * The strength of the sepia. `1` will apply the full sepia effect, and
     * `0` will make the object its normal color.
     *
     * @member {number}
     * @memberof PIXI.filters.SepiaFilter#
     */
    sepia: {
        get: function ()
        {
            return this.uniforms.sepia.value;
        },
        set: function (value)
        {
            this.uniforms.sepia.value = value;
        }
    }
});

},{"../../core":29}],109:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * The ColorMatrixFilter class lets you apply a 4x4 matrix transformation on the RGBA
 * color and alpha values of every pixel on your displayObject to produce a result
 * with a new set of RGBA color and alpha values. It's pretty powerful!
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function ShockwaveFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision lowp float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nuniform vec2 center;\nuniform vec3 params; // 10.0, 0.8, 0.1\nuniform float time;\n\nvoid main()\n{\n    vec2 uv = vTextureCoord;\n    vec2 texCoord = uv;\n\n    float dist = distance(uv, center);\n\n    if ( (dist <= (time + params.z)) && (dist >= (time - params.z)) )\n    {\n        float diff = (dist - time);\n        float powDiff = 1.0 - pow(abs(diff*params.x), params.y);\n\n        float diffTime = diff  * powDiff;\n        vec2 diffUV = normalize(uv - center);\n        texCoord = uv + (diffUV * diffTime);\n    }\n\n    gl_FragColor = texture2D(uSampler, texCoord);\n}\n",
        // custom uniforms
        {
            center: { type: 'v2', value: { x: 0.5, y: 0.5 } },
            params: { type: 'v3', value: { x: 10, y: 0.8, z: 0.1 } },
            time: { type: '1f', value: 0 }
        }
    );
}

ShockwaveFilter.prototype = Object.create(core.AbstractFilter.prototype);
ShockwaveFilter.prototype.constructor = ShockwaveFilter;
module.exports = ShockwaveFilter;

Object.defineProperties(ShockwaveFilter.prototype, {
    /**
     * Sets the center of the shockwave in normalized screen coords. That is
     * (0,0) is the top-left and (1,1) is the bottom right.
     *
     * @member {object<string, number>}
     * @memberof PIXI.filters.ShockwaveFilter#
     */
    center: {
        get: function ()
        {
            return this.uniforms.center.value;
        },
        set: function (value)
        {
            this.uniforms.center.value = value;
        }
    },
    /**
     * Sets the params of the shockwave. These modify the look and behavior of
     * the shockwave as it ripples out.
     *
     * @member {object<string, number>}
     * @memberof PIXI.filters.ShockwaveFilter#
     */
    params: {
        get: function ()
        {
            return this.uniforms.params.value;
        },
        set: function (value)
        {
            this.uniforms.params.value = value;
        }
    },
    /**
     * Sets the elapsed time of the shockwave. This controls the speed at which
     * the shockwave ripples out.
     *
     * @member {number}
     * @memberof PIXI.filters.ShockwaveFilter#
     */
    time: {
        get: function ()
        {
            return this.uniforms.time.value;
        },
        set: function (value)
        {
            this.uniforms.time.value = value;
        }
    }
});

},{"../../core":29}],110:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShiftAxisFilter.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function TiltShiftAxisFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float blur;\nuniform float gradientBlur;\nuniform vec2 start;\nuniform vec2 end;\nuniform vec2 delta;\nuniform vec2 texSize;\n\nfloat random(vec3 scale, float seed)\n{\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n    float total = 0.0;\n\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));\n    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;\n\n    for (float t = -30.0; t <= 30.0; t++)\n    {\n        float percent = (t + offset - 0.5) / 30.0;\n        float weight = 1.0 - abs(percent);\n        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);\n        sample.rgb *= sample.a;\n        color += sample * weight;\n        total += weight;\n    }\n\n    gl_FragColor = color / total;\n    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n}\n",
        // custom uniforms
        {
            blur:           { type: '1f', value: 100 },
            gradientBlur:   { type: '1f', value: 600 },
            start:          { type: 'v2', value: { x: 0,    y: window.innerHeight / 2 } },
            end:            { type: 'v2', value: { x: 600,  y: window.innerHeight / 2 } },
            delta:          { type: 'v2', value: { x: 30,   y: 30 } },
            texSize:        { type: 'v2', value: { x: window.innerWidth, y: window.innerHeight } }
        }
    );

    this.updateDelta();
}

TiltShiftAxisFilter.prototype = Object.create(core.AbstractFilter.prototype);
TiltShiftAxisFilter.prototype.constructor = TiltShiftAxisFilter;
module.exports = TiltShiftAxisFilter;

/**
 * Updates the filter delta values.
 * This is overridden in the X and Y filters, does nothing for this class.
 *
 */
TiltShiftAxisFilter.prototype.updateDelta = function ()
{
    this.uniforms.delta.value.x = 0;
    this.uniforms.delta.value.y = 0;
};

Object.defineProperties(TiltShiftAxisFilter.prototype, {
    /**
     * The strength of the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    blur: {
        get: function ()
        {
            return this.uniforms.blur.value;
        },
        set: function (value)
        {
            this.uniforms.blur.value = value;
        }
    },

    /**
     * The strength of the gradient blur.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    gradientBlur: {
        get: function ()
        {
            return this.uniforms.gradientBlur.value;
        },
        set: function (value)
        {
            this.uniforms.gradientBlur.value = value;
        }
    },

    /**
     * The X value to start the effect at.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    start: {
        get: function ()
        {
            return this.uniforms.start.value;
        },
        set: function (value)
        {
            this.uniforms.start.value = value;
            this.updateDelta();
        }
    },

    /**
     * The X value to end the effect at.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    end: {
        get: function ()
        {
            return this.uniforms.end.value;
        },
        set: function (value)
        {
            this.uniforms.end.value = value;
            this.updateDelta();
        }
    }
});

},{"../../core":29}],111:[function(require,module,exports){
var core = require('../../core'),
    TiltShiftXFilter = require('./TiltShiftXFilter'),
    TiltShiftYFilter = require('./TiltShiftYFilter');

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShift Filter. Manages the pass of both a TiltShiftXFilter and TiltShiftYFilter.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function TiltShiftFilter()
{
    core.AbstractFilter.call(this);

    this.tiltShiftXFilter = new TiltShiftXFilter();
    this.tiltShiftYFilter = new TiltShiftYFilter();
}

TiltShiftFilter.prototype = Object.create(core.AbstractFilter.prototype);
TiltShiftFilter.prototype.constructor = TiltShiftFilter;
module.exports = TiltShiftFilter;

TiltShiftFilter.prototype.applyFilter = function (renderer, input, output)
{
    var renderTarget = renderer.filterManager.getRenderTarget(true);

    this.tiltShiftXFilter.applyFilter(renderer, input, renderTarget);

    this.tiltShiftYFilter.applyFilter(renderer, renderTarget, output);

    renderer.filterManager.returnRenderTarget(renderTarget);
};

Object.defineProperties(TiltShiftFilter.prototype, {
    /**
     * The strength of the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftFilter#
     */
    blur: {
        get: function ()
        {
            return this.tiltShiftXFilter.blur;
        },
        set: function (value)
        {
            this.tiltShiftXFilter.blur = this.tiltShiftYFilter.blur = value;
        }
    },

    /**
     * The strength of the gradient blur.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftFilter#
     */
    gradientBlur: {
        get: function ()
        {
            return this.tiltShiftXFilter.gradientBlur;
        },
        set: function (value)
        {
            this.tiltShiftXFilter.gradientBlur = this.tiltShiftYFilter.gradientBlur = value;
        }
    },

    /**
     * The Y value to start the effect at.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftFilter#
     */
    start: {
        get: function ()
        {
            return this.tiltShiftXFilter.start;
        },
        set: function (value)
        {
            this.tiltShiftXFilter.start = this.tiltShiftYFilter.start = value;
        }
    },

    /**
     * The Y value to end the effect at.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftFilter#
     */
    end: {
        get: function ()
        {
            return this.tiltShiftXFilter.end;
        },
        set: function (value)
        {
            this.tiltShiftXFilter.end = this.tiltShiftYFilter.end = value;
        }
    }
});

},{"../../core":29,"./TiltShiftXFilter":112,"./TiltShiftYFilter":113}],112:[function(require,module,exports){
var TiltShiftAxisFilter = require('./TiltShiftAxisFilter');

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShiftXFilter.
 *
 * @class
 * @extends PIXI.TiltShiftAxisFilter
 * @memberof PIXI.filters
 */
function TiltShiftXFilter()
{
    TiltShiftAxisFilter.call(this);
}

TiltShiftXFilter.prototype = Object.create(TiltShiftAxisFilter.prototype);
TiltShiftXFilter.prototype.constructor = TiltShiftXFilter;
module.exports = TiltShiftXFilter;

/**
 * Updates the filter delta values.
 *
 */
TiltShiftXFilter.prototype.updateDelta = function ()
{
    var dx = this.uniforms.end.value.x - this.uniforms.start.value.x;
    var dy = this.uniforms.end.value.y - this.uniforms.start.value.y;
    var d = Math.sqrt(dx * dx + dy * dy);

    this.uniforms.delta.value.x = dx / d;
    this.uniforms.delta.value.y = dy / d;
};

},{"./TiltShiftAxisFilter":110}],113:[function(require,module,exports){
var TiltShiftAxisFilter = require('./TiltShiftAxisFilter');

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShiftYFilter.
 *
 * @class
 * @extends PIXI.TiltShiftAxisFilter
 * @memberof PIXI.filters
 */
function TiltShiftYFilter()
{
    TiltShiftAxisFilter.call(this);
}

TiltShiftYFilter.prototype = Object.create(TiltShiftAxisFilter.prototype);
TiltShiftYFilter.prototype.constructor = TiltShiftYFilter;
module.exports = TiltShiftYFilter;

/**
 * Updates the filter delta values.
 *
 */
TiltShiftYFilter.prototype.updateDelta = function ()
{
    var dx = this.uniforms.end.value.x - this.uniforms.start.value.x;
    var dy = this.uniforms.end.value.y - this.uniforms.start.value.y;
    var d = Math.sqrt(dx * dx + dy * dy);

    this.uniforms.delta.value.x = -dy / d;
    this.uniforms.delta.value.y = dx / d;
};

},{"./TiltShiftAxisFilter":110}],114:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * This filter applies a twist effect making display objects appear twisted in the given direction.
 *
 * @class
 * @extends PIXI.AbstractFilter
 * @memberof PIXI.filters
 */
function TwistFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float radius;\nuniform float angle;\nuniform vec2 offset;\n\nvoid main(void)\n{\n   vec2 coord = vTextureCoord - offset;\n   float dist = length(coord);\n\n   if (dist < radius)\n   {\n       float ratio = (radius - dist) / radius;\n       float angleMod = ratio * ratio * angle;\n       float s = sin(angleMod);\n       float c = cos(angleMod);\n       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);\n   }\n\n   gl_FragColor = texture2D(uSampler, coord+offset);\n}\n",
        // custom uniforms
        {
            radius:     { type: '1f', value: 0.5 },
            angle:      { type: '1f', value: 5 },
            offset:     { type: 'v2', value: { x: 0.5, y: 0.5 } }
        }
    );
}

TwistFilter.prototype = Object.create(core.AbstractFilter.prototype);
TwistFilter.prototype.constructor = TwistFilter;
module.exports = TwistFilter;

Object.defineProperties(TwistFilter.prototype, {
    /**
     * This point describes the the offset of the twist.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.TwistFilter#
     */
    offset: {
        get: function ()
        {
            return this.uniforms.offset.value;
        },
        set: function (value)
        {
            this.uniforms.offset.value = value;
        }
    },

    /**
     * This radius of the twist.
     *
     * @member {number}
     * @memberof PIXI.filters.TwistFilter#
     */
    radius: {
        get: function ()
        {
            return this.uniforms.radius.value;
        },
        set: function (value)
        {
            this.uniforms.radius.value = value;
        }
    },

    /**
     * This angle of the twist.
     *
     * @member {number}
     * @memberof PIXI.filters.TwistFilter#
     */
    angle: {
        get: function ()
        {
            return this.uniforms.angle.value;
        },
        set: function (value)
        {
            this.uniforms.angle.value = value;
        }
    }
});

},{"../../core":29}],115:[function(require,module,exports){
(function (global){
// run the polyfills
require('./polyfill');

var core = module.exports = require('./core');

// add core plugins.
core.extras         = require('./extras');
core.filters        = require('./filters');
core.interaction    = require('./interaction');
core.loaders        = require('./loaders');
core.mesh           = require('./mesh');
core.accessibility  = require('./accessibility');

// export a premade loader instance
/**
 * A premade instance of the loader that can be used to loader resources.
 *
 * @name loader
 * @memberof PIXI
 * @property {PIXI.loaders.Loader}
 */
core.loader = new core.loaders.Loader();

// mixin the deprecation features.
Object.assign(core, require('./deprecation'));

// Always export pixi globally.
global.PIXI = core;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./accessibility":21,"./core":29,"./deprecation":79,"./extras":86,"./filters":103,"./interaction":118,"./loaders":121,"./mesh":128,"./polyfill":133}],116:[function(require,module,exports){
var core = require('../core');

/**
 * Holds all information related to an Interaction event
 *
 * @class
 * @memberof PIXI.interaction
 */
function InteractionData()
{
    /**
     * This point stores the global coords of where the touch/mouse event happened
     *
     * @member {PIXI.Point}
     */
    this.global = new core.Point();

    /**
     * The target Sprite that was interacted with
     *
     * @member {PIXI.Sprite}
     */
    this.target = null;

    /**
     * When passed to an event handler, this will be the original DOM Event that was captured
     *
     * @member {Event}
     */
    this.originalEvent = null;
}

InteractionData.prototype.constructor = InteractionData;
module.exports = InteractionData;

/**
 * This will return the local coordinates of the specified displayObject for this InteractionData
 *
 * @param displayObject {PIXI.DisplayObject} The DisplayObject that you would like the local coords off
 * @param [point] {PIXI.Point} A Point object in which to store the value, optional (otherwise will create a new point)
 * @param [globalPos] {PIXI.Point} A Point object containing your custom global coords, optional (otherwise will use the current global coords)
 * @return {PIXI.Point} A point containing the coordinates of the InteractionData position relative to the DisplayObject
 */
InteractionData.prototype.getLocalPosition = function (displayObject, point, globalPos)
{
    return displayObject.worldTransform.applyInverse(globalPos || this.global, point);
};

},{"../core":29}],117:[function(require,module,exports){
var core = require('../core'),
    InteractionData = require('./InteractionData');

// Mix interactiveTarget into core.DisplayObject.prototype
Object.assign(
    core.DisplayObject.prototype,
    require('./interactiveTarget')
);

/**
 * The interaction manager deals with mouse and touch events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * @class
 * @memberof PIXI.interaction
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} A reference to the current renderer
 * @param [options] {object}
 * @param [options.autoPreventDefault=true] {boolean} Should the manager automatically prevent default browser actions.
 * @param [options.interactionFrequency=10] {number} Frequency increases the interaction events will be checked.
 */
function InteractionManager(renderer, options)
{
    options = options || {};

    /**
     * The renderer this interaction manager works for.
     *
     * @member {PIXI.SystemRenderer}
     */
    this.renderer = renderer;

    /**
     * Should default browser actions automatically be prevented.
     *
     * @member {boolean}
     * @default true
     */
    this.autoPreventDefault = options.autoPreventDefault !== undefined ? options.autoPreventDefault : true;

    /**
     * As this frequency increases the interaction events will be checked more often.
     *
     * @member {number}
     * @default 10
     */
    this.interactionFrequency = options.interactionFrequency || 10;

    /**
     * The mouse data
     *
     * @member {PIXI.interaction.InteractionData}
     */
    this.mouse = new InteractionData();

    /**
     * An event data object to handle all the event tracking/dispatching
     *
     * @member {object}
     */
    this.eventData = {
        stopped: false,
        target: null,
        type: null,
        data: this.mouse,
        stopPropagation:function(){
            this.stopped = true;
        }
    };

    /**
     * Tiny little interactiveData pool !
     *
     * @member {PIXI.interaction.InteractionData[]}
     */
    this.interactiveDataPool = [];

    /**
     * The DOM element to bind to.
     *
     * @member {HTMLElement}
     * @private
     */
    this.interactionDOMElement = null;

    /**
     * This property determins if mousemove and touchmove events are fired only when the cursror is over the object
     * Setting to true will make things work more in line with how the DOM verison works.
     * Setting to false can make things easier for things like dragging
     * It is currently set to false as this is how pixi used to work. This will be set to true in future versions of pixi.
     * @member {HTMLElement}
     * @private
     */
    this.moveWhenInside = false;
    
    /**
     * Have events been attached to the dom element?
     *
     * @member {boolean}
     * @private
     */
    this.eventsAdded = false;

    //this will make it so that you don't have to call bind all the time

    /**
     * @member {Function}
     */
    this.onMouseUp = this.onMouseUp.bind(this);
    this.processMouseUp = this.processMouseUp.bind( this );


    /**
     * @member {Function}
     */
    this.onMouseDown = this.onMouseDown.bind(this);
    this.processMouseDown = this.processMouseDown.bind( this );

    /**
     * @member {Function}
     */
    this.onMouseMove = this.onMouseMove.bind( this );
    this.processMouseMove = this.processMouseMove.bind( this );

    /**
     * @member {Function}
     */
    this.onMouseOut = this.onMouseOut.bind(this);
    this.processMouseOverOut = this.processMouseOverOut.bind( this );


    /**
     * @member {Function}
     */
    this.onTouchStart = this.onTouchStart.bind(this);
    this.processTouchStart = this.processTouchStart.bind(this);

    /**
     * @member {Function}
     */
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.processTouchEnd = this.processTouchEnd.bind(this);

    /**
     * @member {Function}
     */
    this.onTouchMove = this.onTouchMove.bind(this);
    this.processTouchMove = this.processTouchMove.bind(this);

    /**
     * @member {number}
     */
    this.last = 0;

    /**
     * The css style of the cursor that is being used
     * @member {string}
     */
    this.currentCursorStyle = 'inherit';

    /**
     * Internal cached var
     * @member {PIXI.Point}
     * @private
     */
    this._tempPoint = new core.Point();
    

    /**
     * The current resolution
     * @member {number}
     */
    this.resolution = 1;

    this.setTargetElement(this.renderer.view, this.renderer.resolution);
}

InteractionManager.prototype.constructor = InteractionManager;
module.exports = InteractionManager;

/**
 * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
 * other DOM elements on top of the renderers Canvas element. With this you'll be bale to deletegate
 * another DOM element to receive those events.
 *
 * @param element {HTMLElement} the DOM element which will receive mouse and touch events.
 * @param [resolution=1] {number} THe resolution of the new element (relative to the canvas).
 * @private
 */
InteractionManager.prototype.setTargetElement = function (element, resolution)
{
    this.removeEvents();

    this.interactionDOMElement = element;

    this.resolution = resolution || 1;

    this.addEvents();
};

/**
 * Registers all the DOM events
 *
 * @private
 */
InteractionManager.prototype.addEvents = function ()
{
    if (!this.interactionDOMElement)
    {
        return;
    }

    core.ticker.shared.add(this.update, this);

    if (window.navigator.msPointerEnabled)
    {
        this.interactionDOMElement.style['-ms-content-zooming'] = 'none';
        this.interactionDOMElement.style['-ms-touch-action'] = 'none';
    }

    window.document.addEventListener('mousemove',    this.onMouseMove, true);
    this.interactionDOMElement.addEventListener('mousedown',    this.onMouseDown, true);
    this.interactionDOMElement.addEventListener('mouseout',     this.onMouseOut, true);

    this.interactionDOMElement.addEventListener('touchstart',   this.onTouchStart, true);
    this.interactionDOMElement.addEventListener('touchend',     this.onTouchEnd, true);
    this.interactionDOMElement.addEventListener('touchmove',    this.onTouchMove, true);

    window.addEventListener('mouseup',  this.onMouseUp, true);

    this.eventsAdded = true;
};

/**
 * Removes all the DOM events that were previously registered
 *
 * @private
 */
InteractionManager.prototype.removeEvents = function ()
{
    if (!this.interactionDOMElement)
    {
        return;
    }

    core.ticker.shared.remove(this.update);

    if (window.navigator.msPointerEnabled)
    {
        this.interactionDOMElement.style['-ms-content-zooming'] = '';
        this.interactionDOMElement.style['-ms-touch-action'] = '';
    }

    window.document.removeEventListener('mousemove', this.onMouseMove, true);
    this.interactionDOMElement.removeEventListener('mousedown', this.onMouseDown, true);
    this.interactionDOMElement.removeEventListener('mouseout',  this.onMouseOut, true);

    this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
    this.interactionDOMElement.removeEventListener('touchend',  this.onTouchEnd, true);
    this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);

    this.interactionDOMElement = null;

    window.removeEventListener('mouseup',  this.onMouseUp, true);

    this.eventsAdded = false;
};

/**
 * Updates the state of interactive objects.
 * Invoked by a throttled ticker update from
 * {@link PIXI.ticker.shared}.
 *
 * @param deltaTime {number}
 */
InteractionManager.prototype.update = function (deltaTime)
{
    this._deltaTime += deltaTime;

    if (this._deltaTime < this.interactionFrequency)
    {
        return;
    }

    this._deltaTime = 0;

    if (!this.interactionDOMElement)
    {
        return;
    }

    // if the user move the mouse this check has already been dfone using the mouse move!
    if(this.didMove)
    {
        this.didMove = false;
        return;
    }

    this.cursor = 'inherit';

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, true );

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
    }

    //TODO
};

/**
 * Dispatches an event on the display object that was interacted with
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} the display object in question
 * @param eventString {string} the name of the event (e.g, mousedown)
 * @param eventData {object} the event data object
 * @private
 */
InteractionManager.prototype.dispatchEvent = function ( displayObject, eventString, eventData )
{
    if(!eventData.stopped)
    {
        eventData.target = displayObject;
        eventData.type = eventString;

        displayObject.emit( eventString, eventData );

        if( displayObject[eventString] )
        {
            displayObject[eventString]( eventData );
        }
    }
};

/**
 * Maps x and y coords from a DOM object and maps them correctly to the pixi view. The resulting value is stored in the point.
 * This takes into account the fact that the DOM element could be scaled and positioned anywhere on the screen.
 *
 * @param  {PIXI.Point} point the point that the result will be stored in
 * @param  {number} x     the x coord of the position to map
 * @param  {number} y     the y coord of the position to map
 */
InteractionManager.prototype.mapPositionToPoint = function ( point, x, y )
{
    var rect = this.interactionDOMElement.getBoundingClientRect();
    point.x = ( ( x - rect.left ) * (this.interactionDOMElement.width  / rect.width  ) ) / this.resolution;
    point.y = ( ( y - rect.top  ) * (this.interactionDOMElement.height / rect.height ) ) / this.resolution;
};

/**
 * This function is provides a neat way of crawling through the scene graph and running a specified function on all interactive objects it finds.
 * It will also take care of hit testing the interactive objects and passes the hit across in the function.
 *
 * @param  {PIXI.Point} point the point that is tested for collision
 * @param  {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject the displayObject that will be hit test (recurcsivly crawls its children)
 * @param  {Function} func the function that will be called on each interactive object. The displayObject and hit will be passed to the function
 * @param  {boolean} hitTest this indicates if the objects inside should be hit test against the point
 * @return {boolean} returns true if the displayObject hit the point
 */
InteractionManager.prototype.processInteractive = function (point, displayObject, func, hitTest, interactive)
{
    if(!displayObject || !displayObject.visible)
    {
        return false;
    }

    // Took a little while to rework this function correctly! But now it is done and nice and optimised. ^_^
    // 
    // This function will now loop through all objects and then only hit test the objects it HAS to, not all of them. MUCH faster..
    // An object will be hit test if the following is true:
    // 
    // 1: It is interactive.
    // 2: It belongs to a parent that is interactive AND one of the parents children have not already been hit.
    // 
    // As another little optimisation once an interactive object has been hit we can carry on through the scenegraph, but we know that there will be no more hits! So we can avoid extra hit tests
    // A final optimisation is that an object is not hit test directly if a child has already been hit.
    
    var hit = false,
        interactiveParent = interactive = displayObject.interactive || interactive;

    // if the displayobject has a hitArea, then it does not need to hitTest children.
    if(displayObject.hitArea)
    {
        interactiveParent = false;
    }

    // ** FREE TIP **! If an object is not interacttive or has no buttons in it (such as a game scene!) set interactiveChildren to false for that displayObject.
    // This will allow pixi to completly ignore and bypass checking the displayObjects children.
    if(displayObject.interactiveChildren)
    {       
        var children = displayObject.children;
        
        for (var i = children.length-1; i >= 0; i--)
        {

            var child = children[i];

            // time to get recursive.. if this function will return if somthing is hit..
            if(this.processInteractive(point, child, func, hitTest, interactiveParent))
            {
                // its a good idea to check if a child has lost its parent.
                // this means it has been removed whilst looping so its best
                if(!child.parent)
                {
                    continue;
                }

                hit = true;

                // we no longer need to hit test any more objects in this container as we we now know the parent has been hit
                interactiveParent = false;
                
                // If the child is interactive , that means that the object hit was actually interactive and not just the child of an interactive object. 
                // This means we no longer need to hit test anything else. We still need to run through all objects, but we don't need to perform any hit tests.
                if(child.interactive)
                {
                    hitTest = false;
                }
            }
        }
    }

    // no point running this if the item is not interactive or does not have an interactive parent.
    if(interactive)
    {
        // if we are hit testing (as in we have no hit any objects yet)
        // We also don't need to worry about hit testing if once of the displayObjects children has already been hit!
        if(hitTest && !hit)
        {  
            if(displayObject.hitArea)
            {
                displayObject.worldTransform.applyInverse(point,  this._tempPoint);
                hit = displayObject.hitArea.contains( this._tempPoint.x, this._tempPoint.y );
            }
            else if(displayObject.containsPoint)
            {
                hit = displayObject.containsPoint(point);
            }
        }

        if(displayObject.interactive)
        {
            func(displayObject, hit); 
        }
    }

    return hit;
  
};


/**
 * Is called when the mouse button is pressed down on the renderer element
 *
 * @param event {Event} The DOM event of a mouse button being pressed down
 * @private
 */
InteractionManager.prototype.onMouseDown = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    if (this.autoPreventDefault)
    {
        this.mouse.originalEvent.preventDefault();
    }

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseDown, true );
};

/**
 * Processes the result of the mouse down check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the dispay object
 * @private
 */
InteractionManager.prototype.processMouseDown = function ( displayObject, hit )
{
    var e = this.mouse.originalEvent;
    
    var isRightButton = e.button === 2 || e.which === 3;

    if(hit)
    {
        displayObject[ isRightButton ? '_isRightDown' : '_isLeftDown' ] = true;
        this.dispatchEvent( displayObject, isRightButton ? 'rightdown' : 'mousedown', this.eventData );
    }
};



/**
 * Is called when the mouse button is released on the renderer element
 *
 * @param event {Event} The DOM event of a mouse button being released
 * @private
 */
InteractionManager.prototype.onMouseUp = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseUp, true );
};

/**
 * Processes the result of the mouse up check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseUp = function ( displayObject, hit )
{
    var e = this.mouse.originalEvent;

    var isRightButton = e.button === 2 || e.which === 3;
    var isDown =  isRightButton ? '_isRightDown' : '_isLeftDown';

    if(hit)
    {
        this.dispatchEvent( displayObject, isRightButton ? 'rightup' : 'mouseup', this.eventData );

        if( displayObject[ isDown ] )
        {
            displayObject[ isDown ] = false;
            this.dispatchEvent( displayObject, isRightButton ? 'rightclick' : 'click', this.eventData );
        }
    }
    else
    {
        if( displayObject[ isDown ] )
        {
            displayObject[ isDown ] = false;
            this.dispatchEvent( displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', this.eventData );
        }
    }
};


/**
 * Is called when the mouse moves across the renderer element
 *
 * @param event {Event} The DOM event of the mouse moving
 * @private
 */
InteractionManager.prototype.onMouseMove = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.didMove = true;

    this.cursor = 'inherit';

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseMove, true );

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
    }

    //TODO BUG for parents ineractive object (border order issue)
};

/**
 * Processes the result of the mouse move check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseMove = function ( displayObject, hit )
{
    this.processMouseOverOut(displayObject, hit);
    
    // only display on mouse over
    if(!this.moveWhenInside || hit)
    {
        this.dispatchEvent( displayObject, 'mousemove', this.eventData);
    }
};


/**
 * Is called when the mouse is moved out of the renderer element
 *
 * @param event {Event} The DOM event of a mouse being moved out
 * @private
 */
InteractionManager.prototype.onMouseOut = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.stopped = false;

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.interactionDOMElement.style.cursor = 'inherit';

    // TODO optimize by not check EVERY TIME! maybe half as often? //
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY );

    this.processInteractive( this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, false );
};

/**
 * Processes the result of the mouse over/out check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseOverOut = function ( displayObject, hit )
{
    if(hit)
    {
        if(!displayObject._over)
        {
            displayObject._over = true;
            this.dispatchEvent( displayObject, 'mouseover', this.eventData );
        }

        if (displayObject.buttonMode)
        {
            this.cursor = displayObject.defaultCursor;
        }
    }
    else
    {
        if(displayObject._over)
        {
            displayObject._over = false;
            this.dispatchEvent( displayObject, 'mouseout', this.eventData);
        }
    }
};


/**
 * Is called when a touch is started on the renderer element
 *
 * @param event {Event} The DOM event of a touch starting on the renderer view
 * @private
 */
InteractionManager.prototype.onTouchStart = function (event)
{
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];
        //TODO POOL
        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        this.eventData.data = touchData;
        this.eventData.stopped = false;

        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchStart, true );

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of a touch check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchStart = function ( displayObject, hit )
{
    if(hit)
    {
        displayObject._touchDown = true;
        this.dispatchEvent( displayObject, 'touchstart', this.eventData );
    }
};


/**
 * Is called when a touch ends on the renderer element
 *
 * @param event {Event} The DOM event of a touch ending on the renderer view
 */
InteractionManager.prototype.onTouchEnd = function (event)
{
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];

        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        //TODO this should be passed along.. no set
        this.eventData.data = touchData;
        this.eventData.stopped = false;


        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchEnd, true );

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of the end of a touch and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchEnd = function ( displayObject, hit )
{
    if(hit)
    {
        this.dispatchEvent( displayObject, 'touchend', this.eventData );

        if( displayObject._touchDown )
        {
            displayObject._touchDown = false;
            this.dispatchEvent( displayObject, 'tap', this.eventData );
        }
    }
    else
    {
        if( displayObject._touchDown )
        {
            displayObject._touchDown = false;
            this.dispatchEvent( displayObject, 'touchendoutside', this.eventData );
        }
    }
};

/**
 * Is called when a touch is moved across the renderer element
 *
 * @param event {Event} The DOM event of a touch moving across the renderer view
 * @private
 */
InteractionManager.prototype.onTouchMove = function (event)
{
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];

        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        this.eventData.data = touchData;
        this.eventData.stopped = false;

        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchMove, this.moveWhenInside );

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of a touch move check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchMove = function ( displayObject, hit )
{
    if(!this.moveWhenInside || hit)
    {
        this.dispatchEvent( displayObject, 'touchmove', this.eventData);
    }
};

/**
 * Grabs an interaction data object from the internal pool
 *
 * @param touchEvent {EventData} The touch event we need to pair with an interactionData object
 *
 * @private
 */
InteractionManager.prototype.getTouchData = function (touchEvent)
{
    var touchData = this.interactiveDataPool.pop();

    if(!touchData)
    {
        touchData = new InteractionData();
    }

    touchData.identifier = touchEvent.identifier;
    this.mapPositionToPoint( touchData.global, touchEvent.clientX, touchEvent.clientY );

    if(navigator.isCocoonJS)
    {
        touchData.global.x = touchData.global.x / this.resolution;
        touchData.global.y = touchData.global.y / this.resolution;
    }

    touchEvent.globalX = touchData.global.x;
    touchEvent.globalY = touchData.global.y;

    return touchData;
};

/**
 * Returns an interaction data object to the internal pool
 *
 * @param touchData {PIXI.interaction.InteractionData} The touch data object we want to return to the pool
 *
 * @private
 */
InteractionManager.prototype.returnTouchData = function ( touchData )
{
    this.interactiveDataPool.push( touchData );
};

/**
 * Destroys the interaction manager
 *
 */
InteractionManager.prototype.destroy = function () {
    this.removeEvents();

    this.renderer = null;

    this.mouse = null;

    this.eventData = null;

    this.interactiveDataPool = null;

    this.interactionDOMElement = null;

    this.onMouseUp = null;
    this.processMouseUp = null;


    this.onMouseDown = null;
    this.processMouseDown = null;

    this.onMouseMove = null;
    this.processMouseMove = null;

    this.onMouseOut = null;
    this.processMouseOverOut = null;


    this.onTouchStart = null;
    this.processTouchStart = null;

    this.onTouchEnd = null;
    this.processTouchEnd = null;

    this.onTouchMove = null;
    this.processTouchMove = null;

    this._tempPoint = null;
};

core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
core.CanvasRenderer.registerPlugin('interaction', InteractionManager);

},{"../core":29,"./InteractionData":116,"./interactiveTarget":119}],118:[function(require,module,exports){
/**
 * @file        Main export of the PIXI interactions library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.interaction
 */
module.exports = {
    InteractionData:    require('./InteractionData'),
    InteractionManager: require('./InteractionManager'),
    interactiveTarget:  require('./interactiveTarget')
};

},{"./InteractionData":116,"./InteractionManager":117,"./interactiveTarget":119}],119:[function(require,module,exports){
/**
 * Default property values of interactive objects
 * used by {@link PIXI.interaction.InteractionManager}.
 *
 * @mixin
 * @memberof PIXI.interaction
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          MyObject.prototype,
 *          PIXI.interaction.interactiveTarget
 *      );
 */
var interactiveTarget = {
    /**
     * @todo Needs docs.
     */
    interactive: false,
    /**
     * @todo Needs docs.
     */
    buttonMode: false,
    /**
     * @todo Needs docs.
     */
    interactiveChildren: true,
    /**
     * @todo Needs docs.
     */
    defaultCursor: 'pointer',

    // some internal checks..

    /**
     * @todo Needs docs.
     * @private
     */
    _over: false,
    /**
     * @todo Needs docs.
     * @private
     */
    _touchDown: false
};

module.exports = interactiveTarget;

},{}],120:[function(require,module,exports){
var Resource = require('resource-loader').Resource,
    core = require('../core'),
    extras = require('../extras'),
    path = require('path');


function parse(resource, texture) {
    var data = {};
    var info = resource.data.getElementsByTagName('info')[0];
    var common = resource.data.getElementsByTagName('common')[0];

    data.font = info.getAttribute('face');
    data.size = parseInt(info.getAttribute('size'), 10);
    data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
    data.chars = {};

    //parse letters
    var letters = resource.data.getElementsByTagName('char');

    for (var i = 0; i < letters.length; i++)
    {
        var charCode = parseInt(letters[i].getAttribute('id'), 10);

        var textureRect = new core.Rectangle(
            parseInt(letters[i].getAttribute('x'), 10) + texture.frame.x,
            parseInt(letters[i].getAttribute('y'), 10) + texture.frame.y,
            parseInt(letters[i].getAttribute('width'), 10),
            parseInt(letters[i].getAttribute('height'), 10)
        );

        data.chars[charCode] = {
            xOffset: parseInt(letters[i].getAttribute('xoffset'), 10),
            yOffset: parseInt(letters[i].getAttribute('yoffset'), 10),
            xAdvance: parseInt(letters[i].getAttribute('xadvance'), 10),
            kerning: {},
            texture: new core.Texture(texture.baseTexture, textureRect)

        };
    }

    //parse kernings
    var kernings = resource.data.getElementsByTagName('kerning');
    for (i = 0; i < kernings.length; i++)
    {
        var first = parseInt(kernings[i].getAttribute('first'), 10);
        var second = parseInt(kernings[i].getAttribute('second'), 10);
        var amount = parseInt(kernings[i].getAttribute('amount'), 10);

        if(data.chars[second])
        {
            data.chars[second].kerning[first] = amount;
        }
    }

    resource.bitmapFont = data;

    // I'm leaving this as a temporary fix so we can test the bitmap fonts in v3
    // but it's very likely to change
    extras.BitmapText.fonts[data.font] = data;
}


module.exports = function ()
{
    return function (resource, next)
    {
        // skip if no data or not xml data
        if (!resource.data || !resource.isXml)
        {
            return next();
        }

        // skip if not bitmap font data, using some silly duck-typing
        if (
            resource.data.getElementsByTagName('page').length === 0 ||
            resource.data.getElementsByTagName('info').length === 0 ||
            resource.data.getElementsByTagName('info')[0].getAttribute('face') === null
            )
        {
            return next();
        }

        var xmlUrl = path.dirname(resource.url);

        if (xmlUrl === '.') {
            xmlUrl = '';
        }

        if (this.baseUrl && xmlUrl) {
            // if baseurl has a trailing slash then add one to xmlUrl so the replace works below
            if (this.baseUrl.charAt(this.baseUrl.length - 1) === '/') {
                xmlUrl += '/';
            }

            // remove baseUrl from xmlUrl
            xmlUrl = xmlUrl.replace(this.baseUrl, '');
        }

        // if there is an xmlUrl now, it needs a trailing slash. Ensure that it does if the string isn't empty.
        if (xmlUrl && xmlUrl.charAt(xmlUrl.length - 1) !== '/') {
            xmlUrl += '/';
        }
        var textureUrl = xmlUrl + resource.data.getElementsByTagName('page')[0].getAttribute('file');
        if (core.utils.TextureCache[textureUrl]) {
            //reuse existing texture
            parse(resource, core.utils.TextureCache[textureUrl]);
            next();
        }
        else {
            var loadOptions = {
                crossOrigin: resource.crossOrigin,
                loadType: Resource.LOAD_TYPE.IMAGE,
                metadata: resource.metadata.imageMetadata
            };
            // load the texture for the font
            this.add(resource.name + '_image', textureUrl, loadOptions, function (res) {
                parse(resource, res.texture);
                next();
            });
        }
    };
};

},{"../core":29,"../extras":86,"path":2,"resource-loader":16}],121:[function(require,module,exports){
/**
 * @file        Main export of the PIXI loaders library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.loaders
 */
module.exports = {
    Loader:             require('./loader'),

    // parsers
    bitmapFontParser:   require('./bitmapFontParser'),
    spritesheetParser:  require('./spritesheetParser'),
    textureParser:      require('./textureParser'),
    Resource:           require('resource-loader').Resource
};

},{"./bitmapFontParser":120,"./loader":122,"./spritesheetParser":123,"./textureParser":124,"resource-loader":16}],122:[function(require,module,exports){
var ResourceLoader = require('resource-loader'),
    textureParser = require('./textureParser'),
    spritesheetParser = require('./spritesheetParser'),
    bitmapFontParser = require('./bitmapFontParser');

/**
 *
 * The new loader, extends Resource Loader by Chad Engler : https://github.com/englercj/resource-loader
 *
 * ```js
 * var loader = PIXI.loader; // pixi exposes a premade instance for you to use.
 * //or
 * var loader = new PIXI.loaders.Loader(); // you can also create your own if you want
 *
 * loader.add('bunny',"data/bunny.png");
 *
 * loader.once('complete',onAssetsLoaded);
 *
 * loader.load();
 * ```
 *
 * @class
 * @extends PIXI.ResourceLoader
 * @memberof PIXI.loaders
 * @param [baseUrl=''] {string} The base url for all resources loaded by this loader.
 * @param [concurrency=10] {number} The number of resources to load concurrently.
 */
function Loader(baseUrl, concurrency)
{
    ResourceLoader.call(this, baseUrl, concurrency);

    for (var i = 0; i < Loader._pixiMiddleware.length; ++i) {
        this.use(Loader._pixiMiddleware[i]());
    }
}

Loader.prototype = Object.create(ResourceLoader.prototype);
Loader.prototype.constructor = Loader;

module.exports = Loader;

Loader._pixiMiddleware = [
    // parse any blob into more usable objects (e.g. Image)
    ResourceLoader.middleware.parsing.blob,
    // parse any Image objects into textures
    textureParser,
    // parse any spritesheet data into multiple textures
    spritesheetParser,
    // parse any spritesheet data into multiple textures
    bitmapFontParser
];

Loader.addPixiMiddleware = function (fn) {
    Loader._pixiMiddleware.push(fn);
};

// Add custom extentions
var Resource = ResourceLoader.Resource;

Resource.setExtensionXhrType('fnt', Resource.XHR_RESPONSE_TYPE.DOCUMENT);

},{"./bitmapFontParser":120,"./spritesheetParser":123,"./textureParser":124,"resource-loader":16}],123:[function(require,module,exports){
var Resource = require('resource-loader').Resource,
    path = require('path'),
    core = require('../core');

module.exports = function ()
{
    return function (resource, next)
    {
        // skip if no data, its not json, or it isn't spritesheet data
        if (!resource.data || !resource.isJson || !resource.data.frames)
        {
            return next();
        }

        var loadOptions = {
            crossOrigin: resource.crossOrigin,
            loadType: Resource.LOAD_TYPE.IMAGE,
            metadata: resource.metadata.imageMetadata
        };

        var route = path.dirname(resource.url.replace(this.baseUrl, ''));

        var resolution = core.utils.getResolutionOfUrl( resource.url );

        // load the image for this sheet
        this.add(resource.name + '_image', route + '/' + resource.data.meta.image, loadOptions, function (res)
        {
            resource.textures = {};

            var frames = resource.data.frames;

            for (var i in frames)
            {
                var rect = frames[i].frame;

                if (rect)
                {
                    var size = null;
                    var trim = null;

                    if (frames[i].rotated) {
                        size = new core.Rectangle(rect.x, rect.y, rect.h, rect.w);
                    }
                    else {
                        size = new core.Rectangle(rect.x, rect.y, rect.w, rect.h);
                    }

                    //  Check to see if the sprite is trimmed
                    if (frames[i].trimmed)
                    {
                        trim = new core.Rectangle(
                            frames[i].spriteSourceSize.x / resolution,
                            frames[i].spriteSourceSize.y / resolution,
                            frames[i].sourceSize.w / resolution,
                            frames[i].sourceSize.h / resolution
                         );
                    }

                    // flip the width and height!
                    if (frames[i].rotated)
                    {
                        var temp = size.width;
                        size.width = size.height;
                        size.height = temp;
                    }

                    size.x /= resolution;
                    size.y /= resolution;
                    size.width /= resolution;
                    size.height /= resolution;

                    resource.textures[i] = new core.Texture(res.texture.baseTexture, size, size.clone(), trim, frames[i].rotated ? 2 : 0);

                    // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
                    core.utils.TextureCache[i] = resource.textures[i];
                }
            }

            next();
        });
    };
};

},{"../core":29,"path":2,"resource-loader":16}],124:[function(require,module,exports){
var core = require('../core');

module.exports = function ()
{
    return function (resource, next)
    {
        // create a new texture if the data is an Image object
        if (resource.data && resource.isImage)
        {
            var baseTexture = new core.BaseTexture(resource.data, null, core.utils.getResolutionOfUrl(resource.url));
            baseTexture.imageUrl = resource.url;
            resource.texture = new core.Texture(baseTexture);
            // lets also add the frame to pixi's global cache for fromFrame and fromImage fucntions
            core.utils.BaseTextureCache[resource.url] = baseTexture;
            core.utils.TextureCache[resource.url] = resource.texture;
        }

        next();
    };
};

},{"../core":29}],125:[function(require,module,exports){
var core = require('../core'),
    tempPoint = new core.Point(),
    tempPolygon = new core.Polygon();

/**
 * Base mesh class
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.mesh
 * @param texture {PIXI.Texture} The texture to use
 * @param [vertices] {Float32Array} if you want to specify the vertices
 * @param [uvs] {Float32Array} if you want to specify the uvs
 * @param [indices] {Uint16Array} if you want to specify the indices
 * @param [drawMode] {number} the drawMode, can be any of the Mesh.DRAW_MODES consts
 */
function Mesh(texture, vertices, uvs, indices, drawMode)
{
    core.Container.call(this);

    /**
     * The texture of the Mesh
     *
     * @member {PIXI.Texture}
     * @private
     */
    this._texture = null;

    /**
     * The Uvs of the Mesh
     *
     * @member {Float32Array}
     */
    this.uvs = uvs || new Float32Array([0, 0,
        1, 0,
        1, 1,
        0, 1]);

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    this.vertices = vertices || new Float32Array([0, 0,
        100, 0,
        100, 100,
        0, 100]);

    /*
     * @member {Uint16Array} An array containing the indices of the vertices
     */
    //  TODO auto generate this based on draw mode!
    this.indices = indices || new Uint16Array([0, 1, 3, 2]);

    /**
     * Whether the Mesh is dirty or not
     *
     * @member {boolean}
     */
    this.dirty = true;

    /**
     * The blend mode to be applied to the sprite. Set to `PIXI.BLEND_MODES.NORMAL` to remove any blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    this.blendMode = core.BLEND_MODES.NORMAL;

    /**
     * Triangles in canvas mode are automatically antialiased, use this value to force triangles to overlap a bit with each other.
     *
     * @member {number}
     */
    this.canvasPadding = 0;

    /**
     * The way the Mesh should be drawn, can be any of the {@link PIXI.mesh.Mesh.DRAW_MODES} consts
     *
     * @member {number}
     * @see PIXI.mesh.Mesh.DRAW_MODES
     */
    this.drawMode = drawMode || Mesh.DRAW_MODES.TRIANGLE_MESH;

    // run texture setter;
    this.texture = texture;

     /**
     * The default shader that is used if a mesh doesn't have a more specific one.
     *
     * @member {PIXI.Shader}
     */
    this.shader = null;
}

// constructor
Mesh.prototype = Object.create(core.Container.prototype);
Mesh.prototype.constructor = Mesh;
module.exports = Mesh;

Object.defineProperties(Mesh.prototype, {
    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.mesh.Mesh#
     */
    texture: {
        get: function ()
        {
            return  this._texture;
        },
        set: function (value)
        {
            if (this._texture === value)
            {
                return;
            }

            this._texture = value;

            if (value)
            {
                // wait for the texture to load
                if (value.baseTexture.hasLoaded)
                {
                    this._onTextureUpdate();
                }
                else
                {
                    value.once('update', this._onTextureUpdate, this);
                }
            }
        }
    }
});

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} a reference to the WebGL renderer
 * @private
 */
Mesh.prototype._renderWebGL = function (renderer)
{
    renderer.setObjectRenderer(renderer.plugins.mesh);
    renderer.plugins.mesh.render(this);
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer}
 * @private
 */
Mesh.prototype._renderCanvas = function (renderer)
{
    var context = renderer.context;

    var transform = this.worldTransform;

    if (renderer.roundPixels)
    {
        context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx | 0, transform.ty | 0);
    }
    else
    {
        context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
    }

    if (this.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH)
    {
        this._renderCanvasTriangleMesh(context);
    }
    else
    {
        this._renderCanvasTriangles(context);
    }
};

/**
 * Draws the object in Triangle Mesh mode using canvas
 *
 * @param context {CanvasRenderingContext2D} the current drawing context
 * @private
 */
Mesh.prototype._renderCanvasTriangleMesh = function (context)
{
    // draw triangles!!
    var vertices = this.vertices;
    var uvs = this.uvs;

    var length = vertices.length / 2;
    // this.count++;

    for (var i = 0; i < length - 2; i++)
    {
        // draw some triangles!
        var index = i * 2;
        this._renderCanvasDrawTriangle(context, vertices, uvs, index, (index + 2), (index + 4));
    }
};

/**
 * Draws the object in triangle mode using canvas
 *
 * @param context {CanvasRenderingContext2D} the current drawing context
 * @private
 */
Mesh.prototype._renderCanvasTriangles = function (context)
{
    // draw triangles!!
    var vertices = this.vertices;
    var uvs = this.uvs;
    var indices = this.indices;

    var length = indices.length;
    // this.count++;

    for (var i = 0; i < length; i += 3)
    {
        // draw some triangles!
        var index0 = indices[i] * 2, index1 = indices[i + 1] * 2, index2 = indices[i + 2] * 2;
        this._renderCanvasDrawTriangle(context, vertices, uvs, index0, index1, index2);
    }
};

/**
 * Draws one of the triangles that form this Mesh
 *
 * @param context {CanvasRenderingContext2D} the current drawing context
 * @param vertices {Float32Array} a reference to the vertices of the Mesh
 * @param uvs {Float32Array} a reference to the uvs of the Mesh
 * @param index0 {number} the index of the first vertex
 * @param index1 {number} the index of the second vertex
 * @param index2 {number} the index of the third vertex
 * @private
 */
Mesh.prototype._renderCanvasDrawTriangle = function (context, vertices, uvs, index0, index1, index2)
{
    var textureSource = this._texture.baseTexture.source;
    var textureWidth = this._texture.baseTexture.width;
    var textureHeight = this._texture.baseTexture.height;

    var x0 = vertices[index0], x1 = vertices[index1], x2 = vertices[index2];
    var y0 = vertices[index0 + 1], y1 = vertices[index1 + 1], y2 = vertices[index2 + 1];

    var u0 = uvs[index0] * textureWidth, u1 = uvs[index1] * textureWidth, u2 = uvs[index2] * textureWidth;
    var v0 = uvs[index0 + 1] * textureHeight, v1 = uvs[index1 + 1] * textureHeight, v2 = uvs[index2 + 1] * textureHeight;

    if (this.canvasPadding > 0)
    {
        var paddingX = this.canvasPadding / this.worldTransform.a;
        var paddingY = this.canvasPadding / this.worldTransform.d;
        var centerX = (x0 + x1 + x2) / 3;
        var centerY = (y0 + y1 + y2) / 3;

        var normX = x0 - centerX;
        var normY = y0 - centerY;

        var dist = Math.sqrt(normX * normX + normY * normY);
        x0 = centerX + (normX / dist) * (dist + paddingX);
        y0 = centerY + (normY / dist) * (dist + paddingY);

        //

        normX = x1 - centerX;
        normY = y1 - centerY;

        dist = Math.sqrt(normX * normX + normY * normY);
        x1 = centerX + (normX / dist) * (dist + paddingX);
        y1 = centerY + (normY / dist) * (dist + paddingY);

        normX = x2 - centerX;
        normY = y2 - centerY;

        dist = Math.sqrt(normX * normX + normY * normY);
        x2 = centerX + (normX / dist) * (dist + paddingX);
        y2 = centerY + (normY / dist) * (dist + paddingY);
    }

    context.save();
    context.beginPath();


    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);

    context.closePath();

    context.clip();

    // Compute matrix transform
    var delta =  (u0 * v1)      + (v0 * u2)      + (u1 * v2)      - (v1 * u2)      - (v0 * u1)      - (u0 * v2);
    var deltaA = (x0 * v1)      + (v0 * x2)      + (x1 * v2)      - (v1 * x2)      - (v0 * x1)      - (x0 * v2);
    var deltaB = (u0 * x1)      + (x0 * u2)      + (u1 * x2)      - (x1 * u2)      - (x0 * u1)      - (u0 * x2);
    var deltaC = (u0 * v1 * x2) + (v0 * x1 * u2) + (x0 * u1 * v2) - (x0 * v1 * u2) - (v0 * u1 * x2) - (u0 * x1 * v2);
    var deltaD = (y0 * v1)      + (v0 * y2)      + (y1 * v2)      - (v1 * y2)      - (v0 * y1)      - (y0 * v2);
    var deltaE = (u0 * y1)      + (y0 * u2)      + (u1 * y2)      - (y1 * u2)      - (y0 * u1)      - (u0 * y2);
    var deltaF = (u0 * v1 * y2) + (v0 * y1 * u2) + (y0 * u1 * v2) - (y0 * v1 * u2) - (v0 * u1 * y2) - (u0 * y1 * v2);

    context.transform(deltaA / delta, deltaD / delta,
        deltaB / delta, deltaE / delta,
        deltaC / delta, deltaF / delta);

    context.drawImage(textureSource, 0, 0);
    context.restore();
};



/**
 * Renders a flat Mesh
 *
 * @param Mesh {PIXI.mesh.Mesh} The Mesh to render
 * @private
 */
Mesh.prototype.renderMeshFlat = function (Mesh)
{
    var context = this.context;
    var vertices = Mesh.vertices;

    var length = vertices.length/2;
    // this.count++;

    context.beginPath();
    for (var i=1; i < length-2; i++)
    {
        // draw some triangles!
        var index = i*2;

        var x0 = vertices[index],   x1 = vertices[index+2], x2 = vertices[index+4];
        var y0 = vertices[index+1], y1 = vertices[index+3], y2 = vertices[index+5];

        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
    }

    context.fillStyle = '#FF0000';
    context.fill();
    context.closePath();
};

/**
 * When the texture is updated, this event will fire to update the scale and frame
 *
 * @param event
 * @private
 */
Mesh.prototype._onTextureUpdate = function ()
{
    this.updateFrame = true;
};

/**
 * Returns the bounds of the mesh as a rectangle. The bounds calculation takes the worldTransform into account.
 *
 * @param matrix {PIXI.Matrix} the transformation matrix of the sprite
 * @return {PIXI.Rectangle} the framing rectangle
 */
Mesh.prototype.getBounds = function (matrix)
{
    if (!this._currentBounds) {
        var worldTransform = matrix || this.worldTransform;

        var a = worldTransform.a;
        var b = worldTransform.b;
        var c = worldTransform.c;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;

        var maxX = -Infinity;
        var maxY = -Infinity;

        var minX = Infinity;
        var minY = Infinity;

        var vertices = this.vertices;
        for (var i = 0, n = vertices.length; i < n; i += 2) {
            var rawX = vertices[i], rawY = vertices[i + 1];
            var x = (a * rawX) + (c * rawY) + tx;
            var y = (d * rawY) + (b * rawX) + ty;

            minX = x < minX ? x : minX;
            minY = y < minY ? y : minY;

            maxX = x > maxX ? x : maxX;
            maxY = y > maxY ? y : maxY;
        }

        if (minX === -Infinity || maxY === Infinity) {
            return core.Rectangle.EMPTY;
        }

        var bounds = this._bounds;

        bounds.x = minX;
        bounds.width = maxX - minX;

        bounds.y = minY;
        bounds.height = maxY - minY;

        // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
        this._currentBounds = bounds;
    }

    return this._currentBounds;
};

/**
 * Tests if a point is inside this mesh. Works only for TRIANGLE_MESH
 *
 * @param point {PIXI.Point} the point to test
 * @return {boolean} the result of the test
 */
Mesh.prototype.containsPoint = function( point ) {
    if (!this.getBounds().contains(point.x, point.y)) {
        return false;
    }
    this.worldTransform.applyInverse(point,  tempPoint);

    var vertices = this.vertices;
    var points = tempPolygon.points;
    var i, len;

    if (this.drawMode === Mesh.DRAW_MODES.TRIANGLES) {
        var indices = this.indices;
        len = this.indices.length;
        //TODO: inline this.
        for (i=0;i<len;i+=3) {
            var ind0 = indices[i]*2, ind1 = indices[i+1]*2, ind2 = indices[i+2]*2;
            points[0] = vertices[ind0];
            points[1] = vertices[ind0+1];
            points[2] = vertices[ind1];
            points[3] = vertices[ind1+1];
            points[4] = vertices[ind2];
            points[5] = vertices[ind2+1];
            if (tempPolygon.contains(tempPoint.x, tempPoint.y)) {
                return true;
            }
        }
    } else {
        len = vertices.length;
        for (i=0;i<len;i+=6) {
            points[0] = vertices[i];
            points[1] = vertices[i+1];
            points[2] = vertices[i+2];
            points[3] = vertices[i+3];
            points[4] = vertices[i+4];
            points[5] = vertices[i+5];
            if (tempPolygon.contains(tempPoint.x, tempPoint.y)) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Different drawing buffer modes supported
 *
 * @static
 * @constant
 * @property {object} DRAW_MODES
 * @property {number} DRAW_MODES.TRIANGLE_MESH
 * @property {number} DRAW_MODES.TRIANGLES
 */
Mesh.DRAW_MODES = {
    TRIANGLE_MESH: 0,
    TRIANGLES: 1
};

},{"../core":29}],126:[function(require,module,exports){
var Mesh = require('./Mesh');

/**
 * The Plane allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (var i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * var Plane = new PIXI.Plane(PIXI.Texture.fromImage("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.mesh.Mesh
 * @memberof PIXI.mesh
 * @param {PIXI.Texture} texture - The texture to use on the Plane.
 * @param {int} segmentsX - The number ox x segments
 * @param {int} segmentsY - The number of y segments
 *
 */
function Plane(texture, segmentsX, segmentsY)
{
    Mesh.call(this, texture);

    /**
     * Tracker for if the Plane is ready to be drawn. Needed because Mesh ctor can
     * call _onTextureUpdated which could call refresh too early.
     *
     * @member {boolean}
     * @private
     */
    this._ready = true;

    this.segmentsX =  segmentsX || 10;
    this.segmentsY = segmentsY || 10;

    this.drawMode = Mesh.DRAW_MODES.TRIANGLES;
    this.refresh();

}


// constructor
Plane.prototype = Object.create( Mesh.prototype );
Plane.prototype.constructor = Plane;
module.exports = Plane;

/**
 * Refreshes
 *
 */
Plane.prototype.refresh = function()
{
    var total = this.segmentsX * this.segmentsY;
    var verts = [];
    var colors = [];
    var uvs = [];
    var indices = [];
    var texture = this.texture;

  //  texture.width = 800 texture.width || 800;
 //   texture.height = 800//texture.height || 800;

    var segmentsXSub = this.segmentsX - 1;
    var segmentsYSub = this.segmentsY - 1;
    var i = 0;

    var sizeX = texture.width / segmentsXSub;
    var sizeY = texture.height / segmentsYSub;

    for (i = 0; i < total; i++) {

        var x = (i % this.segmentsX);
        var y = ( (i / this.segmentsX ) | 0 );


        verts.push((x * sizeX),
                   (y * sizeY));

        // this works for rectangular textures. 
        uvs.push(texture._uvs.x0 + (texture._uvs.x1 - texture._uvs.x0) * (x / (this.segmentsX-1)), texture._uvs.y0 + (texture._uvs.y3-texture._uvs.y0) * (y/ (this.segmentsY-1)));
      }

    //  cons

    var totalSub = segmentsXSub * segmentsYSub;

    for (i = 0; i < totalSub; i++) {

        var xpos = i % segmentsXSub;
        var ypos = (i / segmentsXSub ) | 0;


        var  value = (ypos * this.segmentsX) + xpos;
        var  value2 = (ypos * this.segmentsX) + xpos + 1;
        var  value3 = ((ypos+1) * this.segmentsX) + xpos;
        var  value4 = ((ypos+1) * this.segmentsX) + xpos + 1;

        indices.push(value, value2, value3);
        indices.push(value2, value4, value3);
    }


    //console.log(indices)
    this.vertices = new Float32Array(verts);
    this.uvs = new Float32Array(uvs);
    this.colors = new Float32Array(colors);
    this.indices = new Uint16Array(indices);
};

/**
 * Clear texture UVs when new texture is set
 *
 * @private
 */
Plane.prototype._onTextureUpdate = function ()
{
    Mesh.prototype._onTextureUpdate.call(this);

    // wait for the Plane ctor to finish before calling refresh
    if (this._ready) {
        this.refresh();
    }
};

},{"./Mesh":125}],127:[function(require,module,exports){
var Mesh = require('./Mesh');
var core = require('../core');

/**
 * The rope allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (var i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * var rope = new PIXI.Rope(PIXI.Texture.fromImage("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.mesh.Mesh
 * @memberof PIXI.mesh
 * @param {PIXI.Texture} texture - The texture to use on the rope.
 * @param {PIXI.Point[]} points - An array of {@link PIXI.Point} objects to construct this rope.
 *
 */
function Rope(texture, points)
{
    Mesh.call(this, texture);

    /*
     * @member {PIXI.Point[]} An array of points that determine the rope
     */
    this.points = points;

    /*
     * @member {Float32Array} An array of vertices used to construct this rope.
     */
    this.vertices = new Float32Array(points.length * 4);

    /*
     * @member {Float32Array} The WebGL Uvs of the rope.
     */
    this.uvs = new Float32Array(points.length * 4);

    /*
     * @member {Float32Array} An array containing the color components
     */
    this.colors = new Float32Array(points.length * 2);

    /*
     * @member {Uint16Array} An array containing the indices of the vertices
     */
    this.indices = new Uint16Array(points.length * 2);

    /**
     * Tracker for if the rope is ready to be drawn. Needed because Mesh ctor can
     * call _onTextureUpdated which could call refresh too early.
     *
     * @member {boolean}
     * @private
     */
     this._ready = true;

     this.refresh();
}


// constructor
Rope.prototype = Object.create(Mesh.prototype);
Rope.prototype.constructor = Rope;
module.exports = Rope;

/**
 * Refreshes
 *
 */
Rope.prototype.refresh = function ()
{
    var points = this.points;

    // if too little points, or texture hasn't got UVs set yet just move on.
    if (points.length < 1 || !this._texture._uvs)
    {
        return;
    }

    var uvs = this.uvs;

    var indices = this.indices;
    var colors = this.colors;

    var textureUvs = this._texture._uvs;
    var offset = new core.Point(textureUvs.x0, textureUvs.y0);
    var factor = new core.Point(textureUvs.x2 - textureUvs.x0, textureUvs.y2 - textureUvs.y0);

    uvs[0] = 0 + offset.x;
    uvs[1] = 0 + offset.y;
    uvs[2] = 0 + offset.x;
    uvs[3] = 1 * factor.y + offset.y;

    colors[0] = 1;
    colors[1] = 1;

    indices[0] = 0;
    indices[1] = 1;

    var total = points.length,
        point, index, amount;

    for (var i = 1; i < total; i++)
    {
        point = points[i];
        index = i * 4;
        // time to do some smart drawing!
        amount = i / (total-1);

        uvs[index] = amount * factor.x + offset.x;
        uvs[index+1] = 0 + offset.y;

        uvs[index+2] = amount * factor.x + offset.x;
        uvs[index+3] = 1 * factor.y + offset.y;

        index = i * 2;
        colors[index] = 1;
        colors[index+1] = 1;

        index = i * 2;
        indices[index] = index;
        indices[index + 1] = index + 1;
    }

    this.dirty = true;
};

/**
 * Clear texture UVs when new texture is set
 *
 * @private
 */
Rope.prototype._onTextureUpdate = function ()
{
    Mesh.prototype._onTextureUpdate.call(this);

    // wait for the Rope ctor to finish before calling refresh
    if (this._ready) {
        this.refresh();
    }
};

/**
 * Updates the object transform for rendering
 *
 * @private
 */
Rope.prototype.updateTransform = function ()
{
    var points = this.points;

    if (points.length < 1)
    {
        return;
    }

    var lastPoint = points[0];
    var nextPoint;
    var perpX = 0;
    var perpY = 0;

    // this.count -= 0.2;

    var vertices = this.vertices;
    var total = points.length,
        point, index, ratio, perpLength, num;

    for (var i = 0; i < total; i++)
    {
        point = points[i];
        index = i * 4;

        if (i < points.length-1)
        {
            nextPoint = points[i+1];
        }
        else
        {
            nextPoint = point;
        }

        perpY = -(nextPoint.x - lastPoint.x);
        perpX = nextPoint.y - lastPoint.y;

        ratio = (1 - (i / (total-1))) * 10;

        if (ratio > 1)
        {
            ratio = 1;
        }

        perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        num = this._texture.height / 2; //(20 + Math.abs(Math.sin((i + this.count) * 0.3) * 50) )* ratio;
        perpX /= perpLength;
        perpY /= perpLength;

        perpX *= num;
        perpY *= num;

        vertices[index] = point.x + perpX;
        vertices[index+1] = point.y + perpY;
        vertices[index+2] = point.x - perpX;
        vertices[index+3] = point.y - perpY;

        lastPoint = point;
    }

    this.containerUpdateTransform();
};

},{"../core":29,"./Mesh":125}],128:[function(require,module,exports){
/**
 * @file        Main export of the PIXI extras library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.mesh
 */
module.exports = {
    Mesh:           require('./Mesh'),
    Plane:           require('./Plane'),
    Rope:           require('./Rope'),
    MeshRenderer:   require('./webgl/MeshRenderer'),
    MeshShader:     require('./webgl/MeshShader')
};

},{"./Mesh":125,"./Plane":126,"./Rope":127,"./webgl/MeshRenderer":129,"./webgl/MeshShader":130}],129:[function(require,module,exports){
var core = require('../../core'),
    Mesh = require('../Mesh');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's MeshRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/MeshRenderer.java
 */

/**
 *
 * @class
 * @private
 * @memberof PIXI.mesh
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
 */
function MeshRenderer(renderer)
{
    core.ObjectRenderer.call(this, renderer);


    /**
     * Holds the indices
     *
     * @member {Uint16Array}
     */
    
    this.indices = new Uint16Array(15000);

    //TODO this could be a single buffer shared amongst all renderers as we reuse this set up in most renderers
    for (var i=0, j=0; i < 15000; i += 6, j += 4)
    {
        this.indices[i + 0] = j + 0;
        this.indices[i + 1] = j + 1;
        this.indices[i + 2] = j + 2;
        this.indices[i + 3] = j + 0;
        this.indices[i + 4] = j + 2;
        this.indices[i + 5] = j + 3;
    }

    this.currentShader = null;
}

MeshRenderer.prototype = Object.create(core.ObjectRenderer.prototype);
MeshRenderer.prototype.constructor = MeshRenderer;
module.exports = MeshRenderer;

core.WebGLRenderer.registerPlugin('mesh', MeshRenderer);

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 */
MeshRenderer.prototype.onContextChange = function ()
{

};

/**
 * Renders the sprite object.
 *
 * @param mesh {PIXI.mesh.Mesh} the mesh to render
 */
MeshRenderer.prototype.render = function (mesh)
{
    if(!mesh._vertexBuffer)
    {
        this._initWebGL(mesh);
    }

    var renderer = this.renderer,
        gl = renderer.gl,
        texture = mesh._texture.baseTexture,
        shader = mesh.shader;// || renderer.shaderManager.plugins.meshShader;

    var drawMode = mesh.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;

    renderer.blendModeManager.setBlendMode(mesh.blendMode);

    //TODO cache custom state..
    if (!shader)
    {
        shader = renderer.shaderManager.plugins.meshShader;
    }
    else
    {
        shader = shader.shaders[gl.id] || shader.getShader(renderer);// : shader;
    }

    this.renderer.shaderManager.setShader(shader);

    shader.uniforms.translationMatrix.value = mesh.worldTransform.toArray(true);
    shader.uniforms.projectionMatrix.value = renderer.currentRenderTarget.projectionMatrix.toArray(true);
    shader.uniforms.alpha.value = mesh.worldAlpha;

    shader.syncUniforms();

    if (!mesh.dirty)
    {

        gl.bindBuffer(gl.ARRAY_BUFFER, mesh._vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, mesh.vertices);
        gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

        // update the uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh._uvBuffer);
        gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 0);


        gl.activeTexture(gl.TEXTURE0);

       if (!texture._glTextures[gl.id])
        {
            this.renderer.updateTexture(texture);
        }
        else
        {
            // bind the current texture
            gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh._indexBuffer);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, mesh.indices);
    }
    else
    {

        mesh.dirty = false;
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

        // update the uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh._uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW);
        gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 0);

         gl.activeTexture(gl.TEXTURE0);

        if (!texture._glTextures[gl.id])
        {
            this.renderer.updateTexture(texture);
        }
        else
        {
            // bind the current texture
            gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
        }

        // dont need to upload!
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

    }

    gl.drawElements(drawMode, mesh.indices.length, gl.UNSIGNED_SHORT, 0);

};

/**
 * Prepares all the buffers to render this mesh
 * @param mesh {PIXI.mesh.Mesh} the mesh to render
 */
MeshRenderer.prototype._initWebGL = function (mesh)
{
    // build the strip!
    var gl = this.renderer.gl;

    mesh._vertexBuffer = gl.createBuffer();
    mesh._indexBuffer = gl.createBuffer();
    mesh._uvBuffer = gl.createBuffer();



    gl.bindBuffer(gl.ARRAY_BUFFER, mesh._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh._uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,  mesh.uvs, gl.STATIC_DRAW);

    if(mesh.colors){
        mesh._colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh._colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.colors, gl.STATIC_DRAW);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
};


/**
 * Empties the current batch.
 *
 */
MeshRenderer.prototype.flush = function ()
{

};

/**
 * Starts a new mesh renderer.
 *
 */
MeshRenderer.prototype.start = function ()
{
    

    this.currentShader = null;
};

/**
 * Destroys the Mesh renderer
 *
 */
MeshRenderer.prototype.destroy = function ()
{
    core.ObjectRenderer.prototype.destroy.call(this);
};

},{"../../core":29,"../Mesh":125}],130:[function(require,module,exports){
var core = require('../../core');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.mesh
 * @param shaderManager {PIXI.ShaderManager} The WebGL shader manager this shader works for.
 */
function MeshShader(shaderManager)
{
    core.Shader.call(this,
        shaderManager,
        // vertex shader
        [
            'precision lowp float;',
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',

            'uniform mat3 translationMatrix;',
            'uniform mat3 projectionMatrix;',

            'varying vec2 vTextureCoord;',

            'void main(void){',
            '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '   vTextureCoord = aTextureCoord;',
            '}'
        ].join('\n'),
        [
            'precision lowp float;',

            'varying vec2 vTextureCoord;',
            'uniform float alpha;',

            'uniform sampler2D uSampler;',

            'void main(void){',
            '   gl_FragColor = texture2D(uSampler, vTextureCoord) * alpha ;',
            '}'
        ].join('\n'),
        // custom uniforms
        {
            alpha:  { type: '1f', value: 0 },
            translationMatrix: { type: 'mat3', value: new Float32Array(9) },
            projectionMatrix: { type: 'mat3', value: new Float32Array(9) }
        },
        // custom attributes
        {
            aVertexPosition:0,
            aTextureCoord:0
        }
    );
}

MeshShader.prototype = Object.create(core.Shader.prototype);
MeshShader.prototype.constructor = MeshShader;
module.exports = MeshShader;

core.ShaderManager.registerPlugin('meshShader', MeshShader);

},{"../../core":29}],131:[function(require,module,exports){
// References:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

if (!Math.sign)
{
    Math.sign = function (x) {
        x = +x;
        if (x === 0 || isNaN(x))
        {
            return x;
        }
        return x > 0 ? 1 : -1;
    };
}

},{}],132:[function(require,module,exports){
// References:
// https://github.com/sindresorhus/object-assign
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

if (!Object.assign)
{
    Object.assign = require('object-assign');
}

},{"object-assign":11}],133:[function(require,module,exports){
require('./Object.assign');
require('./requestAnimationFrame');
require('./Math.sign');

},{"./Math.sign":131,"./Object.assign":132,"./requestAnimationFrame":134}],134:[function(require,module,exports){
(function (global){
// References:
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// https://gist.github.com/1579671
// http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
// https://gist.github.com/timhall/4078614
// https://github.com/Financial-Times/polyfill-service/tree/master/polyfills/requestAnimationFrame

// Expected to be used with Browserfiy
// Browserify automatically detects the use of `global` and passes the
// correct reference of `global`, `self`, and finally `window`

// Date.now
if (!(Date.now && Date.prototype.getTime)) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

// performance.now
if (!(global.performance && global.performance.now)) {
    var startTime = Date.now();
    if (!global.performance) {
        global.performance = {};
    }
    global.performance.now = function () {
        return Date.now() - startTime;
    };
}

// requestAnimationFrame
var lastTime = Date.now();
var vendors = ['ms', 'moz', 'webkit', 'o'];

for(var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
    global.requestAnimationFrame = global[vendors[x] + 'RequestAnimationFrame'];
    global.cancelAnimationFrame = global[vendors[x] + 'CancelAnimationFrame'] ||
        global[vendors[x] + 'CancelRequestAnimationFrame'];
}

if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = function (callback) {
        if (typeof callback !== 'function') {
            throw new TypeError(callback + 'is not a function');
        }

        var currentTime = Date.now(),
            delay = 16 + lastTime - currentTime;

        if (delay < 0) {
            delay = 0;
        }

        lastTime = currentTime;

        return setTimeout(function () {
            lastTime = Date.now();
            callback(performance.now());
        }, delay);
    };
}

if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[115])(115)
});
//# sourceMappingURL=pixi.js.map
