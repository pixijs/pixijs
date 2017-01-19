1.0.0 / 2015-03-17
==================

  * travis: allow for tagged releases to npm
  * docs: new string is type string, not object
  * Merge pull request #5 from Charminbear/string-object-as-string
  * Also updated the Docs with new Spec.
  * Made "new String()" return type "string" instead of object and added test for "new Number()"
  * Merge pull request #4 from Charminbear/include-ecma6-types
  * Moved eol-comments above the codelines.
  * Added 'else' statement to tests make skipping visual.
  * Implemented furthert support for promises.
  * Merge remote-tracking branch 'origin/include-ecma6-types' into include-ecma6-types
  * Changed the getType() Method to be more generic and support ECMA6 as well as custom types Deleted NativeTypes as no longer needed Added (fake) Tests for ECMA6 types (by stubbing Object.prototype.toString) Updated Readme.md with ECMA6 Types
  * Implemented conditional tests for ECMA6 features with real types.
  * Moved regex into variable.
  * Flipped assert statements.
  * Added ArrayBuffer in description
  * Fixed spell mistake.
  * Merge branch 'include-ecma6-types' of https://github.com/Charminbear/type-detect into include-ecma6-types
  * Added a description for Symbol.toStringTag
  * Added a description for Symbol.toStringTag
  * Fixed some formatting issues
  * Added a test for ArrayBuffer.
  * Added the new ECMA 6 Types to description.
  * Renamed "stubToStringMethod" to "stubObjectToStringOnce" to make purpose more clear.
  * Made stub of Object.prototype.toString restore itself on call as Mocha uses this method after tests.
  * Changed getType() Method to be more generic for every given type, but still respect new String() and special PhantomJS Values.
  * Added new types simple and implemented tests with stubbing "Object.prototype.toString"

0.1.2 / 2013-11-30
==================

 * Library: constructor with new

0.1.1 / 2013-10-10
==================

 * Merge pull request #2 from strongloop/fix-browserify
 * index,test: support browserify

0.1.0 / 2013-08-14
==================

 * readme: document all methods
 * readme: add badges
 * library: [test] ensure test runs
 * travis: change script to run coveralls reportwq
 * tests: add tests
 * lib: add type detect lib
 * pkg: prepare for coverage based tests
 * "Initial commit"
