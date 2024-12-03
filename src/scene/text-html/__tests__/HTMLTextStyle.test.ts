import { HTMLTextStyle } from '../HTMLTextStyle';

describe('HTMLTextStyle', () =>
{
    it('should create an instance', () =>
    {
        expect(new HTMLTextStyle()).toBeTruthy();
    });

    describe('constructor', () =>
    {
        it('should set properties from constructor', () =>
        {
            const style = new HTMLTextStyle({
                fontFamily: 'Times',
                fontSize: 12,
            });

            expect(style.fontFamily).toBe('Times');
            expect(style.fontSize).toBe(12);
        });
    });

    describe('addOverride', () =>
    {
        it('should add override', () =>
        {
            const style = new HTMLTextStyle();
            const spy = jest.fn();

            expect(style.cssStyle).not.toContain('red');

            style.on('update', spy);

            style.addOverride('color: red');
            expect(spy).toHaveBeenCalled();
            expect(style.cssStyle).toContain('red');
        });

        it('should add override once', () =>
        {
            const style = new HTMLTextStyle();

            expect(style.cssOverrides).toHaveLength(0);

            style.addOverride('color: red');

            expect(style.cssOverrides).toHaveLength(1);

            style.addOverride('color: red');

            expect(style.cssOverrides).toHaveLength(1);
        });

        it('should remove override', () =>
        {
            const style = new HTMLTextStyle();

            style.addOverride('color: red');

            expect(style.cssOverrides).toHaveLength(1);

            style.removeOverride('color: red');

            expect(style.cssOverrides).toHaveLength(0);
        });

        it('should remove override once', () =>
        {
            const style = new HTMLTextStyle();

            style.addOverride('color: red');
            style.removeOverride('color: red');
            style.removeOverride('color: red');

            expect(style.cssOverrides).toHaveLength(0);
        });
    });

    describe('toCSS', () =>
    {
        it('should convert to CSS', () =>
        {
            const style = new HTMLTextStyle();

            expect(style.cssStyle).toMatchSnapshot();
        });

        it('should insert overrides', () =>
        {
            const style = new HTMLTextStyle();

            style.addOverride('color: red');
            expect(style.cssStyle).toMatchSnapshot();
        });

        it('should respect scale', () =>
        {
            const style = new HTMLTextStyle({
                lineHeight: 50,
                wordWrap: true,
                wordWrapWidth: 200,
            });

            expect(style.cssStyle).toMatchSnapshot();
        });
    });
});
