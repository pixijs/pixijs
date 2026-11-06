import { Matrix } from '~/maths/matrix/Matrix';
import { DefaultBatcher } from '~/rendering/batcher/shared/DefaultBatcher';
import { InstructionSet } from '~/rendering/renderers/shared/instructions/InstructionSet';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { BatchableSprite } from '~/scene/sprite/BatchableSprite';

function createElement(x: number): BatchableSprite
{
    const element = new BatchableSprite();

    element.renderable = new Container();
    element.texture = Texture.WHITE;
    element.transform = new Matrix(1, 0, 0, 1, x, 0);
    element.bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10 };

    return element;
}

describe('Batcher updates', () =>
{
    it.each([0, 1])('should ignore stale element %i and still update re-added elements', (staleIndex) =>
    {
        const batcher = new DefaultBatcher({ maxTextures: 1 });
        const elements = [createElement(10), createElement(20)];

        batcher.begin();

        for (const element of elements)
        {
            batcher.add(element);
        }

        batcher.finish(new InstructionSet());

        for (const element of elements)
        {
            element.transform.tx += 100;
            batcher.dirty = false;
            batcher.updateElement(element);

            expect(batcher.attributeBuffer.float32View[element._attributeStart]).toBe(element.transform.tx);
            expect(batcher.dirty).toBe(true);
        }

        const stale = elements[staleIndex];
        const replacement = createElement(30);

        batcher.begin();
        batcher.add(replacement);
        batcher.finish(new InstructionSet());

        expect(elements[0]._attributeStart).toBe(replacement._attributeStart);

        const before = batcher.attributeBuffer.float32View.slice();

        stale.transform.tx += 100;
        batcher.dirty = false;
        batcher.updateElement(stale);

        expect(batcher.attributeBuffer.float32View).toEqual(before);
        expect(batcher.dirty).toBe(false);

        batcher.add(stale);
        batcher.finish(new InstructionSet());
        stale.transform.tx += 100;
        batcher.dirty = false;
        batcher.updateElement(stale);

        expect(batcher.attributeBuffer.float32View[stale._attributeStart]).toBe(stale.transform.tx);
        expect(batcher.dirty).toBe(true);
        expect(batcher.attributeBuffer.float32View.slice(0, replacement.attributeSize * batcher.vertexSize))
            .toEqual(before.slice(0, replacement.attributeSize * batcher.vertexSize));

        batcher.destroy();
        elements.forEach((element) => element.renderable.destroy());
        replacement.renderable.destroy();
    });
});
