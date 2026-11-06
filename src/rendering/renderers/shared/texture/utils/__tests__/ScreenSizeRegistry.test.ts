import { ScreenSizeRegistry } from '../ScreenSizeRegistry';

describe('ScreenSizeRegistry', () =>
{
    let screens: ScreenSizeRegistry;

    beforeEach(() =>
    {
        screens = new ScreenSizeRegistry();
    });

    describe('Registration', () =>
    {
        it('should report whether a set changed anything', () =>
        {
            expect(screens.set(1, 1280, 720)).toBe(true);
            expect(screens.set(1, 1280, 720)).toBe(false);
            expect(screens.set(1, 1280, 800)).toBe(true);
            expect(screens.set(2, 1280, 800)).toBe(true);
        });

        it('should report a change of resolution alone', () =>
        {
            expect(screens.set(1, 1280, 720, 1)).toBe(true);
            expect(screens.set(1, 1280, 720, 2)).toBe(true);
            expect(screens.set(1, 1280, 720, 2)).toBe(false);
        });

        it('should report whether a remove changed anything', () =>
        {
            screens.set(1, 1280, 720);

            expect(screens.remove(1)).toBe(true);
            expect(screens.remove(1)).toBe(false);
            expect(screens.remove(2)).toBe(false);
        });

        it('should track the number of renderers', () =>
        {
            expect(screens.size).toBe(0);

            screens.set(1, 1280, 720);
            screens.set(2, 800, 600);
            screens.set(1, 1024, 768);

            expect(screens.size).toBe(2);

            screens.remove(1);
            screens.remove(2);

            expect(screens.size).toBe(0);
        });
    });

    describe('Fitting Size', () =>
    {
        it('should return nothing when nothing is registered', () =>
        {
            expect(screens.getFittingWidth(1280)).toBeUndefined();
            expect(screens.getFittingHeight(300)).toBeUndefined();
        });

        it('should return a screen the request fits in on that axis', () =>
        {
            screens.set(1, 1280, 720);

            expect(screens.getFittingWidth(1280)).toBe(1280);
            expect(screens.getFittingHeight(300)).toBe(720);
            expect(screens.getFittingHeight(720)).toBe(720);
        });

        it('should not return a screen the request does not fit in', () =>
        {
            screens.set(1, 1280, 720);

            expect(screens.getFittingWidth(1281)).toBeUndefined();
            expect(screens.getFittingHeight(721)).toBeUndefined();
        });

        it('should pick the smallest screen the request fits in', () =>
        {
            screens.set(1, 1280, 720);
            screens.set(2, 800, 600);
            screens.set(3, 2560, 1440);

            expect(screens.getFittingWidth(700)).toBe(800);
            expect(screens.getFittingWidth(801)).toBe(1280);
            expect(screens.getFittingWidth(1281)).toBe(2560);
            expect(screens.getFittingWidth(2561)).toBeUndefined();
        });

        it('should fit a request to a screen at the resolution of the request', () =>
        {
            screens.set(1, 1179, 2556, 3);

            expect(screens.getFittingWidth(393, 1)).toBe(393);
            expect(screens.getFittingHeight(852, 1)).toBe(852);
            expect(screens.getFittingWidth(300, 1)).toBe(393);
            expect(screens.getFittingWidth(786, 2)).toBe(786);
            expect(screens.getFittingWidth(1179, 3)).toBe(1179);
        });

        it('should fall back to the physical size past the screen at the resolution of the request', () =>
        {
            screens.set(1, 1179, 2556, 3);

            expect(screens.getFittingWidth(394, 1)).toBe(1179);
            expect(screens.getFittingWidth(1180, 1)).toBeUndefined();
        });

        it('should round up a screen that is not a whole size at the resolution of the request', () =>
        {
            screens.set(1, 1000, 500, 3);

            expect(screens.getFittingWidth(334, 1)).toBe(334);
            expect(screens.getFittingHeight(167, 1)).toBe(167);
            expect(screens.getFittingWidth(1000, 3)).toBe(1000);
        });

        it('should stop returning a screen once it is removed', () =>
        {
            screens.set(1, 1280, 720);

            expect(screens.getFittingWidth(1280)).toBe(1280);

            screens.remove(1);

            expect(screens.getFittingWidth(1280)).toBeUndefined();
        });
    });

    describe('Screen Sizes', () =>
    {
        it('should report a live screen on its own axis only', () =>
        {
            expect(screens.hasWidth(1280)).toBe(false);
            expect(screens.hasHeight(720)).toBe(false);

            screens.set(1, 1280, 720);

            expect(screens.hasWidth(1280)).toBe(true);
            expect(screens.hasHeight(720)).toBe(true);
            // the screen's width used as a height, and vice versa, match nothing
            expect(screens.hasWidth(720)).toBe(false);
            expect(screens.hasHeight(1280)).toBe(false);
        });

        it('should stop reporting a size once no renderer uses it', () =>
        {
            screens.set(1, 1280, 720);
            screens.set(2, 1280, 600);

            screens.remove(1);

            expect(screens.hasWidth(1280)).toBe(true);
            expect(screens.hasHeight(600)).toBe(true);
            expect(screens.hasHeight(720)).toBe(false);
        });
    });
});
