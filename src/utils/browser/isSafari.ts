import { DOMAdapter } from '../../environment/adapter';

export function isSafari(): boolean
{
    const { userAgent } = DOMAdapter.get().getNavigator();

    return (/^((?!chrome|android).)*safari/i).test(userAgent);
}
