import { Container } from '../Container';
import { updateRenderGroupTransforms } from '../utils/updateRenderGroupTransforms';

describe('Transform Alpha', () =>
{
    it('should cap render group alpha to between zero and one', async () =>
    {
        const root = new Container({ isRenderGroup: true });

        const parentContainer = new Container();

        const childContainer = new Container();

        root.addChild(parentContainer);
        parentContainer.addChild(childContainer);

        parentContainer.alpha = 20;
        childContainer.alpha = 3;

        updateRenderGroupTransforms(root.renderGroup, false);

        expect(childContainer.groupAlpha).toEqual(1);

        let groupAlpha = (childContainer.groupColorAlpha >>> 24) / 255;

        expect(groupAlpha).toEqual(1);

        parentContainer.alpha = -10;

        updateRenderGroupTransforms(root.renderGroup, false);

        expect(childContainer.groupAlpha).toEqual(0);

        groupAlpha = (childContainer.groupColorAlpha >>> 24) / 255;

        expect(groupAlpha).toEqual(0);
    });
});

// Test to cover
