import { DOMAdapter } from '../../environment/adapter';

/**
 * Checks if the current browser is Safari.
 * @returns {boolean} True if the browser is Safari, false otherwise.
 * @internal
 */
export function isSafari(): boolean
{
    const { userAgent } = DOMAdapter.get().getNavigator();

    return (/^((?!chrome|android).)*safari/i).test(userAgent);
}
