import '~/environment-browser/browserAll';
import { CanvasTextMetrics } from '../CanvasTextMetrics';

describe('CanvasTextMetrics.experimentalLetterSpacingSupported', () =>
{
    it('should return a boolean on first call', () =>
    {
        CanvasTextMetrics._experimentalLetterSpacingSupported = undefined as any;

        const result = CanvasTextMetrics.experimentalLetterSpacingSupported;

        expect(typeof result).toBe('boolean');
        expect(typeof CanvasTextMetrics._experimentalLetterSpacingSupported).toBe('boolean');
        expect(CanvasTextMetrics._experimentalLetterSpacingSupported).toBe(result);
    });
});
