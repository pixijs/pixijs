import { Container } from '../../src/scene/container/Container';
import { updateRenderGroupTransforms } from '../../src/scene/container/utils/updateRenderGroupTransforms';

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

        expect(childContainer.rgAlpha).toEqual(1);

        parentContainer.alpha = -10;

        updateRenderGroupTransforms(root.renderGroup, false);

        expect(childContainer.rgAlpha).toEqual(0);
    });
});

// Test to cover
