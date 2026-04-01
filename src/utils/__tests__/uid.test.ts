import { resetUids, uid } from '../data/uid';

describe('uid', () =>
{
    beforeEach(() =>
    {
        resetUids();
    });

    it('should return incrementing values for the default name', () =>
    {
        expect(uid()).toEqual(0);
        expect(uid()).toEqual(1);
        expect(uid()).toEqual(2);
    });

    it('should return independent sequences for different names', () =>
    {
        expect(uid('texture')).toEqual(0);
        expect(uid('buffer')).toEqual(0);
        expect(uid('texture')).toEqual(1);
        expect(uid('buffer')).toEqual(1);
    });

    it('should start from 0 for new names', () =>
    {
        expect(uid('geometry')).toEqual(0);
        expect(uid('shader')).toEqual(0);
    });

    it('should handle default name explicitly', () =>
    {
        expect(uid('default')).toEqual(0);
        expect(uid()).toEqual(1);
        expect(uid('default')).toEqual(2);
    });
});

describe('resetUids', () =>
{
    it('should reset all uid counters', () =>
    {
        uid('texture');
        uid('texture');
        uid('buffer');

        resetUids();

        expect(uid('texture')).toEqual(0);
        expect(uid('buffer')).toEqual(0);
    });
});
