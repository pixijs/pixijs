import { definedProps } from '../definedProps';

describe('definedProps', () =>
{
    it('should remove all undefined props', async () =>
    {
        const obj: {
            a: number;
            b?: number;
            c: number;
        } = {
            a: 1,
            b: undefined,
            c: 3,
        };

        expect(definedProps(obj)).toEqual({
            a: 1,
            c: 3,
        });
    });
});
