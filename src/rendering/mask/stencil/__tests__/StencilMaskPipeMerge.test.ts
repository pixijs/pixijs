import '~/advanced-blend-modes/init';
import { getWebGLRenderer } from '@test-utils';
import { Container, Graphics } from '~/scene';

import type { WebGLRenderer } from '~/rendering';

interface TestInstruction
{
    renderPipeId: string;
    action?: string;
}

function createCell(x: number): Graphics
{
    return new Graphics().rect(x, 0, 20, 40).fill(0xff0000);
}

function createMask(): Graphics
{
    return new Graphics().circle(50, 20, 30).fill(0xffffff);
}

/**
 * stencil and filter instructions of the stage, in build order
 * @param stage
 */
function maskInstructions(stage: Container): string[]
{
    const instructionSet = stage.renderGroup.instructionSet;
    const actions: string[] = [];

    for (let i = 0; i < instructionSet.instructionSize; i++)
    {
        const instruction = instructionSet.instructions[i] as TestInstruction;

        if (instruction.renderPipeId === 'stencilMask' || instruction.renderPipeId === 'filter')
        {
            actions.push(`${instruction.renderPipeId}:${instruction.action}`);
        }
    }

    return actions;
}

const SINGLE_MASK = [
    'stencilMask:pushMaskBegin', 'stencilMask:pushMaskEnd',
    'stencilMask:popMaskBegin', 'stencilMask:popMaskEnd',
];

describe('StencilMaskPipe merge of adjacent pop + push', () =>
{
    let renderer: WebGLRenderer;
    let stage: Container;

    // one renderer for the file: the tests only read the built instruction set of their own stage
    beforeAll(async () =>
    {
        renderer = await getWebGLRenderer({ useBackBuffer: true });
    });

    afterAll(() =>
    {
        renderer.destroy();
    });

    beforeEach(() =>
    {
        stage = new Container();
    });

    afterEach(() =>
    {
        stage.destroy({ children: true });
    });

    it('should push a mask shared by adjacent siblings once', () =>
    {
        const mask = createMask();

        stage.addChild(mask);

        for (let i = 0; i < 4; i++)
        {
            const cell = createCell(i * 25);

            cell.mask = mask;
            stage.addChild(cell);
        }

        renderer.render(stage);

        expect(maskInstructions(stage)).toEqual(SINGLE_MASK);
    });

    it('should keep the mask open when a nested container is masked by the same mask', () =>
    {
        const mask = createMask();
        const outer = new Container();
        const inner = createCell(10);

        outer.mask = mask;
        inner.mask = mask;
        outer.addChild(inner);
        stage.addChild(mask, outer);

        renderer.render(stage);

        // the inner push is not skipped (it may sit in another render target, e.g. behind a filter)
        expect(maskInstructions(stage)).toEqual([
            'stencilMask:pushMaskBegin', 'stencilMask:pushMaskEnd',
            'stencilMask:pushMaskBegin', 'stencilMask:pushMaskEnd',
            'stencilMask:popMaskBegin', 'stencilMask:popMaskEnd',
            'stencilMask:popMaskBegin', 'stencilMask:popMaskEnd',
        ]);
    });

    it('should not merge siblings that share a mask with a different inverse flag', () =>
    {
        const mask = createMask();
        const first = createCell(0);
        const second = createCell(25);

        first.mask = mask;
        second.setMask({ mask, inverse: true });
        stage.addChild(mask, first, second);

        renderer.render(stage);

        expect(maskInstructions(stage)).toEqual([...SINGLE_MASK, ...SINGLE_MASK]);
    });

    it('should not merge when something is rendered between the siblings', () =>
    {
        const mask = createMask();
        const first = createCell(0);
        const second = createCell(50);

        first.mask = mask;
        second.mask = mask;
        stage.addChild(mask, first, createCell(25), second);

        renderer.render(stage);

        expect(maskInstructions(stage)).toEqual([...SINGLE_MASK, ...SINGLE_MASK]);
    });

    it('should close the mask before an advanced blend mode that follows a masked sibling', () =>
    {
        const mask = createMask();
        const masked = createCell(0);
        const blended = createCell(25);

        masked.mask = mask;
        blended.blendMode = 'color-burn';
        stage.addChild(mask, masked, blended);

        expect(() => renderer.render(stage)).not.toThrow();
        expect(maskInstructions(stage)).toEqual([...SINGLE_MASK, 'filter:pushFilter', 'filter:popFilter']);
    });
});
