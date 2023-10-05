import { DOMAdapter } from '../settings/adapter/adapter';

export function isSafari(): boolean
{
    const { userAgent } = DOMAdapter.get().getNavigator();

    return (/^((?!chrome|android).)*safari/i).test(userAgent);
}
