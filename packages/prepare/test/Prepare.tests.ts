import { Prepare } from '@pixi/prepare';
import { Renderer, Texture } from '@pixi/core';
import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { expect } from 'chai';

describe('Prepare', function ()
{
    it('should upload graphics vao and textures', function ()
    {
        const renderer = new Renderer({ width: 1, height: 1 });
        const prepare = new Prepare(renderer);
        const { CONTEXT_UID } = renderer;

        try
        {
            const graphics = new Graphics();
            const container = new Container();
            const canvas = document.createElement('canvas');
            const texture = Texture.from(canvas);
            const vaos = graphics.geometry.glVertexArrayObjects;

            canvas.width = 10;
            canvas.height = 10;
            texture.update();

            graphics.beginFill(0xffffff, 1.0);
            graphics.drawRect(0, 0, 10, 10);
            graphics.beginTextureFill({ texture });
            graphics.drawRect(20, 20, 10, 10);
            graphics.geometry.isBatchable = function () { return false; };
            container.addChild(graphics);

            prepare.add(container);
            prepare.prepareItems();

            expect(Object.keys(texture.baseTexture._glTextures)).to.eql([`${CONTEXT_UID}`]);
            expect(graphics.geometry.batches.length).to.equal(2);
            expect(vaos[CONTEXT_UID]).to.exist;
            expect(Object.keys(vaos[CONTEXT_UID]).length).to.equal(2); // [shader_id] and [signature]
        }
        finally
        {
            renderer.destroy();
            prepare.destroy();
        }
    });
});
