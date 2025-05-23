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

    describe('clone', () =>
    {
        it('should clone', () =>
        {
            const style = new HTMLTextStyle({
                fontFamily: 'Times',
                fontSize: 12,
            });

            const clone = style.clone();

            expect(clone).toBeInstanceOf(HTMLTextStyle);
            expect(clone.fontFamily).toBe('Times');
            expect(clone.fontSize).toBe(12);
        });

        it('should clone css overrides', () =>
        {
            const style = new HTMLTextStyle({
                fontFamily: 'Times',
                fontSize: 12,
            });

            style.addOverride('color: red');

            const clone = style.clone();

            expect(clone.cssOverrides).toHaveLength(1);
            expect(clone.cssOverrides[0]).toBe('color: red');

            delete style.cssOverrides[0];
            expect(clone.cssOverrides).toHaveLength(1);
        });

        it('should clone drop shadow', () =>
        {
            const style = new HTMLTextStyle({
                fontFamily: 'Times',
                fontSize: 12,
                dropShadow: {
                    color: 0xff0000,
                    alpha: 1,
                    blur: 2,
                    angle: Math.PI / 4,
                    distance: 5,
                },
            });

            const clone = style.clone();

            expect(clone.dropShadow).toEqual({
                color: 0xff0000,
                alpha: 1,
                blur: 2,
                angle: Math.PI / 4,
                distance: 5,
            });
            expect(clone.dropShadow).not.toBe(style.dropShadow);
        });

        it('should clone tag styles', () =>
        {
            const style = new HTMLTextStyle({
                fontFamily: 'Times',
                fontSize: 12,
                tagStyles: {
                    red: {
                        fontFamily: 'Arial',
                        fontSize: 14,
                    },
                },
            });

            const clone = style.clone();

            expect(clone.tagStyles).toEqual({
                red: {
                    fontFamily: 'Arial',
                    fontSize: 14,
                },
            });
            expect(clone.tagStyles).not.toBe(style.tagStyles);
        });
    });
});
