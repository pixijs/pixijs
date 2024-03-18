import { Container } from '../../src/scene/container/Container';
import { checkChildrenDidChange } from '../../src/scene/container/utils/checkChildrenDidChange';

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

        let childChange = ((child.uid & 255) << 24)
            | (child._didChangeId & 16777215);

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

        childChange = ((child.uid & 255) << 24)
        | (child._didChangeId & 16777215);

        expect(previousData).toEqual({
            data: [childChange],
            index: 1,
            didChange: true,
        });
    });
});
