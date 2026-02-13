# How to contribute

It is essential to the development of PixiJS that the community is empowered
to make changes and get them into the library. Here are some guidelines to make
that process silky smooth for all involved.

## Reporting issues

To report a bug, request a feature, or even ask a question, make use of the GitHub Issues
section for [PixiJS][issues]. When submitting an issue please take the following steps:

1. **Search for existing issues.** Your question or bug may have already been answered or fixed,
be sure to search the issues first before putting in a duplicate issue.

2. **Create an isolated and reproducible test case.** If you are reporting a bug, make sure you
also have a minimal, runnable, code example that reproduces the problem you have.

3. **Include a live example.** After narrowing your code down to only the problem areas, make use
of [jsFiddle][fiddle], [jsBin][jsbin], or a link to your live site so that we can view a live example of the problem.

4. **Share as much information as possible.** Include browser version affected, your OS, version of
the library, steps to reproduce, etc. "X isn't working!!!1!" will probably just be closed.

> NOTE: if you are looking for support, please visit the [FAQ][faq], [forums][forums], [wiki][wiki]
> or go through the [tutorials][tutorials].

## Contributing Changes

### Setting Up

To setup for making changes you will need to take a few steps, we've outlined them below:

1. Ensure you have node.js installed. You can download node.js from [nodejs.org][node]. Because
pixi uses modern JS features, you will need a modern version of node. v24+ is recommended.

2. Fork the **[pixi.js][pixi]** repository, if you are unsure how to do this GitHub has a guides
for the [command line][fork-cli] and for the [GitHub Client][fork-gui].

3. Next, run `npm install` from within your clone of your fork. That will install dependencies
necessary to build PixiJS.


### Making a Change

Once you have node.js, the repository, and have installed dependencies are you almost ready to make your
change. The only other thing before you start is to checkout the correct branch. Which branch you should
make your change to (and send a PR to) depends on the type of change you are making.

Here is our branch breakdown:

- `main` - Make your change to the `main` branch if it is an *urgent* hotfix.
- `dev` - Make your change to `dev` if it is a *non-urgent* bugfix or a backwards-compatible feature.
- `v4.x`, `v5.3.x`, `v5.2.x`, etc - Make your change to legacy branches to patch old releases if your fix *only* applies to older versions.

Your change should be made directly to the branch in your fork, or to a branch in your fork made off of
one of the above branches.

### Testing Your Change

You can test your change by using the automated tests packaged with PixiJS. You can run these tests
by running `npm test` from the command line. If you fix a bug please add a test that will catch that
bug if it ever happens again. This prevents regressions from sneaking in.

Tips for a faster workflow:

- Run `npm start` in one terminal. This watches the source tree and compiles it incrementally.
- Run `npm run test unit` to run unit tests, or `npm run test visual` to run visual regression tests.
- Run `npm run test unit debug` to use headful DevTools to debug or develop tests

#### Visual Regression Testing

PixiJS uses a custom visual tester that allows you to create pixi scenes and compare them to a reference image.
These tests can be found [here](../tests/visual/scenes/). To run these tests, run `npm run test visual` from the command line, or run `npm run test visual debug` to use headful DevTools to debug or develop tests.

All visual tests must end with `.scene.ts` and follows this format:

```ts
import { Graphics } from '~/scene';

import type { Container } from '~/scene';
import type { Renderer } from '~/rendering';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render a red rectangle',
    pixelMatch: 40,                          // optional: pixel tolerance for comparison
    options: { backgroundColor: 'white' },    // optional: renderer options passed to PixiJS
    renderers: ['webgl2', 'webgpu'],          // optional: only run on specific renderers
    excludeRenderers: ['canvas'],             // optional: exclude specific renderers
    only: false,                              // optional: isolate this test
    skip: false,                              // optional: skip this test
    create: async (scene: Container, renderer: Renderer) =>
    {
        const rect = new Graphics().rect(0, 0, 100, 100).fill('red');

        scene.addChild(rect);
    },
};
```

### Submitting Your Change

After you have made and tested your change, commit and push it to your fork. Then, open a Pull Request
from your fork to the main **pixi.js** repository on the branch you used in the `Making a Change` section of this document.

## Quickie Code Style Guide

- Use 4 spaces for tabs, never tab characters.
- No trailing whitespace, blank lines should have no whitespace.
- Always favor strict equals `===` unless you *need* to use type coercion.
- Follow conventions already in the code, and listen to eslint.
- **Ensure changes are eslint validated.** After making a change be sure to run `npm test` to
ensure that you didn't break anything. This will run eslint, type checking, and the test suite.

[faq]: http://www.pixijs.com/faq
[fiddle]: http://jsfiddle.net
[fork-cli]: https://help.github.com/articles/fork-a-repo/
[fork-gui]: https://guides.github.com/activities/forking/
[forums]: http://www.html5gamedevs.com/forum/15-pixijs/
[issues]: https://github.com/pixijs/pixijs/issues
[jsbin]: http://jsbin.com/
[node]: http://nodejs.org
[pixi]: https://github.com/pixijs/pixijs
[tutorials]: http://www.pixijs.com/tutorials
[wiki]: https://github.com/pixijs/pixijs/wiki

## Contributor Code of Conduct

[Code of Conduct](CODE_OF_CONDUCT.md) is adapted from [Contributor Covenant, version 1.4](http://contributor-covenant.org/version/1/4)
