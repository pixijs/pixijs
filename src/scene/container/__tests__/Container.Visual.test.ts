import { Container } from '../Container';
import { updateRenderGroupTransforms } from '../utils/updateRenderGroupTransforms';
import { DEG_TO_RAD, RAD_TO_DEG } from '~/maths';
import { Sprite } from '~/scene';

describe('Container Visual', () =>
{
    describe('mask', () =>
    {
        // todo: ticket: https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=44913565
        // eslint-disable-next-line jest/no-disabled-tests
        it.skip('should set isMask and renderable properties correctly even if the same mask is used by multiple objects',
            () =>
            {
                const mask1 = new Container();
                const mask2 = new Container();
                const container1 = new Container();
                const container2 = new Container();

                expect(mask1.includeInBuild).toBe(true);
                expect(mask1.measurable).toBe(true);
                expect(mask2.includeInBuild).toBe(true);
                expect(mask2.measurable).toBe(true);

                container1.mask = mask1;

                expect(mask1.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(false);
                expect(mask2.includeInBuild).toBe(true);
                expect(mask2.measurable).toBe(true);

                container1.mask = mask1;

                expect(mask1.includeInBuild).toBe(true);
                expect(mask1.measurable).toBe(false);
                expect(mask2.includeInBuild).toBe(false);
                expect(mask2.measurable).toBe(true);

                container2.mask = mask1;

                expect(mask1.includeInBuild).toBe(true);
                expect(mask2.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(false);
                expect(mask2.measurable).toBe(true);

                container1.mask = mask2;

                expect(mask1.includeInBuild).toBe(true);
                expect(mask1.measurable).toBe(false);
                expect(mask2.includeInBuild).toBe(true);
                expect(mask2.measurable).toBe(false);

                container2.mask = mask2;

                expect(mask1.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(true);
                expect(mask2.includeInBuild).toBe(true);
                expect(mask2.measurable).toBe(false);

                container1.mask = null;

                expect(mask1.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(true);
                expect(mask2.includeInBuild).toBe(true);
                expect(mask2.measurable).toBe(false);

                container2.mask = null;

                expect(mask1.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(true);
                expect(mask2.includeInBuild).toBe(false);
                expect(mask2.measurable).toBe(true);

                container1.mask = mask1;

                expect(mask1.includeInBuild).toBe(true);
                expect(mask1.measurable).toBe(false);

                container1.destroy();

                expect(mask1.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(true);
            }
        );
    });

    describe('alpha', () =>
    {
        it('should traverse alpha', () =>
        {
            const rootContainer = new Container({ isRenderGroup: true });
            const parent = new Container();
            const child = new Container();

            rootContainer.addChild(parent);
            parent.addChild(child);

            parent.alpha = 0.5;

            updateRenderGroupTransforms(rootContainer.renderGroup, true);

            const alpha = child.groupAlpha;

            expect(alpha).toBe(0.5);
        });
    });

    describe('Layer Cascading Visibility', () =>
    {
        it('should traverse parents', () =>
        {
            const rootContainer = new Container({ isRenderGroup: true });
            const parent = new Container();
            const child = new Container();

            rootContainer.addChild(parent);
            parent.addChild(child);

            expect(child.globalDisplayStatus).toBe(0b111);
            expect(child.localDisplayStatus).toBe(0b111);

            parent.visible = false;

            updateRenderGroupTransforms(rootContainer.renderGroup, true);

            expect(child.globalDisplayStatus).toBe(0b101);
            expect(child.localDisplayStatus).toBe(0b111);
        });
    });

    describe('rotation', () =>
    {
        it('rotation and angle are different units of the same transformation', () =>
        {
            const object = new Container();

            expect(object.rotation).toEqual(0);
            expect(object.angle).toEqual(0);

            object.rotation = 2;

            expect(object.rotation).toEqual(2);
            expect(object.angle).toEqual(2 * RAD_TO_DEG);

            object.angle = 180;

            expect(object.rotation).toEqual(180 * DEG_TO_RAD);
            expect(object.angle).toEqual(180);
        });
    });

    describe('width', () =>
    {
        it('should reset scale', () =>
        {
            const container = new Container();

            container.scale.x = 2;
            container.width = 5;

            expect(container.width).toEqual(0);
            expect(container.scale.x).toEqual(1);
        });

        it('should get/set size', () =>
        {
            const container = new Sprite();

            container.setSize(5);

            expect(container.getSize().width).toEqual(5);
            expect(container.width).toEqual(5);
            expect(container.getSize().height).toEqual(5);
            expect(container.height).toEqual(5);

            container.setSize(10, 15);

            expect(container.getSize().width).toEqual(10);
            expect(container.width).toEqual(10);
            expect(container.getSize().height).toEqual(15);
            expect(container.height).toEqual(15);

            container.setSize({ width: 20, height: 25 });

            expect(container.getSize().width).toEqual(20);
            expect(container.width).toEqual(20);
            expect(container.getSize().height).toEqual(25);
            expect(container.height).toEqual(25);

            container.setSize({ width: 30 });

            expect(container.getSize().width).toEqual(30);
            expect(container.width).toEqual(30);
            expect(container.getSize().height).toEqual(30);
            expect(container.height).toEqual(30);
        });
    });

    describe('height', () =>
    {
        it('should reset scale', () =>
        {
            const container = new Container();

            container.scale.y = 2;
            container.height = 5;

            expect(container.height).toEqual(0);
            expect(container.scale.y).toEqual(1);
        });
    });

    describe('scale', () =>
    {
        it('should set scale from a single value', () =>
        {
            const container = new Container();

            container.scale.set(2);

            expect(container.scale.x).toEqual(2);
            expect(container.scale.y).toEqual(2);
        });
    });

    describe('pivot', () =>
    {
        it('should set pivot from a single value', () =>
        {
            const container = new Container();

            container.pivot.set(2);

            expect(container.pivot.x).toEqual(2);
            expect(container.pivot.y).toEqual(2);
        });
    });
});
