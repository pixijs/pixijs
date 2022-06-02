import { DisplayObject } from '@pixi/display';
import { expect } from 'chai';

import '@pixi/accessibility';

describe('accessibleTarget', () =>
{
    it('should have target public properties', () =>
    {
        // @ts-expect-error ---
        const obj = new DisplayObject();

        expect(obj.accessible).to.be.a('boolean');
        expect(obj.accessible).to.be.false;
        expect(obj.accessibleTitle).to.be.null;
        expect(obj.accessibleHint).to.be.null;
        expect(obj.tabIndex).to.equal(0);
    });
});
