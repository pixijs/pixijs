const { getExtension } = require('../');
const chai = require('chai');

describe('getExtension', function ()
{
    it('should get the correct extension', function ()
    {
        const extension = getExtension('test.png');

        chai.expect(extension).to.equal('png');
    });
});
