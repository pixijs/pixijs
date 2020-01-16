/* eslint-disable global-require */
describe('PIXI', function ()
{
    before(function (done)
    {
        this.head = document.querySelector('head');
        this.script = document.createElement('script');
        this.script.onload = () => done();
        this.script.src = require.resolve('../dist/pixi-legacy');
        this.head.appendChild(this.script);
    });

    after(function ()
    {
        this.head.removeChild(this.script);
        delete this.script;
        delete this.head;
        delete window.PIXI;
    });

    it('should exist as a global object', function ()
    {
        expect(window.PIXI).to.not.be.undefined;
        expect(PIXI).to.not.be.undefined;
        expect(PIXI.interaction).to.not.be.undefined;
        expect(PIXI.settings).to.not.be.undefined;
        expect(PIXI.utils).to.not.be.undefined;
    });

    it('should contain deprecations on window, not import', function ()
    {
        expect(PIXI.extras).to.not.be.undefined;
    });
});
