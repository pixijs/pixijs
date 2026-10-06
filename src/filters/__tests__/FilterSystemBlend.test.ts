import '~/scene/graphics/init';
import '~/rendering/init';
import '~/advanced-blend-modes/init';
import { AlphaFilter } from '../defaults/alpha/AlphaFilter';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { Rectangle } from '~/maths';
import { RenderTexture, TexturePool } from '~/rendering';
import { Container, Graphics } from '~/scene';

import type { Renderer } from '~/rendering';

type Probe = readonly [number, number];
type BuildStage = (stage: Container, render: () => void) => void;
type PrepareParent = (parent: Container, render: () => void) => void;

const quadrantProbes: Probe[] = [[63, 63], [64, 63], [63, 64], [64, 64]];
const invertedQuadrants = [
    [0, 255, 255, 255],
    [255, 0, 255, 255],
    [255, 255, 0, 255],
    [0, 0, 255, 255],
];
const halfProbes: Probe[] = [[60, 60], [90, 60]];
const invertedHalves = [[0, 255, 255, 255], [255, 0, 255, 255]];

function createBackdrop(): Graphics
{
    return new Graphics()
        .rect(0, 0, 64, 64)
        .fill(0xff0000)
        .rect(64, 0, 64, 64)
        .fill(0x00ff00)
        .rect(0, 64, 64, 64)
        .fill(0x0000ff)
        .rect(64, 64, 64, 64)
        .fill(0xffff00);
}

function createInnerBackdrop(x: number, y: number): Graphics
{
    return new Graphics()
        .rect(x, y, 40, 80)
        .fill(0xff0000)
        .rect(x + 40, y, 40, 80)
        .fill(0x00ff00);
}

function createParent(): Container
{
    const parent = new Container({ x: 30, y: 20 });
    const child = new Graphics().rect(25, 35, 40, 40).fill(0xffffff);

    child.blendMode = 'difference';
    parent.addChild(child);

    return parent;
}

function createDisabledFilter(): AlphaFilter
{
    const filter = new AlphaFilter();

    filter.enabled = false;

    return filter;
}

async function renderProbes(
    createRenderer: () => Promise<Renderer>,
    buildStage: BuildStage,
    probes: Probe[],
): Promise<number[][]>
{
    const renderer = await createRenderer();
    const target = RenderTexture.create({ width: 128, height: 128 });
    const stage = new Container();
    const render = () => renderer.render({ container: stage, target, clear: true });

    try
    {
        buildStage(stage, render);
        render();

        const { pixels, width } = renderer.extract.pixels(target);

        return probes.map(([x, y]) =>
        {
            const offset = ((y * width) + x) * 4;

            return Array.from(pixels.subarray(offset, offset + 4));
        });
    }
    finally
    {
        stage.destroy({ children: true });
        target.destroy(true);
        TexturePool.clear();
        renderer.destroy();
    }
}

const parentCases: [string, PrepareParent][] = [
    ['when the parent has no filter', () => undefined],
    ['when the parent filter is disabled', (parent) =>
    {
        parent.filters = [createDisabledFilter()];
    }],
    ['when the parent filter is disabled after a rendered frame', (parent, render) =>
    {
        const filter = new AlphaFilter();

        parent.filters = [filter];
        render();
        filter.enabled = false;
    }],
    ['when the parent filter area is empty', (parent) =>
    {
        parent.filters = [new AlphaFilter()];
        parent.filterArea = new Rectangle(0, 0, 0, 0);
    }],
];

function blendSuite(createRenderer: () => Promise<Renderer>): void
{
    it.each(parentCases)('should blend against the backdrop %s', async (_, prepareParent) =>
    {
        const pixels = await renderProbes(createRenderer, (stage, render) =>
        {
            const parent = createParent();

            stage.addChild(createBackdrop(), parent);
            prepareParent(parent, render);
        }, quadrantProbes);

        expect(pixels).toEqual(invertedQuadrants);
    });

    it('should blend against the enclosing filter output when the parent filter is disabled', async () =>
    {
        const pixels = await renderProbes(createRenderer, (stage) =>
        {
            const grand = new Container();
            const parent = createParent();

            grand.filters = [new AlphaFilter()];
            parent.filters = [createDisabledFilter()];
            grand.addChild(createInnerBackdrop(40, 40), parent);
            stage.addChild(grand);
        }, halfProbes);

        expect(pixels).toEqual(invertedHalves);
    });

    it('should blend against the parent filter output when the parent filter is enabled', async () =>
    {
        const pixels = await renderProbes(createRenderer, (stage) =>
        {
            const parent = createParent();

            parent.filters = [new AlphaFilter()];
            parent.addChildAt(createInnerBackdrop(10, 20), 0);
            stage.addChild(parent);
        }, halfProbes);

        expect(pixels).toEqual(invertedHalves);
    });
}

describe('FilterSystem blend modes with WebGL', () =>
{
    blendSuite(() => getWebGLRenderer({ width: 128, height: 128, useBackBuffer: true }));
});

describeLocalOnly('FilterSystem blend modes with WebGPU', () =>
{
    blendSuite(() => getWebGPURenderer({ width: 128, height: 128 }));
});
