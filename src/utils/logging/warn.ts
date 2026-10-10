let warnCount = 0;
const maxWarnings = 500;

/**
 * Logs a PixiJS warning message to the console. Stops logging after 500 warnings have been logged.
 * @param args - The warning message(s) to log
 * @returns {void}
 * @category utils
 * @ignore
 */
export function warn(...args: any[])
{
    if (warnCount === maxWarnings) return;

    warnCount++;

    if (warnCount === maxWarnings)
    {
        console.warn('PixiJS Warning: too many warnings, no more warnings will be reported to the console by PixiJS.');
    }
    else
    {
        console.warn('PixiJS Warning: ', ...args);
    }
}

// A set of warning keys already fired
const firedWarnings = new Set<string>();

/**
 * Logs a PixiJS warning message to the console, but only once per unique key.
 * Subsequent calls with the same key are ignored. Shares the same global warning
 * cap as {@link warn}.
 * @param key - Unique identifier used to ensure the warning is only logged once
 * @param args - The warning message(s) to log
 * @returns {void}
 * @category utils
 * @ignore
 */
export function warnOnce(key: string, ...args: any[])
{
    if (firedWarnings.has(key)) return;

    firedWarnings.add(key);

    warn(...args);
}
