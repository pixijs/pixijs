import { DOMAdapter } from '../../environment/adapter';

/**
 * A range of Safari versions, `from` inclusive and `before` exclusive. Either end can be left open.
 * Versions are dotted strings compared part by part, so `'27.10'` comes after `'27.9'`.
 * @internal
 */
export interface SafariVersionRange
{
    /** The first version in the range. */
    from?: string;
    /** The first version after the range. */
    before?: string;
}

/**
 * Checks if the page runs on WebKit: Safari, every browser on iOS, and apps built on a WKWebView.
 * Unlike {@link isSafari}, this also covers WebKit that doesn't call itself Safari.
 *
 * With a range, only Safari versions in it count. WebKit that doesn't report its Safari version (Chrome or
 * Firefox on iPhone, a WKWebView) can't be placed, so it counts as in range: a range here guards against a WebKit
 * bug, and assuming such a browser is affected is the safe side.
 * @example
 * ```ts
 * // WebKit at all
 * isWebKit();
 * // Safari 27.1 and every 27.x after it, but not 28
 * isWebKit({ from: '27.1', before: '28' });
 * ```
 * @param range - the Safari versions to match
 * @returns `true` on WebKit, within the range if one is given
 * @internal
 */
export function isWebKit(range?: SafariVersionRange): boolean
{
    const { userAgent } = DOMAdapter.get().getNavigator();

    // Chromium-based browsers also name AppleWebKit; on iOS they say CriOS, EdgiOS and so on instead
    if (!(/AppleWebKit\//).test(userAgent) || (/Chrome\/|Chromium\//).test(userAgent)) return false;
    if (!range) return true;

    const version = (/Version\/([\d.]+)/).exec(userAgent)?.[1];

    if (!version) return true;
    if (range.from && compareVersions(version, range.from) < 0) return false;
    if (range.before && compareVersions(version, range.before) >= 0) return false;

    return true;
}

/**
 * Compares two dotted version strings part by part, a missing part counting as 0.
 * @param a - a version
 * @param b - another version
 * @returns negative if `a` is earlier, positive if later, 0 if equal
 */
function compareVersions(a: string, b: string): number
{
    const pa = a.split('.');
    const pb = b.split('.');

    for (let i = 0; i < Math.max(pa.length, pb.length); i++)
    {
        const diff = (parseInt(pa[i], 10) || 0) - (parseInt(pb[i], 10) || 0);

        if (diff) return diff;
    }

    return 0;
}
