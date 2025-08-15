// A set of warning messages already fired
const warnings: Set<string> = new Set();

/**
 * deprecation name for version 8.0.0
 * @ignore
 * @internal
 */
export const v8_0_0 = '8.0.0';
/**
 * deprecation name for version 8.1.0
 * @ignore
 * @internal
 */
export const v8_3_4 = '8.3.4';

/**
 * Options for managing deprecation messages behavior globally
 * @category utils
 * @standard
 */
interface DeprecationOptions
{
    /**
     * When set to true, all deprecation warning messages will be hidden.
     * Use this if you want to silence deprecation notifications.
     * @default false
     * @standard
     */
    quiet: boolean;
    /**
     * When set to true, deprecation messages will be displayed as plain text without color formatting.
     * Use this if you want to disable colored console output for deprecation warnings.
     * @default false
     * @standard
     */
    noColor: boolean;
}

/** @internal */
export type DeprecationFn = ((version: string, message: string, ignoreDepth?: number) => void) & DeprecationOptions;

const deprecationState: DeprecationOptions = {
    quiet: false,
    noColor: true
};

/**
 * Helper for warning developers about deprecated features & settings.
 * A stack track for warnings is given; useful for tracking-down where
 * deprecated methods/properties/classes are being used within the code.
 *
 * Deprecation messages can be configured globally:
 * ```ts
 * // Suppress all deprecation messages
 * deprecation.quiet = true;
 *
 * // Put plain text to console instead of colorful messages
 * deprecation.colorful = false;
 * ```
 * @category utils
 * @ignore
 * @function deprecation
 * @param {string} version - The version where the feature became deprecated
 * @param {string} message - Message should include what is deprecated, where, and the new solution
 * @param {number} [ignoreDepth=3] - The number of steps to ignore at the top of the error stack
 *        this is mostly to ignore internal deprecation calls.
 */
export const deprecation: DeprecationFn = ((version: string, message: string, ignoreDepth: number = 3) =>
{
    // Suppress if is in quiet mode and ignore duplicate
    if (deprecationState.quiet || warnings.has(message)) return;

    /* eslint-disable no-console */
    let stack = new Error().stack;

    const deprecationMessage = `${message}\nDeprecated since v${version}`;
    const useGroup = typeof console.groupCollapsed === 'function' && deprecationState.noColor;

    // Handle IE < 10 and Safari < 6
    if (typeof stack === 'undefined')
    {
        console.warn('PixiJS Deprecation Warning: ', deprecationMessage);
    }
    else
    {
        // chop off the stack trace which includes PixiJS internal calls
        stack = stack.split('\n').splice(ignoreDepth).join('\n');

        if (useGroup)
        {
            console.groupCollapsed(
                '%cPixiJS Deprecation Warning: %c%s',
                'color:#614108;background:#fffbe6',
                'font-weight:normal;color:#614108;background:#fffbe6',
                deprecationMessage
            );
            console.warn(stack);
            console.groupEnd();
        }
        else
        {
            console.warn('PixiJS Deprecation Warning: ', deprecationMessage);
            console.warn(stack);
        }
    }
    /* eslint-enable no-console */

    warnings.add(message);
}) as DeprecationFn;

Object.defineProperties(deprecation, {
    quiet: {
        get: () => deprecationState.quiet,
        set: (value: boolean) =>
        {
            deprecationState.quiet = value;
        },
        enumerable: true,
        configurable: false
    },
    noColor: {
        get: () => deprecationState.noColor,
        set: (value: boolean) =>
        {
            deprecationState.noColor = value;
        },
        enumerable: true,
        configurable: false
    }
} satisfies {[key in keyof DeprecationOptions]: PropertyDescriptor});
