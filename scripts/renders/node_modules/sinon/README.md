# Sinon.JS

[![Build status](https://secure.travis-ci.org/cjohansen/Sinon.JS.svg?branch=master)](http://travis-ci.org/cjohansen/Sinon.JS)

Standalone and test framework agnostic JavaScript test spies, stubs and mocks.

## Installation

via [npm (node package manager)](http://github.com/isaacs/npm)

    $ npm install sinon

via [NuGet (package manager for Microsoft development platform)](https://www.nuget.org/packages/SinonJS)

    Install-Package SinonJS

or install via git by cloning the repository and including sinon.js
in your project, as you would any other third party library.

Don't forget to include the parts of Sinon.JS that you want to use as well
(i.e. spy.js).

## Usage

See the [sinon project homepage](http://sinonjs.org/) for documentation on usage.

If you have questions that are not covered by the documentation, please post them to the [Sinon.JS mailing list](http://groups.google.com/group/sinonjs) or drop by <a href="irc://irc.freenode.net:6667/sinon.js">#sinon.js on irc.freenode.net:6667</a>

### Important: AMD needs pre-built version

Sinon.JS *as source* **doesn't work with AMD loaders** (when they're asynchronous, like loading via script tags in the browser). For that you will have to use a pre-built version. You can either [build it yourself](CONTRIBUTING.md#testing-a-built-version) or get a numbered version from http://sinonjs.org.

This might or might not change in future versions, depending of outcome of investigations. Please don't report this as a bug, just use pre-built versions.

## Goals

* No global pollution
* Easy to use
* Require minimal “integration”
* Easy to embed seamlessly with any testing framework
* Easily fake any interface
* Ship with ready-to-use fakes for XMLHttpRequest, timers and more

## Contribute?

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how you can contribute to Sinon.JS
