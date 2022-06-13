import { CountLimiter } from '@pixi/prepare';
import { expect } from 'chai';

describe('CountLimiter', () =>
{
    it('should limit to specified number per beginFrame()', () =>
    {
        const limit = new CountLimiter(3);

        limit.beginFrame();
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.false;

        limit.beginFrame();
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.true;
        expect(limit.allowedToUpload()).to.be.false;
    });
});
