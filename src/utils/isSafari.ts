import { settings } from '../settings/settings';

export function isSafari(): boolean
{
    const { userAgent } = settings.ADAPTER.getNavigator();

    return (/^((?!chrome|android).)*safari/i).test(userAgent);
}
