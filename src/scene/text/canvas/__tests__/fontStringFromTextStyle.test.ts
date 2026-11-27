import { TextStyle } from '../../TextStyle';
import { fontStringFromTextStyle } from '../utils/fontStringFromTextStyle';

describe('fontStringFromTextStyle', () =>
{
    it('should quote the font names of an array', () =>
    {
        const style = new TextStyle({ fontFamily: ['Race Display', 'Arial', 'sans-serif'], fontSize: 32 });

        expect(fontStringFromTextStyle(style)).toEqual('normal normal normal 32px "Race Display","Arial",sans-serif');
    });

    it('should not change the fontFamily array the style was given', () =>
    {
        const fontFamily = ['Race Display', 'Arial', 'sans-serif'];
        const style = new TextStyle({ fontFamily });

        fontStringFromTextStyle(style);

        expect(fontFamily).toEqual(['Race Display', 'Arial', 'sans-serif']);
    });

    it('should quote the names of a comma separated string', () =>
    {
        const style = new TextStyle({ fontFamily: 'Race Display, Arial, sans-serif', fontSize: 32 });

        expect(fontStringFromTextStyle(style)).toEqual('normal normal normal 32px "Race Display","Arial",sans-serif');
    });
});
