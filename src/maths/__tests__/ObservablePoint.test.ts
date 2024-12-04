import { ObservablePoint } from '../point/ObservablePoint';

describe('ObservablePoint', () =>
{
    it('should create a new observable point', () =>
    {
        const cb = { _onUpdate: jest.fn() };
        const pt = new ObservablePoint(cb);

        expect(pt.x).toEqual(0);
        expect(pt.y).toEqual(0);

        pt.set(2, 5);
        expect(pt.x).toEqual(2);
        expect(pt.y).toEqual(5);

        expect(cb._onUpdate).toHaveBeenCalled();

        pt.set(2, 6);
        expect(pt.x).toEqual(2);
        expect(pt.y).toEqual(6);

        pt.set(2, 0);
        expect(pt.x).toEqual(2);
        expect(pt.y).toEqual(0);

        pt.set();
        expect(pt.x).toEqual(0);
        expect(pt.y).toEqual(0);

        expect(cb._onUpdate.mock.calls).toHaveLength(4);
    });

    it('should copy a new observable point', () =>
    {
        const cb = { _onUpdate() { /** do nothing */ } };

        const p1 = new ObservablePoint(cb, 10, 20);
        const p2 = new ObservablePoint(cb, 5, 2);
        const p3 = new ObservablePoint(cb, 5, 6);

        p1.copyFrom(p2);
        expect(p1.x).toEqual(p2.x);
        expect(p1.y).toEqual(p2.y);

        p1.copyFrom(p3);
        expect(p1.y).toEqual(p3.y);
    });
});

