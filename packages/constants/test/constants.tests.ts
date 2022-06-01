import * as lib from '@pixi/constants';
import { expect } from 'chai';

describe('Constants', () =>
{
    it('should have ENV', () =>
    {
        expect(lib.ENV).to.be.an('object');
    });

    it('should have RENDERER_TYPE', () =>
    {
        expect(lib.RENDERER_TYPE).to.be.an('object');
    });

    it('should have BLEND_MODES', () =>
    {
        expect(lib.RENDERER_TYPE).to.be.an('object');
    });

    it('should have DRAW_MODES', () =>
    {
        expect(lib.DRAW_MODES).to.be.an('object');
    });

    it('should have FORMATS', () =>
    {
        expect(lib.FORMATS).to.be.an('object');
    });

    it('should have TARGETS', () =>
    {
        expect(lib.TARGETS).to.be.an('object');
    });

    it('should have TYPES', () =>
    {
        expect(lib.TYPES).to.be.an('object');
    });

    it('should have SCALE_MODES', () =>
    {
        expect(lib.SCALE_MODES).to.be.an('object');
    });

    it('should have WRAP_MODES', () =>
    {
        expect(lib.WRAP_MODES).to.be.an('object');
    });

    it('should have MIPMAP_MODES', () =>
    {
        expect(lib.MIPMAP_MODES).to.be.an('object');
    });

    it('should have ALPHA_MODES', () =>
    {
        expect(lib.ALPHA_MODES).to.be.an('object');
    });

    it('should have GC_MODES', () =>
    {
        expect(lib.GC_MODES).to.be.an('object');
    });

    it('should have PRECISION', () =>
    {
        expect(lib.PRECISION).to.be.an('object');
    });
});
