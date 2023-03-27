import { getFontFamilyName } from '@pixi/assets';

describe('loadWebFont', () =>
{
    it('should get font family name', () =>
    {
        expect(getFontFamilyName('AbCdEf')).toBe('Abcdef');
        expect(getFontFamilyName('ABC def-gHi_JkL')).toBe('Abc Def Ghi Jkl');
        expect(getFontFamilyName('ABC123')).toBe('Abc123');
    });

    it('should escape font family name that is not valid CSS ident-token', () =>
    {
        expect(getFontFamilyName('')).toBe('""');
        expect(getFontFamilyName('123456')).toBe('"123456"');
        expect(getFontFamilyName('ABC 123')).toBe('"Abc 123"');
        expect(getFontFamilyName('2nd-Font')).toBe('"2nd Font"');
    });
});
