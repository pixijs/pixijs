import config from '@internal/builder';
import buble from 'buble';
import * as fs from 'fs';

// Only support deprecations with UMD format, since this
// is the version of PixiJS run in the browser directly. ES format
// will not receive deprecations.
if (config[0].output.format === 'umd')
{
    // Rollup exports all the namespaces/classes, in order to
    // deprecates exported classes, we need to add deprecate.js
    // as the outro for the build.
    const buffer = fs.readFileSync('./src/deprecated.js', 'utf8');

    config[0].outro = buble.transform(buffer).code;
}

export default config;
