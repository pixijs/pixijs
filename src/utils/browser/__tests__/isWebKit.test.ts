import { DOMAdapter } from '~/environment';
import { isWebKit } from '~/utils';

const agents = {
    safariMac272: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) '
        + 'Version/27.2 Safari/605.1.15',
    safariMac2701: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) '
        + 'Version/27.0.1 Safari/605.1.15',
    safariMac2710: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) '
        + 'Version/27.10 Safari/605.1.15',
    safariMac28: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) '
        + 'Version/28.0 Safari/605.1.15',
    safariIos270: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) '
        + 'Version/27.0 Mobile/15E148 Safari/604.1',
    chromeIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) '
        + 'CriOS/152.0.7977.54 Mobile/15E148 Safari/604.1',
    wkWebView: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) '
        + 'Mobile/15E148',
    chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
        + 'Chrome/156.0.0.0 Safari/537.36',
    chromeAndroid: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) '
        + 'Chrome/152.0.0.0 Mobile Safari/537.36',
    firefoxMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:150.0) Gecko/20100101 Firefox/150.0',
};

describe('isWebKit', () =>
{
    const navigator = DOMAdapter.get().getNavigator();
    let spy: jest.SpyInstance;
    const as = (userAgent: string) =>
    {
        spy = jest.spyOn(DOMAdapter.get(), 'getNavigator').mockReturnValue({ ...navigator, userAgent });
    };

    afterEach(() => spy?.mockRestore());

    it('should be true for Safari, every iOS browser and a WKWebView, and false for other engines', () =>
    {
        const cases: [string, boolean][] = [
            [agents.safariMac272, true], [agents.safariIos270, true], [agents.chromeIos, true], [agents.wkWebView, true],
            [agents.chromeMac, false], [agents.chromeAndroid, false], [agents.firefoxMac, false],
        ];

        for (const [userAgent, expected] of cases)
        {
            as(userAgent);
            expect(isWebKit()).toBe(expected);
        }
    });

    it('should match a range on the Safari version, from inclusive and before exclusive', () =>
    {
        const range = { from: '27.1', before: '28' };
        const cases: [string, boolean][] = [
            [agents.safariMac2701, false], [agents.safariIos270, false], [agents.safariMac272, true],
            [agents.safariMac2710, true], [agents.safariMac28, false],
        ];

        for (const [userAgent, expected] of cases)
        {
            as(userAgent);
            expect(isWebKit(range)).toBe(expected);
        }
    });

    it('should count WebKit that does not report a Safari version as in range', () =>
    {
        for (const userAgent of [agents.chromeIos, agents.wkWebView])
        {
            as(userAgent);
            expect(isWebKit({ from: '27.1', before: '28' })).toBe(true);
        }
    });

    it('should never match other engines, whatever the range', () =>
    {
        for (const userAgent of [agents.chromeMac, agents.chromeAndroid, agents.firefoxMac])
        {
            as(userAgent);
            expect(isWebKit({ from: '0' })).toBe(false);
        }
    });
});
