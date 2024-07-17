import { Container } from '../../src/scene/container/Container';
import { checkChildrenDidChange } from '../../src/scene/container/utils/checkChildrenDidChange';
import { getChangeId } from '../../src/scene/container/utils/getChangeId';

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

        let childChange = getChangeId(child);

        expect(previousData).toEqual({
            data: [childChange],
            index: 1,
            didChange: true,
        });

        previousData.index = 0;
        previousData.didChange = false;

        checkChildrenDidChange(container, previousData);

        expect(previousData).toEqual({
            data: [childChange],
            index: 1,
            didChange: false,
        });

        child.x += 1;

        previousData.index = 0;
        previousData.didChange = false;

        checkChildrenDidChange(container, previousData);

        childChange = getChangeId(child);

        expect(previousData).toEqual({
            data: [childChange],
            index: 1,
            didChange: true,
        });
    });
});
