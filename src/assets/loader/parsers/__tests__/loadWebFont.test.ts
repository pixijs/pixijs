import { getFontFamilyName } from '../loadWebFont';

describe('loadWebFont', () =>
{
    it('should get font family name', () =>
    {
        expect(getFontFamilyName('AbCdEf.ttf')).toBe('Abcdef');
        expect(getFontFamilyName('ABC def-gHi_JkL.otf')).toBe('Abc Def Ghi Jkl');
        expect(getFontFamilyName('ABC123.woff')).toBe('Abc123');
    });

    it('should escape font family name that is not valid CSS ident-token', () =>
    {
        expect(getFontFamilyName('')).toBe('""');
        expect(getFontFamilyName('123456.ttf')).toBe('"123456"');
        expect(getFontFamilyName('ABC 123.otf')).toBe('"Abc 123"');
        expect(getFontFamilyName('2nd-Font.woff')).toBe('"2nd Font"');
    });
});
