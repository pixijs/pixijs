#!/usr/bin/env node
'use strict';

// Publish script to push releases of the bin files
// the normally are gitignored
const ghpages = require('gh-pages');
const path = require('path');
const packageInfo = require(path.join(__dirname, '..', 'package.json'));

const options = {
    src: [
        'dist/**/*',
        'lib/**/*',
        'src/**/*',
        'scripts/**/*',
        'test/**/*',
        '*.json',
        '*.md',
        'LICENSE',
        '.eslintrc',
        '.editorconfig',
        '.travis.yml',
        '.babelrc',
    ],
    dotfiles: true,
    branch: 'release',
    message: packageInfo.version,
    logger: console.log.bind(console),
};

ghpages.publish(process.cwd(), options, (err) =>
{
    if (err)
    {
        console.log(err);
        process.exit(1);

        return;
    }

    process.exit(0);
});
