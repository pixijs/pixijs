import { DOMAdapter } from '../environment/adapter';
import { VERSION } from './const';

let saidHello = false;

/**
 * Prints out the version and renderer information for this running instance of PixiJS.
 * @param type - The name of the renderer this instance is using.
 * @returns {void}
 */
export function sayHello(type: string): void
{
    if (saidHello)
    {
        return;
    }

    if (DOMAdapter.get().getNavigator().userAgent.toLowerCase().indexOf('chrome') > -1)
    {
        const args = [
            `%c  %c  %c  %c  %c PixiJS %c v${VERSION} (${type}) http://www.pixijs.com/\n\n`,
            'background: #E72264; padding:5px 0;',
            'background: #6CA2EA; padding:5px 0;',
            'background: #B5D33D; padding:5px 0;',
            'background: #FED23F; padding:5px 0;',
            'color: #FFFFFF; background: #E72264; padding:5px 0;',
            'color: #E72264; background: #FFFFFF; padding:5px 0;',
        ];

        globalThis.console.log(...args);
    }
    else if (globalThis.console)
    {
        globalThis.console.log(`PixiJS ${VERSION} - ${type} - http://www.pixijs.com/`);
    }

    saidHello = true;
}
