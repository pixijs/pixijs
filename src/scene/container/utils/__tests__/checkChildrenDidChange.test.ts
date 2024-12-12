import { Container } from '../../Container';
import { checkChildrenDidChange } from '../checkChildrenDidChange';

describe('checkChildrenDidChange', () =>
{
    it('should correctly manage ids', async () =>
    {
        const container = new Container();

        const child = new Container();

        container.addChild(child);

        const previousData = {
            data: [] as number[],
            index: 0,
            didChange: false,
        };

        checkChildrenDidChange(container, previousData);

        let childChange = ((child._didViewChangeTick & 0xffff) << 16) | (child._didContainerChangeTick & 0xffff);

        expect(previousData).toEqual({
            data: [child.uid, childChange],
            index: 2,
            didChange: true,
        });

        previousData.index = 0;
        previousData.didChange = false;

        checkChildrenDidChange(container, previousData);

        expect(previousData).toEqual({
            data: [child.uid, childChange],
            index: 2,
            didChange: false,
        });

        child.x += 1;

        previousData.index = 0;
        previousData.didChange = false;

        checkChildrenDidChange(container, previousData);

        childChange = ((child._didViewChangeTick & 0xffff) << 16) | (child._didContainerChangeTick & 0xffff);

        expect(previousData).toEqual({
            data: [child.uid, childChange],
            index: 2,
            didChange: true,
        });
    });
});
