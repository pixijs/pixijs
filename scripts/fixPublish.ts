import { version } from '../lerna.json';
import { execSync } from 'child_process';

/**
 * The following packages were removed in v7, so dist-tag needs to get fixed after publish
 * in order for npm to consider it the default version when installing, for instance
 * `npm install @pixi/loaders@6`.
 * @see https://github.com/pixijs/pixijs/issues/9108
 */
['@pixi/loaders', '@pixi/polyfill', '@pixi/interaction'].forEach((pkg) =>
{
    const command = `npm dist-tag add ${pkg}@${version} latest`;

    // eslint-disable-next-line no-console
    console.log(command);

    execSync(command, { stdio: 'inherit' });
});
