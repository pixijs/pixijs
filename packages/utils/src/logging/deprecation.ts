// A map of warning messages already fired
const warnings: {[key: string]: boolean} = {};

/**
 * Helper for warning developers about deprecated features & settings.
 * A stack track for warnings is given; useful for tracking-down where
 * deprecated methods/properties/classes are being used within the code.
 *
 * @memberof PIXI.utils
 * @function deprecation
 * @param {string} version - The version where the feature became deprecated
 * @param {string} message - Message should include what is deprecated, where, and the new solution
 * @param {number} [ignoreDepth=3] - The number of steps to ignore at the top of the error stack
 *        this is mostly to ignore internal deprecation calls.
 */
export function deprecation(version: string, message: string, ignoreDepth = 3): void
{
    // Ignore duplicat
    if (warnings[message])
    {
        return;
    }

    /* eslint-disable no-console */
    let stack = new Error().stack;

    // Handle IE < 10 and Safari < 6
    if (typeof stack === 'undefined')
    {
        console.warn('PixiJS Deprecation Warning: ', `${message}\nDeprecated since v${version}`);
    }
    else
    {
        // chop off the stack trace which includes PixiJS internal calls
        stack = stack.split('\n').splice(ignoreDepth).join('\n');

        if (console.groupCollapsed)
        {
            console.groupCollapsed(
                '%cPixiJS Deprecation Warning: %c%s',
                'color:#614108;background:#fffbe6',
                'font-weight:normal;color:#614108;background:#fffbe6',
                `${message}\nDeprecated since v${version}`
            );
            console.warn(stack);
            console.groupEnd();
        }
        else
        {
            console.warn('PixiJS Deprecation Warning: ', `${message}\nDeprecated since v${version}`);
            console.warn(stack);
        }
    }
    /* eslint-enable no-console */

    warnings[message] = true;
}
