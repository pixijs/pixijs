import { Container, DisplayObject } from '@pixi/display';
import { expect } from 'chai';

import '@pixi/mixin-get-global-position';

describe('DisplayObject#getGlobalPosition', () =>
{
    it('should exist', () =>
    {
        // @ts-expect-error - instantiating DisplayObject
        const obj = new DisplayObject();

        expect(obj.getGlobalPosition).to.be.not.undefined;
        expect(obj.getGlobalPosition).to.be.a('function');
    });

    it('should return correct global coordinates of a displayObject, without depending on its pivot', () =>
    {
        const parent = new Container();

        const container = new Container();

        parent.addChild(container);

        parent.position.set(100, 100);
        parent.rotation = Math.PI;
        parent.scale.set(2, 2);
        container.position.set(10, -30);
        container.pivot.set(1000, 1000);

        let globalPoint = container.getGlobalPosition();

        expect(globalPoint.x).to.equal(80);
        expect(globalPoint.y).to.equal(160);

        // check but skipUpdate

        parent.position.set(200, 200);
        globalPoint = container.getGlobalPosition(globalPoint, true);

        expect(globalPoint.x).to.equal(80);
        expect(globalPoint.y).to.equal(160);
    });
});
