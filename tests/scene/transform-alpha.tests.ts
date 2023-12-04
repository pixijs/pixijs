import { Container } from '../../src/scene/container/Container';
import { updateLayerGroupTransforms } from '../../src/scene/container/utils/updateLayerGroupTransforms';

describe('Transform Alpha', () =>
{
    it('should cap layerAlpha to between zero and one', async () =>
    {
        const root = new Container({ isRenderGroup: true });

        const parentContainer = new Container();

        const childContainer = new Container();

        root.addChild(parentContainer);
        parentContainer.addChild(childContainer);

        parentContainer.alpha = 20;
        childContainer.alpha = 3;

        updateLayerGroupTransforms(root.renderGroup, false);

        expect(childContainer.rgAlpha).toEqual(1);

        parentContainer.alpha = -10;

        updateLayerGroupTransforms(root.renderGroup, false);

        expect(childContainer.rgAlpha).toEqual(0);
    });
});

// Test to cover
