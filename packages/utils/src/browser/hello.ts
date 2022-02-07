let saidHello = false;
const VERSION = '$_VERSION';

/**
 * Skips the hello message of renderers that are created after this is run.
 *
 * @function skipHello
 * @memberof PIXI.utils
 */
export function skipHello(): void
{
    saidHello = true;
}

/**
 * Logs out the version and renderer information for this running instance of PIXI.
 * If you don't want to see this message you can run `PIXI.utils.skipHello()` before
 * creating your renderer. Keep in mind that doing that will forever make you a jerk face.
 *
 * @static
 * @function sayHello
 * @memberof PIXI.utils
 * @param {string} type - The string renderer type to log.
 */
export function sayHello(type: string): void
{
    if (saidHello)
    {
        return;
    }

    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
    {
        const args = [
            `\n %c %c %c PixiJS ${VERSION} - ✰ ${type} ✰  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥ \n\n`,
            'background: #ff66a5; padding:5px 0;',
            'background: #ff66a5; padding:5px 0;',
            'color: #ff66a5; background: #030307; padding:5px 0;',
            'background: #ff66a5; padding:5px 0;',
            'background: #ffc3dc; padding:5px 0;',
            'background: #ff66a5; padding:5px 0;',
            'color: #ff2424; background: #fff; padding:5px 0;',
            'color: #ff2424; background: #fff; padding:5px 0;',
            'color: #ff2424; background: #fff; padding:5px 0;',
        ];

        globalThis.console.log(...args);
    }
    else if (globalThis.console)
    {
        globalThis.console.log(`PixiJS ${VERSION} - ${type} - http://www.pixijs.com/`);
    }

    saidHello = true;
}
