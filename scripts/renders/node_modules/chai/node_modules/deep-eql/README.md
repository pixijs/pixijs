# deep-eql [![Build Status](https://travis-ci.org/chaijs/deep-eql.png?branch=master)](https://travis-ci.org/chaijs/deep-eql) [![Coverage Status](https://coveralls.io/repos/chaijs/deep-eql/badge.png?branch=master)](https://coveralls.io/r/chaijs/deep-eql?branch=master)

> Improved deep equality testing for Node.js and the browser.

## Installation

### Node.js

`deep-eql` is available on [npm](http://npmjs.org).

    $ npm install deep-eql

### Component

`deep-eql` is available as a [component](https://github.com/component/component).

    $ component install chaijs/deep-eql

## Usage

### Rules

- Strict equality for non-traversable nodes according to [egal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
  - `eql(NaN, NaN).should.be.true;`
  - `eql(-0, +0).should.be.false;`
- Arguments are not Arrays:
  - `eql([], arguments).should.be.false;`
  - `eql([], Array.prototype.slice.call(arguments)).should.be.true;`

## License

(The MIT License)

Copyright (c) 2013 Jake Luer <jake@alogicalparadox.com>

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
