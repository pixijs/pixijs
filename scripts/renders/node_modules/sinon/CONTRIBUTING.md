# Contributing to Sinon.JS

There are several ways of contributing to Sinon.JS

* Help [improve the documentation](https://github.com/sinonjs/sinon-docs) published at [the Sinon.JS website](http://sinonjs.org)
* Help someone understand and use Sinon.JS on the [the mailing list](http://groups.google.com/group/sinonjs)
* Report an issue, please read instructions below
* Help with triaging the [issues](http://github.com/cjohansen/Sinon.JS/issues). The clearer they are, the more likely they are to be fixed soon.
* Contribute to the code base.

## Reporting an issue

To save everyone time and make it much more likely for your issue to be understood, worked on and resolved quickly, it would help if you're mindful of [How to Report Bugs Effectively](http://www.chiark.greenend.org.uk/~sgtatham/bugs.html) when pressing the "Submit new issue" button.

As a minimum, please report the following:

* Which environment are you using? Browser? Node? Which version(s)?
* Which version of SinonJS?
* How are you loading SinonJS?
* What other libraries are you using?
* What you expected to happen
* What actually happens
* Describe **with code** how to reproduce the faulty behaviour

### Bug report template

Here's a template for a bug report

> Sinon version :
> Environment   :
> Example URL   :
>
> ##### Bug description

Here's an example use of the template

> Sinon version : 1.10.3
> Environment   : OSX Chrome 37.0.2062.94
> Example URL   : http://jsbin.com/iyebiWI/8/edit
>
> ##### Bug description
>
> If `respondWith` called with a URL including query parameter and a function , it doesn't work.
> This error reported in console.
> ```
> `TypeError: requestUrl.match(...) is null`
> ```

## Contributing to the code base

Pick [an issue](http://github.com/cjohansen/Sinon.JS/issues) to fix, or pitch
new features. To avoid wasting your time, please ask for feedback on feature
suggestions either with [an issue](http://github.com/cjohansen/Sinon.JS/issues/new)
or on [the mailing list](http://groups.google.com/group/sinonjs).

### Making a pull request

Please try to [write great commit messages](http://chris.beams.io/posts/git-commit/).

There are numerous benefits to great commit messages

* They allow Sinon.JS users to easily understand the consequences of updating to a newer version
* They help contributors understand what is going on with the codebase, allowing features and fixes to be developed faster
* They save maintainers time when compiling the changelog for a new release

If you're already a few commits in by the time you read this, you can still [change your commit messages](https://help.github.com/articles/changing-a-commit-message/).

Also, before making your pull request, consider if your commits make sense on their own (and potentially should be multiple pull requests) or if they can be squashed down to one commit (with a great message). There are no hard and fast rules about this, but being mindful of your readers greatly help you author good commits.

### Use EditorConfig

To save everyone some time, please use [EditorConfig](http://editorconfig.org), so your editor helps make
sure we all use the same encoding, indentation, line endings, etc.

### Installation

The Sinon.JS developer environment requires Node/NPM. Please make sure you have
Node installed, and install Sinon's dependencies:

    $ npm install

This will also install a pre-commit hook, that runs style validation on staged files.

#### PhantomJS

In order to run the tests, you'll need a [PhantomJS](http://phantomjs.org) global.

The test suite runs well with both `1.9.x` and `2.0.0`

### Style

Sinon.JS uses [ESLint](http://eslint.org) to keep consistent style. You probably want to install a plugin for your editor.

The ESLint test will be run before unit tests in the CI environment, your build will fail if it doesn't pass the style check.

```
$ npm run lint
```

To ensure consistent reporting of lint warnings, you should use the same version as CI environment (defined in `package.json`)

### Run the tests

This runs linting as well as unit tests in both PhantomJS and node

    $ npm test

##### Testing in development

Sinon.JS uses [Buster.JS](http://busterjs.org), please read those docs if you're unfamiliar with it.

If you just want to run tests a few times

    $ npm run ci-test

If you're doing more than a one line edit, you'll want to have finer control and less restarting of the Buster server and PhantomJS process

    # start a server
    $ $(npm bin)/buster-server

    # capture a browser by pointing it to http://localhost:1111/capture
    # run tests (in both browser and node)
    $ $(npm bin)/buster-test

    # run tests only in browser
    $ $(npm bin)/buster-test --config-group browser

    # run tests only in node
    $ $(npm bin)/buster-test --config-group node

If you install `Buster.JS` as a global, you can remove `$(npm-bin)/` from the lines above.

##### Testing a built version

To test against a built distribution, first
make sure you have a build (requires [Ruby][ruby] and [Juicer][juicer]):

    $ ./build

[ruby]: https://www.ruby-lang.org/en/
[juicer]: http://rubygems.org/gems/juicer

If the build script is unable to find Juicer, try

    $ ruby -rubygems build

Once built, you can run the tests against the packaged version as part of the `ci-test.sh` script.

    ./scripts/ci-test.sh

