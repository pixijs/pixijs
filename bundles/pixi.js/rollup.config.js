import config from '@internal/builder';

// Only apply deprecated APIs for browser build
if (config.output.format === 'umd')
{
    config.outro = 'exports.deprecation();';
}

export default config;
