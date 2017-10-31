#!/usr/bin/env node

const floss = require('floss');
const args = process.argv;
const debug = args.indexOf('--debug') > -1 || args.indexOf('-d') > -1;

const options = {
    path: 'test/index.js',
    debug,
};

floss(options, (err) =>
{
    if (err)
    {
        // eslint-disable-next-line no-console
        console.log(err);
        process.exit(1);
    }
    else
    {
        process.exit(0);
    }
});
