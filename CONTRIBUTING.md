# How to contribute

It is essential to the development of pixi.js that the community is empowered
to make changes and get them into the library. Here are some guidlines to make
that process silky smooth for all involved.

## Reporting issues

To report a bug, request a feature, or even ask a question, make use of the GitHub Issues
section for [pixi.js][0]. When submitting an issue please take the following steps:

1. **Seach for existing issues.** Your question or bug may have already been answered or fixed,
be sure to search the issues first before putting in a duplicate issue.

2. **Create an isolated and reproducible test case.** If you are reporting a bug, make sure you
also have a minimal, runnable, code example that reproduces the problem you have.

3. **Include a live example.** After narrowing your code down to only the problem areas, make use
of [jsFiddle][1], [jsBin][2], or a link to your live site so that we can view a live example of the problem.

4. **Share as much information as possible.** Include browser version affected, your OS, version of
the library, steps to reproduce, etc. "X isn't working!!!1!" will probably just be closed.


## Making Changes

To setup for making changes you will need node.js, and grunt installed. You can download node.js
from [nodejs.org][3]. After it has been installed open a console and run `npm i -g grunt-cli` to
install the global `grunt` executable.

After that you can clone the pixi.js repository, and run `npm i` inside the cloned folder.
This will install dependencies necessary for building the project. Once that is ready, make your
changes and submit a Pull Request. When submitting a PR follow these guidlines:

- **Send Pull Requests to the `dev` branch.** All Pull Requests must be sent to the `dev` branch,
`master` is the latest release and PRs to that branch will be closed.

- **Ensure changes are jshint validated.** After making a change be sure to run the build process
to ensure that you didn't break anything. You can do this with `grunt && grunt test` which will run
jshint, rebuild, then run the test suite.

- **Never commit new builds.** When making a code change, you should always run `grunt` which will
rebuild the project, *however* please do not commit these new builds or your PR will be closed.

- **Only commit relevant changes.** Don't include changes that are not directly relevant to the fix
you are making. The more focused a PR is, the faster it will get attention and be merged. Extra files
changing only whitespace or trash files will likely get your PR closed.

## Quickie Code Style Guide

- Use 4 spaces for tabs, never tab characters.

- No trailing whitespace, blank lines should have no whitespace.

- Always favor strict equals `===` unless you *need* to use type coercion.

- Follow conventions already in the code, and listen to jshint.

[0]: https://github.com/GoodBoyDigital/pixi.js/issues
[1]: http://jsfiddle.net
[2]: http://jsbin.com/
[3]: http://nodejs.org