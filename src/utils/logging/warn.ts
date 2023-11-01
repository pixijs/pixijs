let warnCount = 0;
const maxWarnings = 500;

/**
 * Logs a PixiJS warning message to the console. Stops logging after 500 warnings have been logged.
 * @param args - The warning message(s) to log
 * @returns {void}
 * @memberof utils
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
