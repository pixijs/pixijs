# Release Notes

## 1.0.0 / 2015-03-15

Supports all new ES6 primitives, as well as Objects which override their
toStringTag using [`Symbol.toStringTag`][1].

Supports primitive Object instances over literals - for example
`new String('foo')` and `'foo'` both report a type of `'string'`.

[1]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Well-known_symbols

### Community Contributions

#### Code Features & Fixes

 * [#4](https://github.com/chaijs/chai/pull/4) Included support for ECMA6 types
   ([chai/chaijs#394](https://github.com/chaijs/chai/issues/394)).
   By [@Charminbear](https://github.com/Charminbear)

 * [#5](https://github.com/chaijs/chai/pull/5) "new String()" as 'string'
   instead of 'object'. By [@Charminbear](https://github.com/Charminbear)

## 0.1.2 / 2013-11-30

Support calling the library without the `new` keyword.

#### Code Features & Fixes

 * Library: constructor with new
   By [@logicalparadox](https://github.com/logicalparadox)

## 0.1.1 / 2013-10-10

Add support for browserify.

#### Code Features & Fixes

 * [#2](https://github.com/chaijs/chai/pull/2) Add support for Browserify
   ([#1](https://github.com/chaijs/type-detect/issues/1)).
   By [@bajtos](https://github.com/bajtos)


## 0.1.0 / 2013-08-14

Initial Release
