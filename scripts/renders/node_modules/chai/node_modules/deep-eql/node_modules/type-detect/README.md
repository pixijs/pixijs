# type-detect [![Build Status](https://travis-ci.org/chaijs/type-detect.png?branch=master)](https://travis-ci.org/chaijs/type-detect) [![Coverage Status](https://coveralls.io/repos/chaijs/type-detect/badge.png?branch=master)](https://coveralls.io/r/chaijs/type-detect?branch=master)

> Improved typeof detection for node.js and the browser.

## Installation

### Node.js

`type-detect` is available on [npm](http://npmjs.org).

    $ npm install type-detect

### Component

`type-detect` is available as a [component](https://github.com/component/component).

    $ component install chaijs/type-detect

## Usage

### Primary

The primary export of `type-detect` is function that can server as a replacement for 
`typeof`. The results of this function will be more specific than that of native `typeof`.

```js
var type = require('type-detect');
```

#### array

```js
assert('array' === type([]));
assert('array' === type(new Array()));
```

#### regexp

```js
assert('regexp' === type(/a-z/gi));
assert('regexp' === type(new RegExp('a-z')));
```

#### function

```js
assert('function' === type(function () {}));
```

#### arguments

```js
(function () {
  assert('arguments' === type(arguments));
})();
```

#### date

```js
assert('date' === type(new Date));
```

#### number

```js
assert('number' === type(1));
assert('number' === type(1.234));
assert('number' === type(-1));
assert('number' === type(-1.234));
assert('number' === type(Infinity));
assert('number' === type(NaN));
```

#### string

```js
assert('string' === type('hello world'));
```

#### null

```js
assert('null' === type(null));
assert('null' !== type(undefined));
```

#### undefined

```js
assert('undefined' === type(undefined));
assert('undefined' !== type(null));
```

#### object

```js
var Noop = function () {};
assert('object' === type({}));
assert('object' !== type(Noop));
assert('object' === type(new Noop));
assert('object' === type(new Object));
assert('object' === type(new String('hello')));
```

### Library

A `Library` is a small constructed repository for custom type detections.

```js
var lib = new type.Library;
```

#### .of (obj)

* **@param** _{Mixed}_ object to test
* **@return** _{String}_  type

Expose replacement `typeof` detection to the library.

```js
if ('string' === lib.of('hello world')) {
  // ...
}
```


#### .define (type, test)

* **@param** _{String}_ type 
* **@param** _{RegExp|Function}_ test 

Add a test to for the `.test()` assertion.

Can be defined as a regular expression:

```js
lib.define('int', /^[0-9]+$/);
```

... or as a function:

```js
lib.define('bln', function (obj) {
  if ('boolean' === lib.of(obj)) return true;
  var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
  if ('string' === lib.of(obj)) obj = obj.toLowerCase();
  return !! ~blns.indexOf(obj);
});
```


#### .test (obj, test)

* **@param** _{Mixed}_ object 
* **@param** _{String}_ type 
* **@return** _{Boolean}_  result

Assert that an object is of type. Will first
check natives, and if that does not pass it will
use the user defined custom tests.

```js
assert(lib.test('1', 'int'));
assert(lib.test('yes', 'bln'));
```




## License

(The MIT License)

Copyright (c) 2013 Jake Luer <jake@alogicalparadox.com> (http://alogicalparadox.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
