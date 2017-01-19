# Lolex [![Build Status](https://secure.travis-ci.org/sinonjs/lolex.png)](http://travis-ci.org/sinonjs/lolex)

JavaScript implementation of the timer APIs; `setTimeout`, `clearTimeout`,
`setImmediate`, `clearImmediate`, `setInterval`, `clearInterval`, and
`requestAnimationFrame`, along with a clock instance that controls the flow of
time. Lolex also provides a `Date` implementation that gets its time from the
clock.

Lolex can be used to simulate passing time in automated tests and other
situations where you want the scheduling semantics, but don't want to actually
wait. Lolex is extracted from [Sinon.JS](https://github.com/sinonjs/sinon.js).

## Installation

Lolex can be installed using `npm`:

```sh
npm install lolex
```

If you want to use Lolex in a browser, you have a few options. Releases are
hosted on the [sinonjs.org](http://sinonjs.org/download/) website. You can also
get the node module and build a file for the browser using browserify:

```sh
npm install lolex
npm install browserify # If you don't already have it globally installed
browserify node_modules/lolex/lolex.js
```

## Usage

To use lolex, create a new clock, schedule events on it using the timer
functions and pass time using the `tick` method.

```js
// In the browser distribution, a global `lolex` is already available
var lolex = require("lolex");
var clock = lolex.createClock();

clock.setTimeout(function () {
    console.log("The poblano is a mild chili pepper originating in the state of Puebla, Mexico.");
}, 15);

// ...

clock.tick(15);
```

Upon executing the last line, an interesting fact about the
[Poblano](http://en.wikipedia.org/wiki/Poblano) will be printed synchronously to
the screen. If you want to simulate asynchronous behavior, you have to use your
imagination when calling the various functions.

### Faking the native timers

When using lolex to test timers, you will most likely want to replace the native
timers such that calling `setTimeout` actually schedules a callback with your
clock instance, not the browser's internals.

To hijack timers in another context, use the `install` method. You can then call
`uninstall` later to restore things as they were again.

```js
var lolex = require("lolex");
var clock = lolex.install(window);

window.setTimeout(fn, 15); // Schedules with clock.setTimeout

clock.uninstall();

// window.setTimeout is restored to the native implementation
```

In 90% av the times, you want to install the timers onto the global object.
Calling `install` with no arguments achieves this:

```js
var clock = lolex.install();

// Equivalent to
// var clock = lolex.install(typeof global !== "undefined" ? global : window);
```

## API Reference

### `var clock = lolex.createClock([now])`

### `var clock = lolex.install([context[, now[, toFake]]])`

### `var clock = lolex.install([now[, toFake]])`

### `var id = clock.setTimeout(callback, timeout)`

### `clock.clearTimeout(id)`

### `var id = clock.setInterval(callback, timeout)`

### `clock.clearInterval(id)`

### `var id = clock.setImmediate(callback)`

### `clock.clearImmediate(id)`

### `clock.tick(time)`

### `clock.setSystemTime([now])`
This simulates a user changing the system clock while your program is running.
It affects the current time but it does not in itself cause e.g. timers to fire; they will fire exactly as they would have done without the call to setSystemTime().

### `clock.uninstall()`

### `Date`

## Running tests

Lolex has a comprehensive test suite. If you're thinking of contributing bug
fixes or suggest new features, you need to make sure you have not broken any
tests. You are also expected to add tests for any new behavior.

### On node:

```sh
npm test
```

Or, if you prefer slightly less verbose output:

```
mocha ./test/lolex-test.js
```

### In the browser



## License

BSD 3-clause "New" or "Revised" License  (see LICENSE file)
